// Optional PDF export. The website itself has no package dependencies.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const { pathToFileURL } = require("node:url");
const path = require("node:path");
const fs = require("node:fs");
(async () => {
  const root = path.resolve(__dirname, "..");
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox"],
  });
  try {
    for (const language of ["FA", "EN"]) {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(path.join(root, language === "FA" ? "portfolio.html" : "portfolio-en.html")).href);
    await page.evaluate(() => document.fonts.ready);
    fs.mkdirSync(path.join(root, "output/pdf"), { recursive: true });
    await page.pdf({
      path: path.join(root, `output/pdf/RAHIN-Team-Portfolio-${language}.pdf`),
      format: "A4",
      preferCSSPageSize: true,
      printBackground: true,
    });
    await page.close();
    }
  } finally {
    await browser.close();
  }
})();
