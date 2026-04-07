import { Doctor } from '../models/Doctor.js';
import { Appointment } from '../models/Appointment.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import { parseDay, formatDay } from '../utils/date.js';
import { generateSlots } from '../utils/slots.js';

export const listDoctors = catchAsync(async (req, res) => {
  const doctors = await Doctor.find()
    .populate('userId', 'name email')
    .sort({ department: 1 })
    .lean();

  res.json({
    status: 'ok',
    data: {
      doctors: doctors.map((d) => ({
        id: d._id,
        department: d.department,
        workingHours: d.workingHours,
        slotMinutes: d.slotMinutes,
        name: d.userId?.name,
        email: d.userId?.email,
      })),
    },
  });
});

export const getDoctorSlots = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { date: dateStr } = req.query;
  if (!dateStr) throw new AppError('Query ?date=YYYY-MM-DD is required', 400);

  const doctor = await Doctor.findById(id);
  if (!doctor) throw new AppError('Doctor not found', 404);

  const day = parseDay(dateStr);
  const allSlots = generateSlots(doctor.workingHours, doctor.slotMinutes);
  const taken = await Appointment.find({
    doctorId: doctor._id,
    date: day,
    status: { $nin: ['CANCELLED', 'NO_SHOW'] },
  })
    .select('slotTime')
    .lean();

  const takenSet = new Set(taken.map((a) => a.slotTime));
  const available = allSlots.filter((s) => !takenSet.has(s));

  res.json({
    status: 'ok',
    data: {
      doctorId: doctor._id,
      date: formatDay(day),
      slotMinutes: doctor.slotMinutes,
      availableSlots: available,
      bookedSlots: Array.from(takenSet),
    },
  });
});
