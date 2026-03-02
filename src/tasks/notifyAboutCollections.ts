import { isFriday, isMonday, isThursday, isTuesday } from 'date-fns';

import type { Page } from 'playwright';
import { getMoscowTime, playSound } from '../utils';

export const notifyAboutCollections = async (page: Page, accountType?: string) => {
  if (accountType !== 'personal') {
    return;
  }
  const moscowTime = getMoscowTime();

  if (
    !isMonday(moscowTime) &&
    !isTuesday(moscowTime) &&
    !isThursday(moscowTime) &&
    !isFriday(moscowTime)
  ) {
    return;
  }

  const collections = page.locator('a.cntr[href="city/coll"]');

  if (await collections.isVisible()) {
    console.log(`🔔 Колекції доступні`);
    playSound();
  } else {
    console.log(`❌ Немає поки колекцій`);
  }
};
