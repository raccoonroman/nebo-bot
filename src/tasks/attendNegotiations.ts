import type { Page } from 'puppeteer';
import { isWednesday, isWeekend } from 'date-fns';

import { moscowTime } from '../const';

export const attendNegotiations = async (page: Page, username: string) => {
  if (!isWeekend(moscowTime) && !isWednesday(moscowTime)) {
    return;
  }

  try {
    const startNegotiationsBtn = await page.waitForSelector('a::-p-text(Начать переговоры)', {
      timeout: 2000,
    });
    await startNegotiationsBtn?.click();
    console.log(`✅ Переговори для ${username} розпочато`);
    const talkSelector = 'a[href*="boss/wicket"]';

    const talkWithInvestors = async () => {
      while (true) {
        try {
          const taksButton = await page.waitForSelector(talkSelector, { timeout: 2000 });
          console.log(`🔁 Відповідаємо інвесторам, ${username}`);
          await taksButton?.click();
          // await taksButton.dispose();
          await new Promise((resolve) => setTimeout(resolve, 6000));
        } catch {
          console.log('✅ Переговори закінчились');
          break;
        }
      }
    };

    while (true) {
      try {
        await page.waitForSelector(talkSelector, { timeout: 2000 });
        console.log(`🎯 Розмовляємо з інвесторами, ${username}`);
        await talkWithInvestors();
        return;
      } catch {
        console.log('❌ Кнопки ще нема. Перезавантажуємо сторінку...');
        await new Promise((resolve) => setTimeout(resolve, 10000));
        await page.reload();
      }
    }
  } catch {
    console.log(`❎ Переговорів поки немає для ${username}`);
    return;
  }
};
