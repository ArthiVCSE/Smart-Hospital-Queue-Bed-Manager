import { Appointment } from '../models/Appointment.js';
import { Doctor } from '../models/Doctor.js';
import { formatDay } from '../utils/date.js';

export async function loadDayQueue(doctorId, day) {
  const rows = await Appointment.find({
    doctorId,
    date: day,
    status: { $nin: ['CANCELLED'] },
  })
    .sort({ tokenNumber: 1 })
    .populate('patientId', 'name')
    .lean();

  const inConsult = rows.find((r) => r.status === 'IN_CONSULT');
  const activeRows = rows.filter((r) => ['IN_QUEUE', 'IN_CONSULT'].includes(r.status));

  const entries = activeRows.map((r) => ({
    appointmentId: r._id,
    tokenNumber: r.tokenNumber,
    slotTime: r.slotTime,
    status: r.status,
    patientName: r.patientId?.name ? String(r.patientId.name).split(' ')[0] : undefined,
  }));

  const positionById = new Map();
  let i = 1;
  for (const r of activeRows) {
    positionById.set(r._id.toString(), i);
    i += 1;
  }

  return { entries, inConsult, positionById, activeRows };
}

/** Payload shape matches GET /api/queue/:doctorId */
export async function getQueueApiPayload(doctorId, day) {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) return null;
  const { entries, inConsult } = await loadDayQueue(doctor._id, day);
  return {
    date: formatDay(day),
    doctorId: doctor._id,
    currentConsult: inConsult
      ? {
          appointmentId: inConsult._id,
          tokenNumber: inConsult.tokenNumber,
        }
      : null,
    queue: entries,
  };
}
