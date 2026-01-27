import { isWednesday, isWeekend } from 'date-fns';
import type { Page } from 'playwright';

import { moscowTime } from '../const';

export const attendNegotiations = async (page: Page, username: string) => {
  if (!isWeekend(moscowTime) && !isWednesday(moscowTime)) {
    return;
  }

  const startNegotiationsBtn = page.getByRole('link', { name: 'Начать переговоры' });
  if (await startNegotiationsBtn.isHidden()) {
    return;
  }
  await startNegotiationsBtn.click();
  console.log(`✅ Переговори для ${username} розпочато`);

  const talkWithInvestors = async () => {
    while (true) {
      const talk = page.locator('a[href*="boss/wicket"]').first();
      if (await talk.isVisible()) {
        await talk.click();
        console.log(`🔁 Відповідаємо інвесторам, ${username}`);
        await new Promise((resolve) => setTimeout(resolve, 6000));
      } else {
        console.log('✅ Переговори закінчились');
        break;
      }
    }
  };

  while (true) {
    const talk = page.locator('a[href*="boss/wicket"]').first();
    if (await talk.isHidden()) {
      console.log('❌ Кнопки ще нема. Перезавантажуємо сторінку...');
      await new Promise((resolve) => setTimeout(resolve, 10000));
      await page.reload();
    } else {
      console.log(`🎯 Розмовляємо з інвесторами, ${username}`);
      await talkWithInvestors();
      break;
    }
  }
};
