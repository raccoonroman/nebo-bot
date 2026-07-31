import type { Page } from 'playwright';
import { goHome } from './goHome';
import { runElevator, type RunElevatorOptions } from './runElevator';

export const runElevatorForcibly = async (
  page: Page,
  username: string,
  options: RunElevatorOptions,
) => {
  const liftHomePage = page.locator('a.tdn[href*="lift"]');
  const noVisitorsSelector = liftHomePage.locator('img[src$="/tb_lift2.png"]');
  if (await noVisitorsSelector.isVisible()) {
    await liftHomePage.click();
    await page.getByRole('link', { name: 'Позвать посетителей' }).click();
    await goHome(page);
  }
  await runElevator(page, username, options);
};
