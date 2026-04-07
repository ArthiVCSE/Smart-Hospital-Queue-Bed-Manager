import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  register,
  login,
  me,
  registerValidators,
  loginValidators,
} from '../controllers/authController.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', strictAuthLimiter, registerValidators, validateRequest, register);
router.post('/login', strictAuthLimiter, loginValidators, validateRequest, login);
router.get('/me', authLimiter, protect, me);

export default router;
