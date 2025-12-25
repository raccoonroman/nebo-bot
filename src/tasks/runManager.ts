import type { Page } from 'puppeteer';
import { goHome } from './goHome';

export const runManager = async (page: Page, username: string) => {
  while (true) {
    try {
      const linkToAllFloorsSelector = 'a.tdn[href*="floors/"]';
      const linkToAllFloors = await page.waitForSelector(linkToAllFloorsSelector);
      const iconSrc = await page.$eval(`${linkToAllFloorsSelector} img`, (img) =>
        img.getAttribute('src'),
      );
      const taskAction = iconSrc?.includes('sold')
        ? 'Собрать выручку!'
        : iconSrc?.includes('stocked')
          ? 'Выложить товар'
          : 'Закупить товар';
      await linkToAllFloors?.click();
      await linkToAllFloors?.dispose();

      while (true) {
        try {
          const firstFloorLink = await page.waitForSelector(`a::-p-text(${taskAction})`);
          await firstFloorLink?.click();
          await firstFloorLink?.dispose();

          if (taskAction === 'Закупить товар') {
            const buySelector = 'a.tdu ::-p-text(Закупить за)';
            await page.waitForSelector(buySelector);
            const allLinks = await page.$$(buySelector);
            await allLinks.at(-1)?.click();
          }
        } catch {
          console.log(`✅ Завдання для ${username} '${taskAction}' виконано`);
          await goHome(page, username);
          break;
        }
      }
    } catch {
      console.log(`⌛ поки немає ні одного завдання в ${username}`);
      await goHome(page, username);
      return;
    }
  }
};
