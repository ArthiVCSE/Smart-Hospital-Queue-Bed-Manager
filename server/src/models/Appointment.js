import mongoose from 'mongoose';

export const APPOINTMENT_STATUSES = [
  'BOOKED',
  'IN_QUEUE',
  'IN_CONSULT',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
];

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    date: { type: Date, required: true },
    slotTime: { type: String, required: true, trim: true },
    tokenNumber: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: APPOINTMENT_STATUSES,
      default: 'IN_QUEUE',
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ doctorId: 1, date: 1, slotTime: 1 }, { unique: true });
appointmentSchema.index({ doctorId: 1, date: 1, tokenNumber: 1 }, { unique: true });
appointmentSchema.index({ doctorId: 1, date: 1, status: 1 });

export const Appointment = mongoose.model('Appointment', appointmentSchema);
