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
    stopOnCitizen: boolean;
    stopOnVIP: boolean;
    passBuyerVIP?: boolean;
    evictWeakResidents?: boolean;
  },
) => {
  const liftHomePage = page.locator('a.tdn[href="lift"]');
  const noVisitorsSelector = liftHomePage.locator('img[src$="/tb_lift2.png"]');
  if (await noVisitorsSelector.isVisible()) {
    console.log(`❌ Всі відвідувачі вже розвезені для ${username}`);
    return;
  }
  const visitorsAmountSelector = liftHomePage.locator('.amount span');
  if (await visitorsAmountSelector.isVisible()) {
    const visitorsAmountText = await visitorsAmountSelector.textContent();
    const visitorsAmount = visitorsAmountText ? Number(visitorsAmountText.trim()) : 0;
    if (visitorsAmount <= 10) {
      console.log(`⌛ Трохи почекаємо, коли відвідувачів буде більше 10 для ${username}`);
      return;
    }
  }
  const isHotelAvailable = await checkIsHotelAvailable(page);
  await liftHomePage.click();

  while (true) {
    const lift = page.locator('.lift a.tdu[href]');
    if (await lift.isHidden()) {
      console.log(`✅ Всі відвідувачі для ${username} розвезені`);
      await goHome(page, username);
      break;
    }
    const vip = page.locator('.lift .vip');
    const buyerIcon = page.locator('.lift .ctrl img:first-child[src*="st_sell"]');
    const floorTextContent = await page.locator('.lift a.tdu span').textContent();
    const floorValue = floorTextContent ? Number(floorTextContent?.trim()) : null;
    if (options.stopOnVIP && (await vip.isVisible())) {
      console.log(`✅ VIP для ${username} знайдений`);
      if (options.passBuyerVIP && (await buyerIcon.isVisible())) {
        console.log(`➡️ Пропускаємо VIP покупця для ${username}`);
      } else {
        await goHome(page, username);
        break;
      }
    } else if (options.stopOnCitizen && floorValue === 1) {
      console.log(`✅ Новий житель для ${username} знайдений`);
      if (options.evictWeakResidents) {
        if (!isHotelAvailable) {
          console.log(`🏨 Готель уже переповнений`);
          await goHome(page, username);
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
        await goHome(page, username);
        await page.locator('a.tdn[href="lift"]').click();
        console.log(`🔄 Повертаємося до ліфта`);
        continue;
      } else {
        await goHome(page, username);
        break;
      }
    }
    await lift.click();
  }
};
