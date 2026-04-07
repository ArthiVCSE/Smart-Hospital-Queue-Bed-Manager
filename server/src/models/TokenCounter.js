import mongoose from 'mongoose';

/** Atomic per doctor per day token sequence (survives concurrent bookings). */
const tokenCounterSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    date: { type: Date, required: true },
    seq: { type: Number, default: 0 },
  },
  { timestamps: true }
);

tokenCounterSchema.index({ doctorId: 1, date: 1 }, { unique: true });

export const TokenCounter = mongoose.model('TokenCounter', tokenCounterSchema);

export async function nextTokenNumber(doctorId, dayStart) {
  const doc = await TokenCounter.findOneAndUpdate(
    { doctorId, date: dayStart },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return doc.seq;
}

export async function rollbackTokenNumber(doctorId, dayStart) {
  await TokenCounter.findOneAndUpdate(
    { doctorId, date: dayStart, seq: { $gt: 0 } },
    { $inc: { seq: -1 } }
  );
}
