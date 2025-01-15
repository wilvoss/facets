const puppeteer = require('puppeteer');

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`Error on page: ${msg.text()}`);
      }
    });

    // Navigate to the URL
    await page.goto('https://facets.bigtentgames.com/generate.html?generated=true');

    await new Promise((resolve) => setTimeout(resolve, 60000)); // Increased wait time
    await page.reload();

    console.log('Script executed successfully');
  } catch (error) {
    console.error('Error during script execution:', error);
    process.exit(1); // Ensure GitHub Action fails in case of error
  } finally {
    if (browser) {
      await browser.close(); // Close the browser to ensure script exits
    }
  }
})();
