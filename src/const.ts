import { toZonedTime } from 'date-fns-tz';

export const moscowTime = toZonedTime(new Date(), 'Europe/Moscow');
