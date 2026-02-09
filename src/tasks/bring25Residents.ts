import type { Page } from 'playwright';
import { playSound } from '../utils';
import { goHome } from './goHome';
import { runElevator } from './runElevator';

export const bring25Residents = async (page: Page, username: string) => {
  await page.getByRole('link', { name: 'Мой профиль' }).click();
  await page.getByRole('link', { name: 'Мои задания' }).click();
  const taskName = page.locator('b', { hasText: 'Новые жители' });
  if (await taskName.isHidden()) {
    console.log(`❌ Завдання "Нові жителі" зараз не активне`);
    await goHome(page);
    return;
  }
  const taskBlock = taskName.locator('..').locator('..');
  const getAwardLink = taskBlock.locator('a', { hasText: 'Получить награду' });
  if (await getAwardLink.isVisible()) {
    console.log(`✅ Завдання "Привезти нових жителів" вже виконано!`);
    playSound();
    await goHome(page);
    return;
  }
  const doneString = await taskBlock
    .getByText('Прогресс:')
    .locator('span span:first-child')
    .textContent();
  const doneAmount = doneString ? Number(doneString.trim()) : 0;
  const needToBringAmount = 25 - doneAmount;
  console.log(`👷‍♂️ Потрібно привезти ще ${needToBringAmount} жителів`);

  await goHome(page);
  const liftHomePage = page.locator('a.tdn[href="lift"]');
  const noVisitorsSelector = liftHomePage.locator('img[src$="/tb_lift2.png"]');
  if (await noVisitorsSelector.isVisible()) {
    await liftHomePage.click();
    await page.getByRole('link', { name: 'Позвать посетителей' }).click();
    await goHome(page);
  }
  await runElevator(page, username, {
    stopOnCitizen: true,
    evictWeakResidents: true,
    // stopOnVIP: false,
    // passOnlyBuyerVIP: true,
  });
};
