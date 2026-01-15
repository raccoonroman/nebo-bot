import type { Page } from 'puppeteer';
import { goHome } from './goHome';
import { runElevator } from './runElevator';
import { playSound } from '../utils';

const TASK_TITLE = 'Новые жители';
const RESIDENTS_AMOUNT_FOR_TASK = 25;

export const bringNewResidents = async (page: Page, username: string) => {
  await goHome(page, username);
  await page.locator('a::-p-text(Мой профиль)').click();
  await page.locator('a::-p-text( Мои задания)').click();
  await page.locator(`::-p-text(${TASK_TITLE})`).wait();
  const doneAmount = await page.$eval(
    `::-p-text(${TASK_TITLE})`,
    (node, defaultAmount) => {
      // biome-ignore lint/style/noNonNullAssertion: node is guaranteed to have a parent with class 'nfl'
      const taskBlock = node.closest('.nfl')!;
      const done = taskBlock.querySelector('.minor.small.nshd:not(.m5) > span span:first-child');
      return done ? Number(done.textContent) : defaultAmount;
    },
    RESIDENTS_AMOUNT_FOR_TASK,
  );
  await goHome(page, username);
  if (doneAmount === RESIDENTS_AMOUNT_FOR_TASK) {
    console.log(`✅ Завдання "Привезти нових жителів" вже виконано!`);
    playSound();
    await goHome(page, username);
    return;
  }

  const needToBringAmount = RESIDENTS_AMOUNT_FOR_TASK - doneAmount;
  console.log(`👷‍♂️ Потрібно привезти ще ${needToBringAmount} жителів`);
  await runElevator(page, username, {
    stopOnCitizen: true,
    stopOnVIP: false,
    evictWeakResidents: true,
  });
  await page.locator('a.tdn[href="lift"]').click();

  try {
    await page.locator('a[href*="activateLiftLink"]').click();
    console.log(`🔄 Кличемо нових відвідувачів`);
  } catch {
    console.log(`❌ Не вдалося запросити нових відвідувачів`);
  } finally {
    await goHome(page, username);
  }
};
