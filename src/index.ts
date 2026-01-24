import { chromium } from 'playwright';

import { accounts } from './accounts';
import {
  attendNegotiations,
  bring25Residents,
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
  await goHome(page, username);

  while (true) {
    try {
      // await produceToys(page, username);
      // await runManager(page, username);
      // await bring25Residents(page, username);
      // await attendNegotiations(page, username);
      await runElevator(page, username, {
        stopOnCitizen: true,
        stopOnVIP: true,
        passBuyerVIP: true,
        evictWeakResidents: true,
      });
      // await notifyAboutCollections(page, username, account.type);

      await new Promise((resolve) => setTimeout(resolve, 10000));
      await page.reload();
      console.log(`🔃 Перезавантажено сторінку`);
      await goHome(page, username);
    } catch (error) {
      console.error(`❌ Помилка в юзера ${username}, ${new Date().toISOString()}`, error);
    } finally {
      await goHome(page, username);
    }
  }
});
