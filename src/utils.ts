import { exec } from 'node:child_process';

export const playSound = () => {
  exec(
    'powershell -c "(New-Object Media.SoundPlayer \\"notify.wav\\").PlaySync()"'
  );
};
