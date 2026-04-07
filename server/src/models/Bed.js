import mongoose from 'mongoose';

export const BED_TYPES = ['ICU', 'GENERAL', 'EMERGENCY'];
export const BED_STATUSES = ['AVAILABLE', 'OCCUPIED', 'RESERVED'];

const bedSchema = new mongoose.Schema(
  {
    bedCode: { type: String, required: true, trim: true },
    type: { type: String, enum: BED_TYPES, required: true },
    status: {
      type: String,
      enum: BED_STATUSES,
      default: 'AVAILABLE',
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

bedSchema.index({ bedCode: 1 }, { unique: true });

export const Bed = mongoose.model('Bed', bedSchema);
