/* Optional developer regression checks. The website itself needs no Node packages. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const root = path.resolve(__dirname, "..");
const report = { layouts: [], interactions: [], errors: [], accessibility: [] };
const record = (label) => {
  report.interactions.push(label);
  console.log("PASS:", label);
};
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  page.on("pageerror", (e) => report.errors.push(e.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") report.errors.push(msg.text());
  });
  await page.goto(pathToFileURL(path.join(root, "index.html")).href);
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator(".person-card").count(), 6);
  assert.equal(await page.locator(".role-panel").count(), 5);
  assert.equal(await page.locator("#cases,.case-card,[data-case]").count(), 0);
  assert.equal(await page.locator("html").getAttribute("lang"), "fa");
  assert.equal(await page.locator("[data-method]").count(), 4);
  record("Direct file:// startup and all data sections");
  for (const lang of ["en", "fa"]) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    if ((await page.locator("html").getAttribute("lang")) !== lang)
      await page.locator("[data-language-toggle]").click();
    assert.equal(await page.locator("[data-i18n]").evaluateAll(nodes => nodes.some(n => !n.textContent.trim())), false, "Every translated label has content");
    for (const width of [1440, 1200, 992, 768, 480, 375, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
      );
      const measurements = await page.evaluate(() => ({
        width: innerWidth,
        document: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
        broken: [...document.images]
          .filter((i) => i.complete && !i.naturalWidth)
          .map((i) => i.src),
        nodes: [...document.querySelectorAll(".role-node")].map((e) => {
          const r = e.getBoundingClientRect();
          return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
        }),
      }));
      assert.ok(
        measurements.document <= measurements.client,
        `${lang}/${width} horizontal overflow: ${JSON.stringify(measurements)}`,
      );
      assert.deepEqual(
        measurements.broken,
        [],
        `${lang}/${width} missing images`,
      );
      assert.ok(
        measurements.nodes.every((r) => r.left >= 0 && r.right <= width),
        `${lang}/${width} cropped diagram`,
      );
      for (let i = 0; i < measurements.nodes.length; i++)
        for (let j = i + 1; j < measurements.nodes.length; j++) {
          const a = measurements.nodes[i],
            b = measurements.nodes[j];
          assert.ok(
            a.right <= b.left ||
              b.right <= a.left ||
              a.bottom <= b.top ||
              b.bottom <= a.top,
            `${lang}/${width} diagram nodes overlap`,
          );
        }
      report.layouts.push({
        lang,
        width,
        overflow: false,
        diagramOverlap: false,
      });
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator("[data-challenge=ambitious]").click();
    assert.equal(
      await page
        .locator("[data-challenge=ambitious]")
        .getAttribute("aria-pressed"),
      "true",
    );
    assert.equal(
      await page
        .locator("[data-flow-role]")
        .first()
        .getAttribute("data-flow-role"),
      "visionary",
    );
    await page.locator("[data-challenge=messy]").click();
    assert.equal(
      await page
        .locator("[data-flow-role]")
        .first()
        .getAttribute("data-flow-role"),
      "coordinator",
    );
    await page.locator("[data-flow-role=analyst]").click();
    assert.ok(
      (await page.locator("[data-reactor-note]").textContent()).length > 30,
    );
    assert.equal(await page.locator('[data-member],.person-footer').count(), 0);
    for (const profile of await page.locator('.person-card').all()) {
      assert.ok((await profile.locator('.person-contribution').textContent()).length > 60);
    }
    const brief = page.locator('[data-brief-open]');
    await brief.click();
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.locator('[data-brief-form] button').evaluate(e => e === document.activeElement), true);
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('[data-modal-close]').evaluate(e => e === document.activeElement), true);
    await page.keyboard.press('Escape');
    assert.equal(await brief.evaluate(e => e === document.activeElement), true);
    await brief.click();
    await page.mouse.click(5,5);
    assert.equal(await page.locator('dialog').evaluate(d => d.open), false);
    const pdfLink = page.locator('[data-contact-links] a');
    const pdfFile = `RAHIN-Team-Portfolio-${lang.toUpperCase()}.pdf`;
    assert.equal(await pdfLink.getAttribute('href'), `output/pdf/${pdfFile}`);
    assert.equal(fs.readFileSync(path.join(root, 'output/pdf', pdfFile)).subarray(0,4).toString(), '%PDF');
    await page.locator('[data-method="2"]').click();
    assert.equal(
      await page.locator('[data-method="2"]').getAttribute("aria-pressed"),
      "true",
    );
    await page.locator('[data-journey="5"]').click();
    assert.equal(
      await page.locator('[data-journey="5"]').getAttribute("aria-pressed"),
      "true",
    );
    record(
      `${lang}: reactor, 6 inline profiles without redundant buttons, language-specific PDFs, form focus return, Escape, backdrop, method, journey`,
    );
    if (process.env.AXE_PATH) {
      const audit = await context.newPage();
      await audit.goto("http://localhost:4173");
      await audit.setViewportSize({ width: 1440, height: 1000 });
      if ((await audit.locator("html").getAttribute("lang")) !== lang)
        await audit.locator("[data-language-toggle]").click();
      await audit.addScriptTag({ path: process.env.AXE_PATH });
      const results = await audit.evaluate(async () => {
        const result = await axe.run(document, {
          runOnly: {
            type: "tag",
            values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"],
          },
        });
        return result.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        }));
      });
      report.accessibility.push({ lang, violations: results });
      await audit.close();
    }
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForFunction(() => document.querySelector(".nav-menu").inert);
  assert.equal(await page.locator(".nav-menu").evaluate((e) => e.inert), true);
  await page.locator("[data-menu-toggle]").click();
  assert.equal(await page.locator(".nav-menu").evaluate((e) => e.inert), false);
  await page.keyboard.press("Escape");
  assert.equal(await page.locator(".nav-menu").evaluate((e) => e.inert), true);
  await page.locator("[data-menu-toggle]").click();
  await page.locator("[data-nav=method]").click();
  assert.equal(
    await page.locator("[data-menu-toggle]").getAttribute("aria-expanded"),
    "false",
  );
  record(
    "Mobile menu open, Escape close, navigation close, hidden-menu focus exclusion",
  );
  await page.locator("[data-brief-open]").click();
  await page.locator("[name=problem]").fill("A shared system for six people");
  await page.locator("[name=audience]").fill("The RAHIN team");
  const downloadPromise = page.waitForEvent("download");
  await page.locator("[data-brief-form] button").click();
  const download = await downloadPromise;
  const downloaded = await download.path();
  assert.ok(
    fs
      .readFileSync(downloaded, "utf8")
      .includes("A shared system for six people"),
  );
  await page.keyboard.press("Escape");
  record("Brief form validates and downloads a local UTF-8 file");
  await page.reload();
  assert.equal(await page.locator("html").getAttribute("lang"), "fa");
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('[data-language-toggle]').click();
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  await page.locator('[data-language-toggle]').click();
  record("Persian default, explicit English and Persian preferences survive reload");
  await context.setOffline(true);
  await page.reload();
  assert.equal(await page.locator(".person-card").count(), 6);
  assert.equal(
    await page.evaluate(() => document.fonts.check("16px Vazirmatn")),
    true,
  );
  record("Offline file:// rendering with local fonts");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => scrollTo(0, 0));
  fs.mkdirSync(path.join(root, "qa"), { recursive: true });
  await page.screenshot({
    path: path.join(root, "qa", "rahin-desktop-fa.png"),
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: path.join(root, "qa", "rahin-mobile-fa.png") });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator("[data-language-toggle]").click();
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: path.join(root, "qa", "rahin-desktop-en.png"),
  });
  await page.screenshot({
    path: path.join(root, "qa", "rahin-full-en.png"),
    fullPage: true,
  });
  await page.locator("[data-nav=method]").click();
  await page.screenshot({ path: path.join(root, "qa", "rahin-method.png") });
  const denied = await browser.newContext({ reducedMotion: "reduce" });
  await denied.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Blocked", "SecurityError");
      },
    }),
  );
  const fallback = await denied.newPage();
  await fallback.goto(pathToFileURL(path.join(root, "index.html")).href);
  assert.equal(await fallback.locator(".person-card").count(), 6);
  assert.equal(await fallback.locator("html").getAttribute("lang"), "fa");
  await fallback.locator("[data-language-toggle]").click();
  assert.equal(await fallback.locator("html").getAttribute("lang"), "en");
  record("Blocked storage does not break startup or language switching");
  const motionPage = await context.newPage();
  await motionPage.emulateMedia({ reducedMotion: "no-preference" });
  await motionPage.goto(pathToFileURL(path.join(root, "index.html")).href);
  await motionPage.setViewportSize({ width: 1440, height: 1000 });
  await motionPage.locator("[data-network]").hover({ position: { x: 100, y: 200 } });
  await motionPage.waitForFunction(() => document.querySelector(".sculpture").style.getPropertyValue("--tilt-x") !== "");
  assert.equal(await motionPage.locator('[data-motion-toggle]').count(), 0);
  assert.equal(await motionPage.locator('html').getAttribute('data-motion'), 'on');
  await motionPage.emulateMedia({ reducedMotion: "reduce" });
  await motionPage.waitForFunction(() => document.documentElement.dataset.motion === "off");
  assert.equal(await motionPage.locator('.sculpture').evaluate(e => e.style.getPropertyValue('--tilt-x')), '');
  await motionPage.emulateMedia({ reducedMotion: 'no-preference' });
  await motionPage.waitForFunction(() => document.documentElement.dataset.motion === 'on');
  await motionPage.close();
  record("3D enabled without toggle, responds to pointer and respects dynamic reduced motion");
  const touch = await browser.newContext({ viewport: {width:375,height:812}, isMobile:true, hasTouch:true, reducedMotion:'no-preference' });
  const phone = await touch.newPage();
  phone.on('pageerror', e => report.errors.push(e.message));
  await phone.goto(pathToFileURL(path.join(root, 'index.html')).href);
  await phone.locator('[data-network]').scrollIntoViewIfNeeded();
  await phone.waitForFunction(() => document.querySelector('[data-network]').classList.contains('scene-entered'));
  await phone.locator('[data-role-node=creative]').tap();
  assert.equal(await phone.locator('[data-role-node=creative]').getAttribute('aria-pressed'), 'true');
  assert.equal(await phone.locator('.sculpture-object').evaluate(e => e.getAnimations().some(a => a.playState === 'running')), true);
  for (let stage=0;stage<4;stage++) {
    await phone.locator(`[data-method="${stage}"]`).tap();
    assert.equal(await phone.locator('[data-method-scene]').getAttribute('data-stage'), String(stage));
  }
  await phone.emulateMedia({reducedMotion:'reduce'});
  await phone.locator('[data-role-node=analyst]').tap();
  assert.equal(await phone.locator('.sculpture-object').evaluate(e => e.getAnimations().filter(a => a.playState === 'running').length), 0);
  await phone.locator('[data-method="0"]').tap();
  assert.equal(await phone.locator('.scene-tile').first().evaluate(e => getComputedStyle(e).transitionDuration), '0s');
  await touch.close();
  record('Mobile touch animates the hero and all four steps; reduced motion keeps every action usable');
  assert.deepEqual(report.errors, []);
  fs.writeFileSync(
    path.join(root, "qa", "verification.json"),
    JSON.stringify(report, null, 2),
  );
  await browser.close();
  console.log(
    JSON.stringify(
      {
        layouts: report.layouts.length,
        checks: report.interactions.length,
        errors: report.errors,
        accessibility: report.accessibility,
      },
      null,
      2,
    ),
  );
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
