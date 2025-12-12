import type { Page } from 'puppeteer';
import { goHome } from './goHome';

export const runElevator = async (
  page: Page,
  username: string,
  options: {
    stopOnCitizen: boolean;
    stopOnVIP: boolean;
  },
) => {
  const liftSelector = 'a.tdn[href="lift"]';
  const visitorsAmountHandler = (el: HTMLSpanElement) => el.textContent.trim();
  const noVisitorsSelector = await page.$(`${liftSelector} img[src$="/tb_lift2.png"]`);
  const visitorsAmountSelector = await page.$(`${liftSelector} .amount span`);

  if (noVisitorsSelector) {
    console.log(`❌ Відвідувачів немає для ${username}`);
    return;
  }
  if (
    visitorsAmountSelector &&
    Number(await page.evaluate(visitorsAmountHandler, visitorsAmountSelector)) <= 20
  ) {
    console.log(`⌛ Трохи почекаємо, коли відвідувачів буде більше 20 для ${username}`);
    return;
  }
  await page.locator(liftSelector).click();

  while (true) {
    try {
      const liftSelector = await page.waitForSelector(`.lift a.tdu[href]`);
      const vipSelector = await page.$('.lift .vip');
      const floorSelector = await page.$('.lift a.tdu span');
      const floorValue = await floorSelector?.evaluate((el) => el.textContent.trim());
      if (vipSelector && options.stopOnVIP) {
        console.log(`✅ VIP для ${username} знайдений`);
        await goHome(page, username);
        break;
      } else if (floorValue === '1' && options.stopOnCitizen) {
        console.log(`✅ Новий житель для ${username} знайдений`);
        await goHome(page, username);
        break;
      } else {
        await liftSelector?.click();
        await liftSelector?.dispose();
      }
    } catch (error) {
      console.log(`✅ Всі відвідувачі для ${username} розвезені`);
      await goHome(page, username);
      break;
    }
  }
};
