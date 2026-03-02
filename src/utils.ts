import { exec } from 'node:child_process';
import { toZonedTime } from 'date-fns-tz';

export const getMoscowTime = () => toZonedTime(new Date(), 'Europe/Moscow');

export const playSound = () => {
  exec('powershell -c "(New-Object Media.SoundPlayer \\"notify.wav\\").PlaySync()"');
};

export const waitSeconds = (seconds: number) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));
