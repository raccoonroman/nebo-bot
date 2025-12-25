import type { Page } from 'puppeteer';
import { goHome } from './goHome';

const checkIsHotelAvailable = async (page: Page) => {
  const freeRooms = await page.$eval('.tower > div > .rs .rs.small > span:last-of-type', (el) =>
    Number(el.textContent.trim()),
  );

  return freeRooms > 0;
};

export const runElevator = async (
  page: Page,
  username: string,
  options: {
    stopOnCitizen: boolean;
    stopOnVIP: boolean;
    passBuyerVIP?: boolean;
    evictWeakResidents?: boolean;
  },
) => {
  const isHotelAvailable = await checkIsHotelAvailable(page);
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
    Number(await page.evaluate(visitorsAmountHandler, visitorsAmountSelector)) <= 15
  ) {
    console.log(`⌛ Трохи почекаємо, коли відвідувачів буде більше 15 для ${username}`);
    return;
  }
  await page.locator(liftSelector).click();

  while (true) {
    try {
      const liftSelector = await page.waitForSelector(`.lift a.tdu[href]`);
      const vipSelector = await page.$('.lift .vip');
      const isBuyer = await page.$('.lift .ctrl img:first-child[src*="st_sell"]');
      const floorSelector = await page.$('.lift a.tdu span');
      const floorValue = await floorSelector?.evaluate((el) => el.textContent.trim());
      if (vipSelector && options.stopOnVIP) {
        console.log(`✅ VIP для ${username} знайдений`);
        if (isBuyer && options.passBuyerVIP) {
          console.log(`➡️ Пропускаємо VIP покупця для ${username}`);
        } else {
          await goHome(page, username);
          break;
        }
      } else if (floorValue === '1' && options.stopOnCitizen) {
        console.log(`✅ Новий житель для ${username} знайдений`);
        if (options.evictWeakResidents) {
          if (!isHotelAvailable) {
            console.log(`🏨 Готель уже переповнений`);
            await goHome(page, username);
            break;
          }
          await liftSelector?.click();
          await liftSelector?.dispose();
          await page.locator(`.lift a.tdu[href]`).click();
          await page.locator('.notify a').click();
          await page.locator('.stat:nth-child(4) strong').wait();
          const resirentLevel = await page.$eval('.stat:nth-child(4) strong', (el) =>
            Number(el.textContent?.trim()),
          );
          if (resirentLevel < 9) {
            await page.locator('a.btnr').click();
            console.log(`🚪 Виселяємо жителя з рівнем ${resirentLevel}`);
          }
        }
        await goHome(page, username);
        break;
      }
      await liftSelector?.click();
      await liftSelector?.dispose();
    } catch {
      console.log(`✅ Всі відвідувачі для ${username} розвезені`);
      await goHome(page, username);
      break;
    }
  }
};
