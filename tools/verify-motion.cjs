/* Regression checks for unchanged selections and the 3D scene's scroll lifecycle. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {chromium} = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const root = path.resolve(__dirname, '..');
const url = pathToFileURL(path.join(root, 'index.html')).href;
const results = [];
(async () => {
  const browser = await chromium.launch({executablePath:process.env.CHROME_PATH || '/usr/bin/google-chrome', headless:true, args:['--no-sandbox']});
  try {
    for (const mobile of [false, true]) {
      const context = await browser.newContext({viewport:mobile ? {width:375,height:812} : {width:1440,height:1000}, hasTouch:mobile, isMobile:mobile, reducedMotion:'no-preference'});
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(() => {
        window.motionCalls = 0;
        const animate = Element.prototype.animate;
        Element.prototype.animate = function (...args) { window.motionCalls++; return animate.apply(this,args); };
      });
      await page.goto(url);
      await page.evaluate(() => document.fonts.ready);
      const choose = async selector => mobile ? page.locator(selector).tap() : page.locator(selector).click();
      const stableSelection = async (control, content) => {
        await page.locator(control).scrollIntoViewIfNeeded();
        await page.waitForTimeout(1300); // Let ancestor scroll-reveals settle before hit testing.
        await choose(control);
        assert.equal(await page.locator(control).getAttribute('aria-pressed'), 'true', `Initial selection: ${control}`);
        await page.evaluate(selector => {
          window.contentMutations = 0;
          window.contentObserver?.disconnect();
          window.contentObserver = new MutationObserver(records => window.contentMutations += records.length);
          document.querySelectorAll(selector).forEach(node => window.contentObserver.observe(node,{childList:true,characterData:true,subtree:true}));
          window.motionBaseline = window.motionCalls;
        }, content);
        // Repeated clicks during AND after the first animation must leave it alone.
        await choose(control);
        await choose(control);
        await page.waitForTimeout(900);
        await choose(control);
        await page.keyboard.press('Enter');
        await page.keyboard.press('Space');
        assert.deepEqual(await page.evaluate(() => ({mutations:contentMutations,animations:motionCalls-motionBaseline})),{mutations:0,animations:0},control);
        await page.evaluate(() => contentObserver.disconnect());
      };
      await stableSelection('[data-role-node=executor]', '[data-network-caption]');
      await stableSelection('[data-method="1"]', '[data-method-detail], [data-method-step-label]');
      await stableSelection('[data-journey="2"]', '[data-journey-detail]');
      await stableSelection('[data-challenge=ambitious]', '[data-reactor-flow], [data-reactor-note]');
      await stableSelection('[data-flow-role=creative]', '[data-reactor-note], [data-network-caption]');
      // Another selection must still update content and animate; returning is a change too.
      for (const index of [2,1]) {
        const before = await page.evaluate(() => motionCalls);
        const text = await page.locator('[data-method-detail]').textContent();
        await choose(`[data-method="${index}"]`);
        assert.notEqual(await page.locator('[data-method-detail]').textContent(),text);
        assert.ok(await page.evaluate(() => motionCalls) > before);
      }
      if (mobile) await choose('[data-menu-toggle]');
      await choose('[data-language-toggle]');
      assert.equal(await page.locator('html').getAttribute('lang'),'en');
      assert.match(await page.locator('[data-method-detail]').textContent(),/Screen designs/);
      assert.equal(await page.locator('[data-method="1"]').getAttribute('aria-pressed'),'true');
      assert.equal(await page.locator('[data-flow-role=creative]').getAttribute('aria-pressed'),'true');
      assert.match(await page.locator('[data-reactor-note]').textContent(),/[A-Za-z]/);
      if (mobile) await choose('[data-menu-toggle]');
      // Restore FA before capturing the scene.
      if (mobile) await choose('[data-menu-toggle]');
      await choose('[data-language-toggle]');
      if (mobile) await choose('[data-menu-toggle]');
      await choose('[data-role-node=executor]');
      await page.mouse.move(0,0);
      await page.waitForTimeout(1900);
      const network = page.locator('[data-network]');
      const assertSameScene = async (first, second, message) => {
        const delta = await page.evaluate(async sources => {
          const pixels = await Promise.all(sources.map(async source => {
            const image = new Image();
            image.src = 'data:image/png;base64,' + source;
            await image.decode();
            const canvas = document.createElement('canvas');
            canvas.width = image.width; canvas.height = image.height;
            const ctx = canvas.getContext('2d'); ctx.drawImage(image,0,0);
            return ctx.getImageData(0,0,canvas.width,canvas.height).data;
          }));
          if (pixels[0].length !== pixels[1].length) return {max:255,fraction:1};
          let max = 0, changed = 0;
          for (let i=0;i<pixels[0].length;i+=4) {
            const difference = Math.max(...[0,1,2].map(c => Math.abs(pixels[0][i+c]-pixels[1][i+c])));
            max = Math.max(max,difference); if (difference) changed++;
          }
          return {max,fraction:changed/(pixels[0].length/4)};
        },[first.toString('base64'),second.toString('base64')]);
        // Allow only tiny rasterization rounding differences on anti-aliased edges.
        assert.ok(delta.max <= 4 && delta.fraction < .001, message + JSON.stringify(delta));
      };
      await network.scrollIntoViewIfNeeded();
      const sceneScroll = await page.evaluate(() => scrollY);
      const before = await network.screenshot({path:path.join(root,'qa',`logo-baseline-${mobile?'mobile':'desktop'}.png`)});
      for (let i=0;i<5;i++) {
        await page.evaluate(() => scrollTo({top:document.body.scrollHeight,behavior:'instant'}));
        await page.waitForTimeout(100);
        await network.scrollIntoViewIfNeeded();
        await page.waitForTimeout(100);
      }
      await page.evaluate(top => scrollTo({top,behavior:'instant'}), sceneScroll);
      await page.waitForTimeout(900);
      const after = await network.screenshot({path:path.join(root,'qa',`logo-scroll-${mobile?'mobile':'desktop'}.png`)});
      await assertSameScene(before, after, 'Settled logo must remain visually identical after repeated scrolling: ');
      assert.equal(await page.locator('.sculpture').evaluate(node => node.getAnimations({subtree:true}).length),0,'No lingering assembly animation');
      // Leave during initial assembly and return: it must settle to the same geometry.
      await page.reload();
      await network.scrollIntoViewIfNeeded();
      await page.waitForFunction(() => document.querySelector('[data-network]').classList.contains('scene-entered'));
      await page.evaluate(() => scrollTo({top:document.body.scrollHeight,behavior:'instant'}));
      await page.waitForTimeout(1800);
      await choose('[data-role-node=executor]');
      await page.mouse.move(0,0);
      await page.evaluate(top => scrollTo({top,behavior:'instant'}), sceneScroll);
      await page.waitForTimeout(1600);
      await assertSameScene(after, await network.screenshot(), 'Leaving during entrance must not corrupt final geometry: ');
      await page.emulateMedia({reducedMotion:'reduce'});
      await choose('[data-role-node=analyst]');
      assert.equal(await page.locator('.sculpture').evaluate(node => node.getAnimations({subtree:true}).length),0);
      assert.deepEqual(errors,[]);
      results.push({device:mobile?'touch':'desktop',duplicateSelections:'no mutations or new animations',changedSelections:'animate',translation:'preserved selection and updated text',scroll:'visually identical after five round trips and interrupted entrance',reducedMotion:'no scene animations',errors});
      console.log('PASS:', results.at(-1));
      await context.close();
    }
    fs.writeFileSync(path.join(root,'qa','motion-verification.json'),JSON.stringify(results,null,2));
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});
