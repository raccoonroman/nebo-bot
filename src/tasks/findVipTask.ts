import type { Page } from 'playwright';
import { playSound } from '../utils';
import { goHome } from './goHome';
import { runElevator } from './runElevator';

const ALL_TASK_NAMES = [
  'Баксы у инвесторов',
  'Заработай баксы',
  'Личные задания',
  'Набери опыт',
  'Звезды с заданий',
  'Задания коллекций',
  'Лабиринт',
  'Городские задания',
  'Собери ключи',
  'Получи 10 ключей',
  'Получи 20 звезд',
  'Чаевые в лифте',
  'Инвесторы',
] as const;
type TaskName = (typeof ALL_TASK_NAMES)[number];

export const findVipTask = async (page: Page, username: string, taskNames: readonly TaskName[]) => {
  const activeVipTask = page.locator('img[src$="/glchest-open.png"]');
  if (await activeVipTask.isVisible()) {
    console.log(`✅ VIP-завдання вже активне`);
    await goHome(page);
    return;
  }

  const lobby = page.getByRole('link', { name: '0. Вестибюль' });
  const lobbyPlus = lobby.getByText('(+)');
  if (await lobbyPlus.isVisible()) {
    await lobby.click();
    const vipTaskName = await page.locator('.admin').textContent();
    console.log(`🔍 VIP-завдання "${vipTaskName}"`);

    if (taskNames.includes(vipTaskName as TaskName)) {
      await page.getByRole('link', { name: 'Получить задание' }).click();
      console.log(`✅ Знайдено VIP-завдання "${vipTaskName}"`);
      playSound();
      return;
    } else {
      await page.getByRole('link', { name: 'Нет, отмена' }).click();
      await page.getByRole('link', { name: 'Да, подтверждаю' }).click();
      console.log(`❌ VIP-завдання "${vipTaskName}" не підходить`);
    }

    await goHome(page);
  }

  const liftHomePage = page.locator('a.tdn[href="lift"]');
  const noVisitorsSelector = liftHomePage.locator('img[src$="/tb_lift2.png"]');
  if (await noVisitorsSelector.isVisible()) {
    await liftHomePage.click();
    await page.getByRole('link', { name: 'Позвать посетителей' }).click();
    await goHome(page);
  }
  await runElevator(page, username, {
    evictWeakResidents: true,
    stopOnVIP: true,
  });
  const vip = liftHomePage.locator('img[src$="/tb_lift_vip.png"]');
  if (await vip.isVisible()) {
    await liftHomePage.click();
    const raiseElevatorLink = page.getByRole('link', { name: 'Поднять лифт' });
    while (await raiseElevatorLink.isVisible()) {
      await raiseElevatorLink.click();
    }
    await page.getByRole('link', { name: 'Получить чаевые' }).click();
    await goHome(page);
    console.log(`✅ Пропустили VIP-персону, підемо дивитись VIP-завдання`);
  }
};
