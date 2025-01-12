const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://facets.bigtentgames.com/generate.html?generated=true');

  await new Promise((resolve) => setTimeout(resolve, 120000));

  await page.reload();

  await new Promise((resolve) => setTimeout(resolve, 30000));

  await browser.close();
})();
