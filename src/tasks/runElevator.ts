import type { Page } from 'playwright';
import { goHome } from './goHome';

const checkIsHotelAvailable = async (page: Page) => {
  const freeRoomsText = await page
    .locator('.tower > div > .rs .rs.small > span:last-of-type')
    .textContent();
  const freeRooms = Number(freeRoomsText?.trim());
  return freeRooms > 0;
};

export const runElevator = async (
  page: Page,
  username: string,
  options: {
    waitForMinimumVisitors?: number;
    stopOnCitizen: boolean;
    evictWeakResidents?: boolean;
    stopOnVIP?: boolean;
    passOnlyBuyerVIP?: boolean;
  },
) => {
  const liftHomePage = page.locator('a.tdn[href="lift"]');
  const noVisitorsSelector = liftHomePage.locator('img[src$="/tb_lift2.png"]');
  if (await noVisitorsSelector.isVisible()) {
    console.log(`❌ Всі відвідувачі вже розвезені для ${username}`);
    return;
  }
  if (options.waitForMinimumVisitors) {
    const visitorsAmountSelector = liftHomePage.locator('.amount span');
    if (await visitorsAmountSelector.isVisible()) {
      const visitorsAmountText = await visitorsAmountSelector.textContent();
      const visitorsAmount = visitorsAmountText ? Number(visitorsAmountText.trim()) : 0;
      if (visitorsAmount <= options.waitForMinimumVisitors) {
        console.log(
          `⌛ Трохи почекаємо поки відвідувачів буде більше ${options.waitForMinimumVisitors} для ${username}`,
        );
        return;
      }
    }
  }
  const isHotelAvailable = await checkIsHotelAvailable(page);
  await liftHomePage.click();

  while (true) {
    const lift = page.locator('.lift a.tdu[href]');
    if (await lift.isHidden()) {
      console.log(`✅ Всі відвідувачі для ${username} розвезені`);
      await goHome(page);
      break;
    }
    const vip = page.locator('.lift .vip');
    const buyerIcon = page.locator('.lift .ctrl img:first-child[src*="st_sell"]');
    const floorTextContent = await page.locator('.lift a.tdu span').textContent();
    const floorValue = floorTextContent ? Number(floorTextContent?.trim()) : null;
    if (await vip.isVisible()) {
      console.log(`✅ VIP для ${username} знайдений`);
      if (options.stopOnVIP) {
        await goHome(page);
        break;
      }
      if (options.passOnlyBuyerVIP) {
        if (await buyerIcon.isVisible()) {
          console.log(`➡️ Пропускаємо VIP покупця для ${username}`);
        } else {
          await goHome(page);
          break;
        }
      }
    }
    if (options.stopOnCitizen && floorValue === 1) {
      console.log(`✅ Новий житель для ${username} знайдений`);
      if (options.evictWeakResidents) {
        if (!isHotelAvailable) {
          console.log(`🏨 Готель уже переповнений`);
          await goHome(page);
          break;
        }
        await page.getByRole('link', { name: 'Поднять лифт на 1 этаж' }).click();
        await page.getByRole('link', { name: 'Получить чаевые' }).click();
        await page.locator('.notify a').click();
        const resirentLevelText = await page.locator('.stat:nth-child(4) strong').textContent();
        const resirentLevel = Number(resirentLevelText?.trim());
        if (resirentLevel < 9) {
          await page.getByRole('link', { name: 'Выселить' }).click();
          console.log(`🚪 Виселяємо жителя з рівнем ${resirentLevel}`);
        }
        await goHome(page);
        await page.locator('a.tdn[href="lift"]').click();
        console.log(`🔄 Повертаємося до ліфта`);
        continue;
      } else {
        await goHome(page);
        break;
      }
    }
    await lift.click();
  }
};
