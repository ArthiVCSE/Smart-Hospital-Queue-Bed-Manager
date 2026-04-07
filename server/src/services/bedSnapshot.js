import { Bed, BED_TYPES } from '../models/Bed.js';

export async function getBedsSnapshot(filter = {}) {
  const beds = await Bed.find(filter).sort({ type: 1, bedCode: 1 }).lean();

  const summary = BED_TYPES.map((t) => ({
    type: t,
    total: beds.filter((b) => b.type === t).length,
    available: beds.filter((b) => b.type === t && b.status === 'AVAILABLE').length,
    occupied: beds.filter((b) => b.type === t && b.status === 'OCCUPIED').length,
    reserved: beds.filter((b) => b.type === t && b.status === 'RESERVED').length,
  }));

  return {
    summary,
    beds: beds.map((b) => ({
      id: b._id,
      bedCode: b.bedCode,
      type: b.type,
      status: b.status,
      patientId: b.patientId || null,
    })),
  };
}
