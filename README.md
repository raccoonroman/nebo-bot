# nebo-bot

`nebo-bot` is a small automation bot for `nebo.mobi`. It logs into one or more game accounts and repeatedly performs selected in-game actions through a headless browser.

It is intended for personal use and can be customized through [src/index.ts](/d:/back-end/nebo-bot/src/index.ts).

## Purpose

The bot helps automate routine gameplay tasks such as:

- manager tasks on floors;
- finding and accepting `VIP` tasks;
- working with the elevator and visitors;
- running additional scenarios like negotiations, collections, residents, and production.

## Main Tools

- `TypeScript`
- `Playwright`
- `tsx`
- `nodemon`
- `Biome`

## Run

### 1. Install dependencies

```bash
pnpm install
```

### 2. Install the Playwright browser

```bash
npx playwright install chromium
```

### 3. Configure accounts

Accounts are stored in [src/accounts.ts](/d:/back-end/nebo-bot/src/accounts.ts).

Example:

```ts
export const accounts = [
  {
    username: 'login',
    password: 'password',
    type: 'personal',
  },
];
```

### 4. Enable the tasks you want

In [src/index.ts](/d:/back-end/nebo-bot/src/index.ts), comment or uncomment the task calls depending on what you want the bot to do.

Current task handlers include:

- `runManager`
- `findVipTask`
- `bring25Residents`
- `attendNegotiations`
- `notifyAboutCollections`
- `runElevator`
- `produceToys`

Start normally:

```bash
pnpm start
```

Start in development mode:

```bash
pnpm dev
```
