import puppeteer from "puppeteer";
import {
  isFriday,
  isMonday,
  isThursday,
  isTuesday,
  isWednesday,
  isWeekend,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";
import player from "play-sound";

const sound = player();
const moscowTime = toZonedTime(new Date(), "Europe/Moscow");

(async () => {
  await Promise.all(
    accounts.map(async (account) => {
      const browser = await puppeteer.launch({ headless: true }); // Відкритий браузер
      const page = await browser.newPage();
      page.setDefaultTimeout(5000);

      const goHome = async () => {
        await page.locator(".hdr .ttl").click();
        await page.waitForSelector(".footer");
        console.log(
          `🔙 Повернулись на головну сторінку для ${account.username}`
        );
      };

      await page.goto("https://nebo.mobi", { waitUntil: "domcontentloaded" });
      await page.locator("a ::-p-text(Вход)").click();
      await page.locator('input[name="login"]').fill(account.username);
      await page.locator('input[name="password"]').fill(account.password);
      await page.locator('input[value="Вход"]').click();
      await goHome();

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
                await goHome();
                break;
              }
            }
          } catch (error) {
            console.log(
              `⌛ поки немає ні одного завдання в ${account.username}`
            );
            await goHome();
            return;
          }
        }
      };

      const attendNegotiations = async () => {
        if (!isWeekend(moscowTime) && !isWednesday(moscowTime)) {
          return;
        }

        try {
          const startNegotiationsBtn = await page.waitForSelector(
            "a::-p-text(Начать переговоры)",
            { timeout: 2000 }
          );
          await startNegotiationsBtn.click();
          console.log(`✅ Переговори для ${account.username} розпочато`);
          const talkSelector = 'a[href*="boss/wicket"]';

          const talkWithInvestors = async () => {
            while (true) {
              try {
                const taksButton = await page.waitForSelector(talkSelector, {
                  timeout: 2000,
                });
                console.log("🔁 Відповідаємо інвесторам...");
                await taksButton.click(talkSelector);
                // await taksButton.dispose();
                await new Promise((resolve) => setTimeout(resolve, 6000));
              } catch (error) {
                console.log("✅ Переговори закінчились");
                break;
              }
            }
          };

          while (true) {
            try {
              await page.waitForSelector(talkSelector, { timeout: 2000 });
              console.log("🎯 Розмовляємо з інвесторами...");
              await talkWithInvestors();
              return;
            } catch (error) {
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

      const notifyAboutCollections = async () => {
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
          // process.stdout.write("\x07");
          console.log(`🔔 Колекції для ${account.username} доступні`);
          sound.play("notify.wav", function (err) {
            if (err) console.error("Помилка відтворення аудіо:", err);
          });
        } catch (error) {
          console.log(`❌ Немає поки колекцій для ${account.username}`);
        } finally {
          await goHome();
          return;
        }
      };

      const runToFirstVIP = async () => {
        const liftSelector = 'a.tdn[href="lift"]';
        const visitorsAmountHandler = (el) => el.textContent.trim();
        const noVisitorsSelector = await page.$(
          `${liftSelector} img[src$="/tb_lift2.png"]`
        );
        const visitorsAmountSelector = await page.$(
          `${liftSelector} .amount span`
        );

        if (noVisitorsSelector) {
          console.log(`❌ Відвідувачів немає для ${account.username}`);
          return;
        }
        if (
          visitorsAmountSelector &&
          Number(
            await page.evaluate(visitorsAmountHandler, visitorsAmountSelector)
          ) <= 20
        ) {
          console.log(
            `⌛ Трохи почекаємо, коли відвідувачів буде більше 20 для ${account.username}`
          );
          return;
        }
        await page.locator(liftSelector).click();

        while (true) {
          try {
            const liftSelector = await page.waitForSelector(
              `.lift a.tdu[href]`
            );
            const vipSelector = await page.$(".lift .vip");
            const floorSelector = await page.$(".lift a.tdu span");
            const floorValue = await floorSelector.evaluate((el) =>
              el.textContent.trim()
            );
            if (vipSelector) {
              console.log(`✅ VIP для ${account.username} знайдений`);
              await goHome();
              break;
            } else if (floorValue === "1") {
              console.log(`✅ Новий житель для ${account.username} знайдений`);
              await goHome();
              break;
            } else {
              await liftSelector.click();
              await liftSelector.dispose();
            }
          } catch (error) {
            console.log(`✅ Всі відвідувачі для ${account.username} розвезені`);
            await goHome();
            break;
          }
        }
      };

      const produceToys = async () => {
        await goHome();
        const fabricSelector = 'a[href="fabric"]';
        const hasReadyToys = await page.$eval(fabricSelector, (link) => {
          const div = link.querySelector("div.cntr.nshd");
          return div && div.textContent.trim() === "Есть готовый инвентарь!";
        });
        if (hasReadyToys) {
          try {
            await page.locator(fabricSelector).click();
            await page.locator(`a::-p-text(Забрать все)`).click();
            await page.locator(`a::-p-text(Запустить все)`).click();
            console.log(
              `✅ Всі іграшки для ${
                account.username
              } вироблені, ${new Date().toISOString()}`
            );
          } catch (error) {
            console.error(
              `❌ Помилка при виробництві іграшок для ${account.username}`,
              error
            );
          } finally {
            await goHome();
            return;
          }
        }
      };

      while (true) {
        try {
          // await produceToys();
          // await runManager();
          // await attendNegotiations();
          await runToFirstVIP();
          // await notifyAboutCollections();

          await new Promise((resolve) => setTimeout(resolve, 30000)); // Чекаємо 30 секунд

          await page.reload();
          console.log(`🔃 Перезавантажено сторінку`);
          await goHome();
        } catch (error) {
          console.error(
            `❌ Помилка в юзера ${
              account.username
            }, ${new Date().toISOString()}`,
            error
          );
          await goHome();
        }
      }
    })
  );
})();
