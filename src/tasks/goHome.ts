import type { Page } from 'playwright';

export const goHome = async (page: Page, username: string) => {
  await page.locator('.hdr .ttl').click();
  await page.locator('.footer').last().waitFor({ state: 'visible' });
  console.log(`🔙 Повернулись на головну сторінку для ${username}`);
};
