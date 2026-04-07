import { Appointment } from '../models/Appointment.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import { parseDay, formatDay } from '../utils/date.js';
import { assertOwnDoctor } from '../services/doctorService.js';
import { loadDayQueue, getQueueApiPayload } from '../services/queueService.js';
import { broadcastQueueState } from '../realtime/socket.js';

export const getQueue = catchAsync(async (req, res) => {
  const { doctorId } = req.params;
  const { date: dateStr } = req.query;
  if (!dateStr) throw new AppError('Query ?date=YYYY-MM-DD is required', 400);

  const day = parseDay(dateStr);
  const payload = await getQueueApiPayload(doctorId, day);
  if (!payload) throw new AppError('Doctor not found', 404);

  res.json({
    status: 'ok',
    data: payload,
  });
});

export const myQueuePosition = catchAsync(async (req, res) => {
  const { appointmentId } = req.params;
  const appt = await Appointment.findById(appointmentId).populate('patientId');
  if (!appt) throw new AppError('Appointment not found', 404);
  if (appt.patientId._id.toString() !== req.user.id) {
    throw new AppError('Forbidden', 403);
  }

  const day = appt.date;
  const { inConsult, positionById } = await loadDayQueue(appt.doctorId, day);
  const position = positionById.get(appt._id.toString());
  const waitAhead = position ? Math.max(0, position - 1) : 0;

  res.json({
    status: 'ok',
    data: {
      appointmentId: appt._id,
      doctorId: appt.doctorId,
      date: formatDay(day),
      tokenNumber: appt.tokenNumber,
      status: appt.status,
      position: position ?? null,
      patientsAhead: waitAhead,
      currentConsult: inConsult
        ? { appointmentId: inConsult._id, tokenNumber: inConsult.tokenNumber }
        : null,
    },
  });
});

async function assertNoActiveConsult(doctorId, day) {
  const n = await Appointment.countDocuments({
    doctorId,
    date: day,
    status: 'IN_CONSULT',
  });
  if (n > 0) {
    throw new AppError('Finish the active consultation before starting another', 409);
  }
}

export const startConsult = catchAsync(async (req, res) => {
  const { appointmentId } = req.params;
  const appt = await Appointment.findById(appointmentId);
  if (!appt) throw new AppError('Appointment not found', 404);

  await assertOwnDoctor(req, appt.doctorId);
  const day = appt.date;

  if (appt.status !== 'IN_QUEUE') {
    throw new AppError('Appointment cannot be started from this status', 409);
  }

  await assertNoActiveConsult(appt.doctorId, day);
  appt.status = 'IN_CONSULT';
  await appt.save();

  await broadcastQueueState(appt.doctorId, day);

  res.json({
    status: 'ok',
    data: {
      appointment: {
        id: appt._id,
        tokenNumber: appt.tokenNumber,
        status: appt.status,
      },
    },
  });
});

export const completeConsult = catchAsync(async (req, res) => {
  const { appointmentId } = req.params;
  const appt = await Appointment.findById(appointmentId);
  if (!appt) throw new AppError('Appointment not found', 404);

  await assertOwnDoctor(req, appt.doctorId);

  if (appt.status !== 'IN_CONSULT') {
    throw new AppError('Only an in-consult appointment can be completed', 409);
  }

  const day = appt.date;
  appt.status = 'COMPLETED';
  await appt.save();

  await broadcastQueueState(appt.doctorId, day);

  res.json({
    status: 'ok',
    data: {
      appointment: {
        id: appt._id,
        tokenNumber: appt.tokenNumber,
        status: appt.status,
      },
    },
  });
});

export const callNext = catchAsync(async (req, res) => {
  const { doctorId } = req.params;
  const { date: dateStr } = req.query;
  if (!dateStr) throw new AppError('Query ?date=YYYY-MM-DD is required', 400);

  await assertOwnDoctor(req, doctorId);
  const day = parseDay(dateStr);

  await assertNoActiveConsult(doctorId, day);

  const nextAppt = await Appointment.findOne({
    doctorId,
    date: day,
    status: 'IN_QUEUE',
  }).sort({ tokenNumber: 1 });

  if (!nextAppt) {
    throw new AppError('No patients waiting in queue', 404);
  }

  nextAppt.status = 'IN_CONSULT';
  await nextAppt.save();

  await broadcastQueueState(doctorId, day);

  res.json({
    status: 'ok',
    data: {
      appointment: {
        id: nextAppt._id,
        tokenNumber: nextAppt.tokenNumber,
        status: nextAppt.status,
      },
    },
  });
});
