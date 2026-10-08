import type { Page } from 'playwright';
import { playSound } from '../utils';
import { goHome } from './goHome';

const autoClosedTasks = [
  'Закупи 50 товаров',
  'Выложи 100 товаров',
  'Собери выручку со 150 товаров',
];

interface OpenChestsOptions {
  difficultTask: 'cancel' | 'manual';
}

export const openChests = async (page: Page, username: string, options: OpenChestsOptions) => {
  const chest = page.getByRole('link', { name: 'Сундук' });
  if (await chest.isVisible()) {
    console.log(`Сундук доступний для юзера ${username}`);
    await chest.click();
    await page.getByRole('link', { name: 'Получить задание' }).click();
    await goHome(page);
  }

  const activeChestTask = page.locator('a.white.bl.tdn[href*="city/box/quests"]');
  if (await activeChestTask.isVisible()) {
    const taskName = await activeChestTask.textContent();
    const isTaskDone = activeChestTask.locator('..').getByText('готово');

    if (await isTaskDone.isVisible()) {
      await activeChestTask.click();
      await page.getByRole('link', { name: 'Завершить!' }).click();
      console.log(`✅ Завдання "${taskName}" виконано для юзера ${username}`);
      await goHome(page);
      return;
    }

    switch (options.difficultTask) {
      case 'cancel': {
        if (!autoClosedTasks.includes(taskName ?? '')) {
          await activeChestTask.click();
          await page.getByRole('link', { name: 'отменить' }).click();
          await page.getByRole('link', { name: 'Да, подтверждаю' }).click();
          console.log(`❌ Завдання "${taskName}" відмінено для юзера ${username}`);
          await goHome(page);
        }
        break;
      }
      case 'manual': {
        if (!autoClosedTasks.includes(taskName ?? '')) {
          console.log(`⏳ Завдання "${taskName}" має бути виконано вручну для юзера ${username}`);
          playSound();
        }
        break;
      }
    }
  }
};
