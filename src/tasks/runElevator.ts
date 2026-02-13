import type { Page } from 'playwright';
import { goHome } from './goHome';

const isHotelAvailable = async (page: Page) => {
  const freeRoomsText = await page
    .locator('.tower > div > .rs .rs.small > span:last-of-type')
    .textContent();
  const freeRooms = Number(freeRoomsText?.trim());
  return freeRooms > 0;
};

const ensureHotelHasFreePlace = async (page: Page) => {
  await goHome(page);
  if (await isHotelAvailable(page)) {
    return true;
  }
  await page.getByRole('link', { name: 'Гостиница' }).click();
  const weakResident = page
    .locator('.rsdst')
    .filter({ hasNot: page.locator('.abstr').getByText('9') })
    .first();
  if (await weakResident.isVisible()) {
    const residentLevelTextContent = await weakResident.locator('.abstr').textContent();
    const residentLevel = Number(residentLevelTextContent?.trim());
    await weakResident.getByRole('link').click();
    await page.getByRole('link', { name: 'Выселить' }).click();
    console.log(`🚪 Виселяємо з готелю жителя рівня ${residentLevel}`);
    await goHome(page);
    return true;
  } else {
    console.log(`🏨 Немає місця в готелі і немає кого виселити`);
    await goHome(page);
    return false;
  }
};

export const runElevator = async (
  page: Page,
  username: string,
  options: {
    waitForMinimumVisitors?: number;
    stopOnCitizen?: boolean;
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
      if (options.stopOnVIP) {
        console.log(`✅ VIP для ${username} знайдений`);
        await goHome(page);
        break;
      }
      if (options.passOnlyBuyerVIP) {
        if (await buyerIcon.isHidden()) {
          console.log(`✅ Не VIP-покупець для ${username} знайдений`);
          await goHome(page);
          break;
        }
      }
    }
    if (floorValue === 1) {
      console.log(`✅ Новий житель для ${username} знайдений`);
      if (options.stopOnCitizen) {
        await goHome(page);
        break;
      }
      if (options.evictWeakResidents) {
        const isHotelAvailable = await ensureHotelHasFreePlace(page);
        if (isHotelAvailable) {
          await page.locator('a.tdn[href="lift"]').click();
        } else {
          break;
        }
        await page.getByRole('link', { name: 'Поднять лифт на 1 этаж' }).click();
        await page.getByRole('link', { name: 'Получить чаевые' }).click();
        await page.locator('.notify a').click();
        const resirentLevelText = await page.locator('.stat:nth-child(4) strong').textContent();
        const resirentLevel = Number(resirentLevelText?.trim());
        if (resirentLevel < 9) {
          await page.getByRole('link', { name: 'Выселить' }).click();
          console.log(`🚪 Виселяємо жителя рівня ${resirentLevel}`);
        }
        await goHome(page);
        await page.locator('a.tdn[href="lift"]').click();
        console.log(`🔄 Повертаємося до ліфта`);
        continue;
      }
    }
    await lift.click();
  }
};
