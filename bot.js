import puppeteer from "puppeteer";
import { isWednesday, isWeekend } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const accounts = [];

(async () => {
  await Promise.all(
    accounts.map(async (account) => {
      const browser = await puppeteer.launch({ headless: false }); // Відкритий браузер
      const page = await browser.newPage();
      const homePage = "https://nebo.mobi";
      page.setDefaultTimeout(5000);

      await page.goto(homePage, { waitUntil: "domcontentloaded" });
      await page.locator("a ::-p-text(Вход)").click();
      await page.locator('input[name="login"]').fill(account.username);
      await page.locator('input[name="password"]').fill(account.password);
      await page.locator('input[value="Вход"]').click();

      console.log(`✅ Started at ${new Date().toISOString()}`);

      const runManager = async () => {
        while (true) {
          try {
            const linkToAllFloorsSelector = 'a.tdn[href*="floors/"]';
            const linkToAllFloors = await page.waitForSelector(
              linkToAllFloorsSelector
            );
            const iconSrc = await page.$eval(
              `${linkToAllFloorsSelector} img`,
              (img) => img.getAttribute("src")
            );
            const taskAction = iconSrc.includes("sold")
              ? "Собрать выручку!"
              : iconSrc.includes("stocked")
              ? "Выложить товар"
              : "Закупить товар";
            await linkToAllFloors.click();
            await linkToAllFloors.dispose();

            while (true) {
              try {
                const firstFloorLink = await page.waitForSelector(
                  `a::-p-text(${taskAction})`
                );
                await firstFloorLink.click();
                await firstFloorLink.dispose();

                if (taskAction === "Закупить товар") {
                  const buySelector = "a.tdu ::-p-text(Закупить за)";
                  await page.waitForSelector(buySelector);
                  const allLinks = await page.$$(buySelector);
                  await allLinks.at(-1).click();
                }
              } catch (error) {
                console.log(
                  `✅ Завдання для ${account.username} '${taskAction}' виконано`
                );
                break;
              }
            }
          } catch (error) {
            console.log(
              `⌛ поки немає ні одного завдання в ${account.username}`
            );
            return;
          }
        }
      };

      const attendNegotiations = async () => {
        const moscowTime = toZonedTime(new Date(), "Europe/Moscow");

        if (!isWeekend(moscowTime) && !isWednesday(moscowTime)) {
          return;
        }

        try {
          const startNegotiationsBtn = await page.waitForSelector(
            "a::-p-text(Начать переговоры)",
            { timeout: 2000 }
          );
          await startNegotiationsBtn.click();
          await startNegotiationsBtn.dispose();
          console.log(`✅ Переговори для ${account.username} розпочато`);
          const talkSelector = 'a[href^="../../boss/wicket"]';

          const talkWithInvestors = async () => {
            while (true) {
              try {
                const taksButton = await page.waitForSelector(talkSelector, {
                  timeout: 2000,
                });
                console.log("🔁 Відповідаємо інвесторам...");
                await taksButton.click(talkSelector);
                await taksButton.dispose();
                await new Promise((resolve) => setTimeout(resolve, 6000));
              } catch {
                console.log("✅ Переговори закінчились");
                break;
              }
            }
          };

          while (true) {
            try {
              await page.waitForSelector(talkSelector, { timeout: 2000 });
              console.log("🎯 Розмовляємо з інвесторами...");
              talkWithInvestors();
              return;
            } catch {
              console.log("❌ Кнопки ще нема. Перезавантажуємо сторінку...");
              await new Promise((resolve) => setTimeout(resolve, 10000));
              await page.reload();
            }
          }
        } catch (error) {
          console.log(`❎ Переговорів поки немає для ${account.username}`);
          return;
        }
      };

      while (true) {
        try {
          await attendNegotiations();
          await runManager();

          await new Promise((resolve) => setTimeout(resolve, 30000)); // Чекаємо 30 секунд
          await page.reload();
          console.log(`🔃 Перезавантажено сторінку`);
          await page.goto(homePage);
        } catch (error) {
          console.error(
            `❌ Помилка в юзера ${
              account.username
            }, ${new Date().toISOString()}`,
            error
          );
          break;
        }
      }
    })
  );
})();
