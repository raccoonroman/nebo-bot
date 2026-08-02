import type { Page } from 'playwright';
import { playSound } from '../utils';
import { goHome } from './goHome';
import { runElevatorForcibly } from './runElevatorForcibly';

interface ManageResidentsInHotelOptions {
  task: 'bring25' | 'evict15';
}

export const manageResidentsInHotel = async (page: Page, username: string, options: ManageResidentsInHotelOptions) => {
  await page.getByRole('link', { name: 'Мой профиль' }).click();
  await page.getByRole('link', { name: 'Мои задания' }).click();
  const taskType = options.task === 'bring25' ? 'Новые жители' : 'Давайдосвидания';
  const taskAmount = options.task === 'bring25' ? 25 : 15;
  const taskName = page.locator('b', { hasText: taskType });
  if (await taskName.isHidden()) {
    console.log(`❌ Завдання "${taskType}" зараз не активне`);
    await goHome(page);
    return;
  }
  const taskBlock = taskName.locator('..').locator('..');
  const getAwardLink = taskBlock.locator('a', { hasText: 'Получить награду' });
  if (await getAwardLink.isVisible()) {
    console.log(`✅ Завдання "${taskType}" вже виконано!`);
    playSound();
    await goHome(page);
    return;
  }
  const doneString = await taskBlock
    .getByText('Прогресс:')
    .locator('span span:first-child')
    .textContent();
  const doneAmount = doneString ? Number(doneString.trim()) : 0;
  const needToBringAmount = taskAmount - doneAmount;
  console.log(`👷‍♂️ Потрібно привезти ще ${needToBringAmount} жителів`);

  await goHome(page);
  await runElevatorForcibly(page, username, {
    evictWeakResidents: true,
    // stopOnVIP: false,
    // passOnlyBuyerVIP: true,
  });
};
