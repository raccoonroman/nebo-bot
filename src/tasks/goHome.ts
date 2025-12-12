import type { Page } from 'puppeteer';

export const goHome = async (page: Page, username: string) => {
  await page.locator('.hdr .ttl').click();
  await page.waitForSelector('.footer');
  console.log(`🔙 Повернулись на головну сторінку для ${username}`);
};
