const amountFormatter = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatAmount(value) {
  return amountFormatter.format(value ?? 0);
}

const dayFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });
const dayWeekdayFormatter = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' });
const shortDateFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
const monthFormatter = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' });

function isSameCalendarDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function formatDayGroupLabel(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();
  if (isSameCalendarDay(date, today)) return 'Сегодня';

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameCalendarDay(date, yesterday)) return 'Вчера';

  const label = dayFormatter.format(date);
  const weekday = dayWeekdayFormatter.format(date);
  return `${label}, ${weekday}`;
}

export function formatShortDate(timestamp) {
  return shortDateFormatter.format(new Date(timestamp));
}

export function formatMonthLabel(timestamp) {
  const str = monthFormatter.format(new Date(timestamp));
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function dateKey(timestamp) {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function toDateInputValue(timestamp) {
  const d = new Date(timestamp);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromDateInputValue(value) {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
}

export function formatDateDDMMYYYY(timestamp) {
  const d = new Date(timestamp);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

const BYTE_UNITS = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'];

export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 Б';
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), BYTE_UNITS.length - 1);
  const value = bytes / 1024 ** exponent;
  const precision = exponent === 0 ? 0 : value < 10 ? 2 : value < 100 ? 1 : 0;
  return `${value.toFixed(precision)} ${BYTE_UNITS[exponent]}`;
}
