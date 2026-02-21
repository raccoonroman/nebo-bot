import { toZonedTime } from 'date-fns-tz';

export const getMoscowTime = () => toZonedTime(new Date(), 'Europe/Moscow');
