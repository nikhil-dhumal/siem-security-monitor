import chrome from 'selenium-webdriver/chrome.js';
import { Builder, By, until } from 'selenium-webdriver';
import 'chromedriver';

async function run() {
  const options = new chrome.Options();
  options.addArguments('--headless=new');
  options.addArguments('--disable-gpu');
  options.addArguments('--window-size=1280,800');

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  try {
    await driver.get('http://localhost:5173');
    await driver.wait(until.titleContains('SIEM'), 10000);
    const title = await driver.getTitle();
    console.log('Page title:', title);

    const root = await driver.wait(until.elementLocated(By.id('root')), 10000);
    if (!root) {
      throw new Error('Root element not found');
    }

    const bodyText = await driver.findElement(By.css('body')).getText();
    console.log('Body text length:', bodyText.length);
    console.log('Selenium smoke test passed');
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});