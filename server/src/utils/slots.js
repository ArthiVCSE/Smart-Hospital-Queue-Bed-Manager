function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * @param {{ start: string, end: string }} workingHours - "HH:mm"
 * @param {number} slotMinutes
 * @returns {string[]} slot start labels e.g. ["09:00","09:30",...] excluding end boundary
 */
export function generateSlots(workingHours, slotMinutes) {
  const start = timeToMinutes(workingHours.start);
  const end = timeToMinutes(workingHours.end);
  const slots = [];
  for (let t = start; t + slotMinutes <= end; t += slotMinutes) {
    slots.push(minutesToTime(t));
  }
  return slots;
}
