import { type Browser, chromium } from 'playwright';

import { accounts } from './accounts';
import {
  attendNegotiations,
  bring25Residents,
  findVipTask,
  goHome,
  notifyAboutCollections,
  produceToys,
  runElevator,
  runManager,
} from './tasks';
import { waitSeconds } from './utils';

const runAccount = async (account: (typeof accounts)[number]) => {
  const { username, password } = account;

  while (true) {
    let browser: Browser | null = null;
    try {
      browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto('https://nebo.mobi');
      await page.getByRole('link', { name: 'Вход' }).click();
      await page.locator('input[name="login"]').fill(username);
      await page.locator('input[name="password"]').fill(password);
      await page.getByRole('button', { name: 'Вход' }).click();
      await goHome(page);
      console.log(`✅ Успішний вхід для юзера ${username}`);

      while (true) {
        // await produceToys(page, username);
        // await runManager(page, username);
        // await bring25Residents(page, username);
        // await findVipTask(page, username, ['Баксы у инвесторов']);
        // await attendNegotiations(page, username);
        // await notifyAboutCollections(page, account.type);
        await runElevator(page, username, {
          waitForMinimumVisitors: 10,
          stopOnCitizen: true,
          evictWeakResidents: true,
          stopOnVIP: false,
          passOnlyBuyerVIP: true,
        });

        await waitSeconds(1);
        console.log(`⏳ Трохи чекаємо`);
        await goHome(page);
      }
    } catch (error) {
      console.error(`⛔ Акаунт ${username} впав`, error);
      await waitSeconds(10);
    } finally {
      await browser?.close().catch(() => {});
    }
  }
};

for (const account of accounts) {
  runAccount(account);
}
