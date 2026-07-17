import type { Page } from 'playwright';
import { goHome } from './goHome';

export const produceToys = async (page: Page, username: string) => {
  // треба тут заходити всередину іграшок і перевіряти чи є готові іграшки, якщо є то виробляти їх
  const fabricLink = page.locator('a[href="fabric"]');
  const fabricLinkTextContent = await fabricLink.textContent();
  const hasReadyToys = fabricLinkTextContent?.trim() === 'Есть готовые игрушки!';
  if (hasReadyToys) {
    await fabricLink.click();
    const exchangeAllLink = page.getByRole('link', { name: 'Обменять все' });
    if (await exchangeAllLink.isVisible()) {
      await exchangeAllLink.click();
    }
    await page.getByRole('link', { name: 'Запустить все' }).click();
    console.log(`🧸 Всі іграшки для ${username} вироблені`);
    await goHome(page);
  }
};
