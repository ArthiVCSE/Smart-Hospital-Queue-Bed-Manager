import { body } from 'express-validator';
import { User } from '../models/User.js';
import { Doctor } from '../models/Doctor.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';

export const createDoctorValidators = [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('department').trim().notEmpty(),
  body('workingHours.start').optional().matches(/^\d{2}:\d{2}$/),
  body('workingHours.end').optional().matches(/^\d{2}:\d{2}$/),
  body('slotMinutes').optional().isInt({ min: 15, max: 120 }),
];

export const createDoctor = catchAsync(async (req, res) => {
  const { name, email, password, department, workingHours, slotMinutes } = req.body;

  let user;
  try {
    user = await User.create({ name, email, password, role: 'doctor' });
    const doctor = await Doctor.create({
      userId: user._id,
      department,
      workingHours: workingHours || undefined,
      slotMinutes: slotMinutes ?? undefined,
    });
    res.status(201).json({
      status: 'ok',
      data: {
        doctor: {
          id: doctor._id,
          userId: user._id,
          department: doctor.department,
          workingHours: doctor.workingHours,
          slotMinutes: doctor.slotMinutes,
        },
      },
    });
  } catch (err) {
    if (user?._id) await User.deleteOne({ _id: user._id });
    if (err.code === 11000) {
      throw new AppError('Email already in use', 409);
    }
    throw err;
  }
});

export const createAdminValidators = [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
];

/** One-time style bootstrap; protect in production via env flag if desired. */
export const createAdmin = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.create({ name, email, password, role: 'admin' });
  res.status(201).json({
    status: 'ok',
    data: { user: { id: user._id, name: user.name, email: user.email, role: user.role } },
  });
});
