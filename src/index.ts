import puppeteer from 'puppeteer';

import { accounts } from './accounts';
import {
  goHome,
  attendNegotiations,
  notifyAboutCollections,
  runElevator,
  runManager,
  produceToys,
} from './tasks';

await Promise.all(
  accounts.map(async (account) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultTimeout(5000);

    await page.goto('https://nebo.mobi', { waitUntil: 'domcontentloaded' });
    await page.locator('a ::-p-text(Вход)').click();
    await page.locator('input[name="login"]').fill(account.username);
    await page.locator('input[name="password"]').fill(account.password);
    await page.locator('input[value="Вход"]').click();
    await goHome(page, account.username);

    while (true) {
      try {
        // await produceToys(page, account.username);
        await runManager(page, account.username);
        // await attendNegotiations(page, account.username);
        await runElevator(page, account.username, { stopOnCitizen: true, stopOnVIP: true });
        await notifyAboutCollections(page, account.username);

        await new Promise((resolve) => setTimeout(resolve, 30000));

        await page.reload();
        console.log(`🔃 Перезавантажено сторінку`);
        await goHome(page, account.username);
      } catch (error) {
        console.error(`❌ Помилка в юзера ${account.username}, ${new Date().toISOString()}`, error);
        await goHome(page, account.username);
      }
    }
  }),
);
