import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import {
  getQueue,
  myQueuePosition,
  startConsult,
  completeConsult,
  callNext,
} from '../controllers/queueController.js';

const router = Router();

router.get('/appointments/:appointmentId/position', protect, restrictTo('patient'), myQueuePosition);

router.post('/appointments/:appointmentId/start', protect, restrictTo('doctor'), startConsult);
router.post('/appointments/:appointmentId/complete', protect, restrictTo('doctor'), completeConsult);
router.post('/doctors/:doctorId/call-next', protect, restrictTo('doctor'), callNext);

router.get('/:doctorId', getQueue);

export default router;
