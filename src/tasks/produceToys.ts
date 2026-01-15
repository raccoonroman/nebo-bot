import type { Page } from 'puppeteer';

import { goHome } from './goHome';

export const produceToys = async (page: Page, username: string) => {
  await goHome(page, username);
  const fabricSelector = 'a[href="fabric"]';
  const hasReadyToys = await page.$eval(fabricSelector, (link) => {
    const div = link.querySelector('div.cntr.nshd');
    return div && div.textContent.trim() === 'Есть готовый инвентарь!';
  });
  if (hasReadyToys) {
    try {
      await page.locator(fabricSelector).click();
      await page.locator(`a::-p-text(Забрать все)`).click();
      await page.locator(`a::-p-text(Запустить все)`).click();
      console.log(`✅ Всі іграшки для ${username} вироблені, ${new Date().toISOString()}`);
    } catch {
      console.error(`❌ Помилка при виробництві іграшок для ${username}`);
    } finally {
      await goHome(page, username);
    }
  }
};
