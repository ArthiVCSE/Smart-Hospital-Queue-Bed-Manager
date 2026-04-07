import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  bookAppointment,
  bookValidators,
  myAppointments,
  myAppointmentsValidators,
  doctorDayAppointments,
  doctorDayAppointmentsValidators,
} from '../controllers/appointmentController.js';

const router = Router();

router.post(
  '/book',
  protect,
  restrictTo('patient'),
  bookValidators,
  validateRequest,
  bookAppointment
);

router.get('/me', protect, restrictTo('patient'), myAppointmentsValidators, validateRequest, myAppointments);

router.get(
  '/doctor/:doctorId',
  protect,
  doctorDayAppointmentsValidators,
  validateRequest,
  doctorDayAppointments
);

export default router;
