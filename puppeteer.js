const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  // Navigate to the URL
  await page.goto('https://facets.bigtentgames.com/generate.html?generated=true');

  // Wait for 2 minutes
  await new Promise((resolve) => setTimeout(resolve, 20000));

  // Reload the page
  await page.reload();

  // Wait for 30 seconds
  await new Promise((resolve) => setTimeout(resolve, 10000));

  await browser.close();
})();
