import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  listBeds,
  listBedsValidators,
  createBed,
  createBedValidators,
  assignBed,
  assignBedValidators,
  reserveBed,
  reserveBedValidators,
  dischargeBed,
  dischargeBedValidators,
} from '../controllers/bedController.js';

const router = Router();

router.use(protect, restrictTo('admin'));

router.get('/', listBedsValidators, validateRequest, listBeds);
router.post('/', createBedValidators, validateRequest, createBed);
router.post('/:bedId/assign', assignBedValidators, validateRequest, assignBed);
router.post('/:bedId/reserve', reserveBedValidators, validateRequest, reserveBed);
router.post('/:bedId/discharge', dischargeBedValidators, validateRequest, dischargeBed);

export default router;
