import type { Page } from 'playwright';
import { playSound } from '../utils';
import { goHome } from './goHome';

const isHotelAvailable = async (page: Page) => {
  const freeRoomsText = await page
    .locator('.tower > div > .rs .rs.small > span:last-of-type')
    .textContent();
  const freeRooms = Number(freeRoomsText?.trim());
  return freeRooms > 0;
};

export const ensureHotelHasFreePlace = async (page: Page) => {
  await goHome(page);
  if (await isHotelAvailable(page)) {
    return true;
  }
  await page.getByRole('link', { name: 'Гостиница' }).click();
  const weakResident = page
    .locator('.rsdst')
    .filter({ hasNot: page.locator('.abstr').getByText('9') })
    .first();
  const sameResident = page
    .locator('.rsdst')
    .filter({ has: page.locator('.major').getByText('(-)') })
    .first();
  const residentToEvict = weakResident.or(sameResident);
  if (await residentToEvict.isVisible()) {
    const residentLevel = Number((await residentToEvict.locator('.abstr').textContent())?.trim());
    const specialization = (await residentToEvict.locator('.small span').textContent())?.trim();
    await residentToEvict.getByRole('link').click();
    await page.getByRole('link', { name: 'Выселить' }).click();
    console.log(`🚪 Виселяємо з готелю жителя "${specialization} ${residentLevel}"`);
    await goHome(page);
    return true;
  } else {
    console.log(`🏨 Немає місця в готелі і немає кого виселити`);
    playSound();
    await goHome(page);
    return false;
  }
};
