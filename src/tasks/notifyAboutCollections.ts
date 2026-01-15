import { isFriday, isMonday, isThursday, isTuesday } from 'date-fns';
import type { Page } from 'puppeteer';

import { moscowTime } from '../const';
import { playSound } from '../utils';
import { goHome } from './goHome';

export const notifyAboutCollections = async (
  page: Page,
  username: string,
  accountType?: string,
) => {
  if (accountType !== 'personal') {
    return;
  }
  if (
    !isMonday(moscowTime) &&
    !isTuesday(moscowTime) &&
    !isThursday(moscowTime) &&
    !isFriday(moscowTime)
  ) {
    return;
  }

  try {
    await page.waitForSelector(`a.cntr[href="city/coll"]`);
    console.log(`🔔 Колекції доступні`);
    playSound();
  } catch {
    console.log(`❌ Немає поки колекцій`);
  } finally {
    await goHome(page, username);
  }
};
