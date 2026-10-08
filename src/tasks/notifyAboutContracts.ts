import type { Page } from 'playwright';
import type { Account } from '../accounts';
import { playSound } from '../utils';
import { goHome } from './goHome';

const autoClosedTasks = [
  'Закупи 50 товаров',
  'Выложи 100 товаров',
  'Собери выручку со 150 товаров',
];

interface ContractsOptions {
  difficultTask: 'cancel' | 'manual';
}

export const notifyAboutContracts = async (
  page: Page,
  account: Account,
  options: ContractsOptions,
) => {
  if (account.type !== 'personal') {
    return;
  }
  const contracts = page.locator('a.btng[href*="timebox"]');

  if (await contracts.isVisible()) {
    console.log(`🔔 Контракти доступні для ${account.username}`);
    await contracts.click();
    await page.getByRole('link', { name: 'Получить задание' }).click();
    await goHome(page);
  }

  const activeContractTask = page.locator('a.white.bl.tdn[href*="timebox"]');
  if (await activeContractTask.isVisible()) {
    console.log(`🔔 Активний контракт для ${account.username}`);
    const taskName = await activeContractTask.textContent();
    const isTaskDone = activeContractTask.locator('..').getByText('готово');

    if (await isTaskDone.isVisible()) {
      await activeContractTask.click();
      await page.getByRole('link', { name: 'Завершить!' }).click();
      console.log(`✅ Завдання контрактів "${taskName}" виконано для юзера ${account.username}`);
      await goHome(page);
      return;
    }

    switch (options.difficultTask) {
      case 'cancel': {
        if (!autoClosedTasks.includes(taskName ?? '')) {
          await activeContractTask.click();
          await page.getByRole('link', { name: 'отменить' }).click();
          await page.getByRole('link', { name: 'Да, подтверждаю' }).click();
          console.log(`❌ Завдання "${taskName}" відмінено для юзера ${account.username}`);
          await goHome(page);
        }
        break;
      }
      case 'manual': {
        if (!autoClosedTasks.includes(taskName ?? '')) {
          console.log(`⏳ Завдання "${taskName}" має бути виконано вручну для ${account.username}`);
          playSound();
        }
        break;
      }
    }
  }
};
