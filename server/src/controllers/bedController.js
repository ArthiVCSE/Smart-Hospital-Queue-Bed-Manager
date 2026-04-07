import { body, param, query } from 'express-validator';
import { Bed, BED_TYPES } from '../models/Bed.js';
import { User } from '../models/User.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import { getBedsSnapshot } from '../services/bedSnapshot.js';
import { broadcastBedsState } from '../realtime/socket.js';

export const listBedsValidators = [
  query('type').optional().isIn(BED_TYPES),
];

export const listBeds = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.type) filter.type = req.query.type;

  const data = await getBedsSnapshot(filter);
  res.json({
    status: 'ok',
    data,
  });
});

export const createBedValidators = [
  body('bedCode').trim().notEmpty(),
  body('type').isIn(BED_TYPES),
];

export const createBed = catchAsync(async (req, res) => {
  const { bedCode, type } = req.body;
  const bed = await Bed.create({ bedCode, type, status: 'AVAILABLE' });
  await broadcastBedsState();
  res.status(201).json({
    status: 'ok',
    data: {
      bed: {
        id: bed._id,
        bedCode: bed.bedCode,
        type: bed.type,
        status: bed.status,
      },
    },
  });
});

export const assignBedValidators = [
  param('bedId').isMongoId(),
  body('patientId').isMongoId(),
];

export const assignBed = catchAsync(async (req, res) => {
  const { bedId } = req.params;
  const { patientId } = req.body;

  const patient = await User.findById(patientId);
  if (!patient || patient.role !== 'patient') {
    throw new AppError('Invalid patient', 400);
  }

  const bed = await Bed.findById(bedId);
  if (!bed) throw new AppError('Bed not found', 404);
  if (bed.status !== 'AVAILABLE') {
    throw new AppError('Only an available bed can be assigned', 409);
  }

  bed.status = 'OCCUPIED';
  bed.patientId = patientId;
  await bed.save();

  await broadcastBedsState();

  res.json({
    status: 'ok',
    data: {
      bed: {
        id: bed._id,
        bedCode: bed.bedCode,
        type: bed.type,
        status: bed.status,
        patientId: bed.patientId,
      },
    },
  });
});

export const reserveBedValidators = [
  param('bedId').isMongoId(),
];

export const reserveBed = catchAsync(async (req, res) => {
  const bed = await Bed.findById(req.params.bedId);
  if (!bed) throw new AppError('Bed not found', 404);
  if (bed.status !== 'AVAILABLE') {
    throw new AppError('Only an available bed can be reserved', 409);
  }
  bed.status = 'RESERVED';
  bed.patientId = null;
  await bed.save();
  await broadcastBedsState();
  res.json({
    status: 'ok',
    data: { bed: { id: bed._id, status: bed.status } },
  });
});

export const dischargeBedValidators = [param('bedId').isMongoId()];

export const dischargeBed = catchAsync(async (req, res) => {
  const bed = await Bed.findById(req.params.bedId);
  if (!bed) throw new AppError('Bed not found', 404);
  if (bed.status === 'AVAILABLE') {
    throw new AppError('Bed is already free', 409);
  }
  bed.status = 'AVAILABLE';
  bed.patientId = null;
  await bed.save();
  await broadcastBedsState();
  res.json({
    status: 'ok',
    data: {
      bed: {
        id: bed._id,
        bedCode: bed.bedCode,
        status: bed.status,
      },
    },
  });
});
