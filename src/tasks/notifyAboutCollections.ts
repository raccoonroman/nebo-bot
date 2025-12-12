import { exec } from 'child_process';
import type { Page } from 'puppeteer';
import { isFriday, isMonday, isThursday, isTuesday } from 'date-fns';

import { moscowTime } from '../const';
import { goHome } from './goHome';

const playSound = () => {
  exec('powershell -c "(New-Object Media.SoundPlayer \\"notify.wav\\").PlaySync()"');
};

export const notifyAboutCollections = async (page: Page, username: string) => {
  if (
    !isMonday(moscowTime) &&
    !isTuesday(moscowTime) &&
    !isThursday(moscowTime) &&
    !isFriday(moscowTime)
  ) {
    return;
  }

  try {
    await page.waitForSelector(`a[href="city/coll"]`);
    console.log(`🔔 Колекції для ${username} доступні`);
    playSound();
  } catch (error) {
    console.log(`❌ Немає поки колекцій для ${username}`);
  } finally {
    await goHome(page, username);
    return;
  }
};
