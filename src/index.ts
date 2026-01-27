import { chromium } from 'playwright';

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

accounts.map(async (account) => {
  const { username, password } = account;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://nebo.mobi');
  await page.getByRole('link', { name: 'Вход' }).click();
  await page.locator('input[name="login"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Вход' }).click();
  await goHome(page);

  while (true) {
    try {
      // await produceToys(page, username);
      // await runManager(page, username);
      // await bring25Residents(page, username);
      // await findVipTask(page, username, [
      //   'Баксы у инвесторов',
      //   'Инвесторы',
      //   'Набери опыт',
      //   'Заработай баксы',
      // ]);
      // await attendNegotiations(page, username);
      await runElevator(page, username, {
        waitForMinimumVisitors: 10,
        stopOnCitizen: true,
        evictWeakResidents: true,
        stopOnVIP: true,
        passOnlyBuyerVIP: false,
      });
      // await notifyAboutCollections(page, username, account.type);

      await new Promise((resolve) => setTimeout(resolve, 3 * 1000));
      await page.reload();
      console.log(`🔃 Перезавантажено сторінку`);
      await goHome(page);
    } catch (error) {
      console.error(`❌ Помилка в юзера ${username}, ${new Date().toISOString()}`, error);
    } finally {
      await goHome(page);
    }
  }
});
