export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getDayOfWeekShort(year, month, day, lang = 'en') {
  const langMap = { en: 'en-US', de: 'de-DE' };
  return new Date(year, month, day).toLocaleDateString(langMap[lang] || 'en-US', { weekday: 'short' });
}

export function pad(n) {
  return n.toString().padStart(2, '0');
}

export function getDateKey(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

export function getRandomHex() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

export function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
}

export function formatDateDDMMYYYY(dateInput) {
  if (!dateInput) return '';
  if (typeof dateInput === 'string' && dateInput.includes('-')) {
    const parts = dateInput.split('-');
    if (parts.length >= 3) return `${pad(parts[2].substring(0, 2))}.${pad(parts[1])}.${parts[0]}`;
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

/**
 * Calculates net shift hours accounting for Swiss ArG break rules.
 */
export function calculateShiftDuration(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(' - ');
  if (parts.length < 2) return 0;

  const [startH, startM] = parts[0].split(':').map(Number);
  const [endH, endM] = parts[1].split(':').map(Number);

  if ([startH, startM, endH, endM].some(isNaN)) return 0;

  const startTotal = startH + startM / 60;
  let endTotal = endH + endM / 60;
  if (endTotal <= startTotal) endTotal += 24;
  const rawDuration = endTotal - startTotal;

  let breakTime = 0;
  if (rawDuration > 9) breakTime = 1;
  else if (rawDuration > 7) breakTime = 0.75;
  else if (rawDuration > 5.5) breakTime = 0.25;

  return Math.max(0, rawDuration - breakTime);
}

export function check11HourRest(timeYesterday, timeToday) {
  if (!timeYesterday || !timeToday) return true;

  const yParts = timeYesterday.split(' - ');
  const tParts = timeToday.split(' - ');
  if (yParts.length < 2 || tParts.length < 2) return true;

  const [yStartStr, yEndStr] = yParts;
  const [tStartStr] = tParts;

  let yEndH = parseInt(yEndStr.split(':')[0]) + parseInt(yEndStr.split(':')[1]) / 60;
  let yStartH = parseInt(yStartStr.split(':')[0]) + parseInt(yStartStr.split(':')[1]) / 60;

  if ([yEndH, yStartH].some(isNaN)) return true;

  if (yEndH <= yStartH) yEndH += 24;

  let tStartH = parseInt(tStartStr.split(':')[0]) + parseInt(tStartStr.split(':')[1]) / 60;
  if (isNaN(tStartH)) return true;

  let restTime = (tStartH + 24) - yEndH;
  return restTime >= 11;
}

export const MEMBER_COLORS = [
  'bg-blue-100 text-blue-800', 'bg-green-100 text-green-800',
  'bg-purple-100 text-purple-800', 'bg-orange-100 text-orange-800',
  'bg-pink-100 text-pink-800', 'bg-teal-100 text-teal-800',
  'bg-indigo-100 text-indigo-800', 'bg-rose-100 text-rose-800'
];

export const DAY_NUMBERS = [1, 2, 3, 4, 5, 6, 0];
