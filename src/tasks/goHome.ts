import type { Page } from 'playwright';

export const goHome = async (page: Page) => {
  await page.locator('.hdr .ttl').click();
  await page.locator('.footer').last().waitFor({ state: 'visible' });
};
