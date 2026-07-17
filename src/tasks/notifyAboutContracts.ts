
import type { Page } from 'playwright';
import { playSound } from '../utils';

export const notifyAboutContracts = async (page: Page, accountType?: string) => {
  if (accountType !== 'personal') {
    return;
  }
  const contracts = page.locator('a.btng[href="timebox"]');

  if (await contracts.isVisible()) {
    console.log(`🔔 Контракти доступні`);
    playSound();
  } else {
    console.log(`❌ Немає поки контрактів`);
  }
};
