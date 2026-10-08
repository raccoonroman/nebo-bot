import type { Page } from 'playwright';
import { goHome } from './goHome';

export const produceToys = async (page: Page, username: string) => {
  await page.locator('a[href*="fabric"]').click();
  const exchangeAllLink = page.getByRole('link', { name: 'Забрать все' });
  if (await exchangeAllLink.isVisible()) {
    await exchangeAllLink.click();
  }
  const startAllLink = page.getByRole('link', { name: 'Запустить все' });
  if (await startAllLink.isVisible()) {
    await startAllLink.click();
  }
  console.log(`🧸 Всі іграшки для ${username} вироблені`);
  await goHome(page);
};
