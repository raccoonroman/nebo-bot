import { exec } from 'node:child_process';

export const playSound = () => {
  exec('powershell -c "(New-Object Media.SoundPlayer \\"notify.wav\\").PlaySync()"');
};

export const waitSeconds = (seconds: number) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));
