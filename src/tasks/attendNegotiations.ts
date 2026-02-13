import { isWednesday, isWeekend } from 'date-fns';
import type { Page } from 'playwright';

import { moscowTime } from '../const';
import { waitSeconds } from '../utils';

export const attendNegotiations = async (page: Page, username: string) => {
  if (!isWeekend(moscowTime) && !isWednesday(moscowTime)) {
    return;
  }

  const startNegotiationsBtn = page.getByRole('link', { name: 'Начать переговоры' });
  if (await startNegotiationsBtn.isHidden()) {
    console.log('❌ Переговорів поки немає');
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
        await waitSeconds(6);
      } else {
        console.log(`✅ Переговори закінчились для ${username}`);
        break;
      }
    }
  };

  while (true) {
    const talk = page.locator('a[href*="boss/wicket"]').first();
    if (await talk.isHidden()) {
      console.log('❌ Кнопки ще нема. Перезавантажуємо сторінку...');
      await waitSeconds(10);
      await page.reload();
    } else {
      console.log(`🎯 Розмовляємо з інвесторами, ${username}`);
      await talkWithInvestors();
      break;
    }
  }
};
