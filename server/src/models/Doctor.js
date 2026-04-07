import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    department: { type: String, required: true, trim: true },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
    },
    slotMinutes: { type: Number, default: 30, min: 15, max: 120 },
  },
  { timestamps: true }
);

export const Doctor = mongoose.model('Doctor', doctorSchema);
