import { Doctor } from '../models/Doctor.js';
import { AppError } from '../utils/AppError.js';

export async function requireDoctorProfile(userId) {
  const doctor = await Doctor.findOne({ userId });
  if (!doctor) {
    throw new AppError('Doctor profile not found', 404);
  }
  return doctor;
}

export async function assertOwnDoctor(req, doctorMongoId) {
  if (req.user.role !== 'doctor') {
    throw new AppError('Only doctors can perform this action', 403);
  }
  const profile = await requireDoctorProfile(req.user.id);
  if (profile._id.toString() !== doctorMongoId.toString()) {
    throw new AppError('Not your queue', 403);
  }
  return profile;
}
