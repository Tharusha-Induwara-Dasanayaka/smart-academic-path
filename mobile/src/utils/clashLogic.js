import { toMin } from './registrationLogic.mjs';
export {
  detectClashes,
  getAlternatives,
  normalizeDay,
} from './registrationLogic.mjs';

export const timeToMinutes = toMin;

export function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

export function getSeatInfo(seatsLeft) {
  const seats = Number(seatsLeft) || 0;
  if (seats <= 0) {
    return {
      color: '#EF4444',
      bgColor: '#FEE2E2',
      text: 'Full',
      badgeColor: 'red',
      isAvailable: false,
    };
  }
  if (seats < 10) {
    return {
      color: '#D97706',
      bgColor: '#FEF3C7',
      text: `${seats} left`,
      badgeColor: 'orange',
      isAvailable: true,
    };
  }
  return {
    color: '#16A34A',
    bgColor: '#DCFCE7',
    text: `${seats} seats`,
    badgeColor: 'green',
    isAvailable: true,
  };
}
