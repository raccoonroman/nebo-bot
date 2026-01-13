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
  await goHome(page, username);
  const isHotelAvailable = await checkIsHotelAvailable(page);
  const liftHomePageSelector = 'a.tdn[href="lift"]';
  const noVisitorsSelector = await page.$(`${liftHomePageSelector} img[src$="/tb_lift2.png"]`);
  const visitorsAmount = await page
    .$eval(`${liftHomePageSelector} .amount span`, (el) => Number(el.textContent?.trim()))
    .catch(() => null);

  if (noVisitorsSelector) {
    console.log(`❌ Всі відвідувачі вже розвезені для ${username}`);
    return;
  }
  if (visitorsAmount && visitorsAmount <= 10) {
    console.log(`⌛ Трохи почекаємо, коли відвідувачів буде більше 10 для ${username}`);
    return;
  }
  await page.locator(liftHomePageSelector).click();

  while (true) {
    try {
      await page.locator('.footer').wait();
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
          await page.locator('.lift a.tdu[href]').click();
          await page.locator('.lift a.tdu[href]').click();
          await page.locator('.notify a').click();
          await page.locator('.stat:nth-child(4) strong').wait();
          const resirentLevel = await page.$eval('.stat:nth-child(4) strong', (el) =>
            Number(el.textContent?.trim()),
          );
          if (resirentLevel < 9) {
            await page.locator('a.btnr').click();
            console.log(`🚪 Виселяємо жителя з рівнем ${resirentLevel}`);
          }
          await goHome(page, username);
          await page.locator(liftHomePageSelector).click();
          console.log(`🔄 Повертаємося до ліфта`);
          continue;
        } else {
          await goHome(page, username);
          break;
        }
      }
      await page.locator('.lift a.tdu[href]').click();
    } catch {
      console.log(`✅ Всі відвідувачі для ${username} розвезені`);
      await goHome(page, username);
      break;
    }
  }
};
