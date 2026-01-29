import type { Page } from 'playwright';
import { goHome } from './goHome';

export const runManager = async (page: Page, username: string) => {
  while (true) {
    const linkToAllFloors = page.locator('.tlbr a.tdn[href*="floors/"]');
    if (await linkToAllFloors.isHidden()) {
      console.log(`⌛ поки немає ні одного завдання в ${username}`);
      await goHome(page);
      return;
    }
    const iconSrc = await linkToAllFloors.locator('img').getAttribute('src');
    const taskAction = iconSrc?.includes('sold')
      ? 'Собрать выручку!'
      : iconSrc?.includes('stocked')
        ? 'Выложить товар'
        : 'Закупить товар';

    await linkToAllFloors.click();

    while (true) {
      const firstFloorLink = page.getByText(taskAction, { exact: true }).first();
      if (await firstFloorLink.isVisible()) {
        await firstFloorLink.click();
        if (taskAction === 'Закупить товар') {
          await page.locator('a.tdu', { hasText: 'Закупить за' }).last().click();
        }
      } else {
        console.log(`💲 Завдання для ${username} '${taskAction}' виконано`);
        await goHome(page);
        break;
      }
    }
  }
};
