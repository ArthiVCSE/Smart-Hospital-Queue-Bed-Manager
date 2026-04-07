import { body, query } from 'express-validator';
import { Appointment } from '../models/Appointment.js';
import { Doctor } from '../models/Doctor.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import { parseDay, formatDay } from '../utils/date.js';
import { generateSlots } from '../utils/slots.js';
import { nextTokenNumber, rollbackTokenNumber } from '../models/TokenCounter.js';
import { broadcastAppointmentBooked } from '../realtime/socket.js';

export const bookValidators = [
  body('doctorId').isMongoId(),
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/),
  body('slotTime').matches(/^\d{2}:\d{2}$/),
];

export const bookAppointment = catchAsync(async (req, res) => {
  const { doctorId, date: dateStr, slotTime } = req.body;
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new AppError('Doctor not found', 404);

  const day = parseDay(dateStr);
  const validSlots = generateSlots(doctor.workingHours, doctor.slotMinutes);
  if (!validSlots.includes(slotTime)) {
    throw new AppError('Invalid slot for this doctor', 400);
  }

  const tokenNumber = await nextTokenNumber(doctor._id, day);
  try {
    const appt = await Appointment.create({
      patientId: req.user.id,
      doctorId: doctor._id,
      date: day,
      slotTime,
      tokenNumber,
      status: 'IN_QUEUE',
    });

    const appointmentPayload = {
      id: appt._id,
      doctorId: appt.doctorId,
      date: formatDay(appt.date),
      slotTime: appt.slotTime,
      tokenNumber: appt.tokenNumber,
      status: appt.status,
    };
    await broadcastAppointmentBooked(doctor._id, day, appointmentPayload);

    res.status(201).json({
      status: 'ok',
      data: {
        appointment: appointmentPayload,
      },
    });
  } catch (err) {
    await rollbackTokenNumber(doctor._id, day);
    throw err;
  }
});

export const myAppointmentsValidators = [
  query('from').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
];

export const myAppointments = catchAsync(async (req, res) => {
  const q = { patientId: req.user.id };
  if (req.query.from) {
    q.date = { $gte: parseDay(req.query.from) };
  }
  const rows = await Appointment.find(q)
    .sort({ date: -1, slotTime: -1 })
    .populate('doctorId', 'department')
    .lean();

  res.json({
    status: 'ok',
    data: {
      appointments: rows.map((a) => ({
        id: a._id,
        date: formatDay(a.date),
        slotTime: a.slotTime,
        tokenNumber: a.tokenNumber,
        status: a.status,
        doctor: a.doctorId
          ? { id: a.doctorId._id, department: a.doctorId.department }
          : undefined,
      })),
    },
  });
});

export const doctorDayAppointmentsValidators = [
  query('date').matches(/^\d{4}-\d{2}-\d{2}$/),
];

export const doctorDayAppointments = catchAsync(async (req, res) => {
  const { doctorId } = req.params;
  const day = parseDay(req.query.date);

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new AppError('Doctor not found', 404);

  if (req.user.role === 'doctor') {
    const profile = await Doctor.findOne({ userId: req.user.id });
    if (!profile || profile._id.toString() !== doctorId) {
      throw new AppError('Not your schedule', 403);
    }
  } else if (req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403);
  }

  const rows = await Appointment.find({ doctorId, date: day })
    .sort({ tokenNumber: 1 })
    .populate('patientId', 'name email')
    .lean();

  res.json({
    status: 'ok',
    data: {
      date: formatDay(day),
      doctorId: doctor._id,
      appointments: rows.map((a) => ({
        id: a._id,
        tokenNumber: a.tokenNumber,
        slotTime: a.slotTime,
        status: a.status,
        patient: a.patientId
          ? { id: a.patientId._id, name: a.patientId.name, email: a.patientId.email }
          : null,
      })),
    },
  });
});
