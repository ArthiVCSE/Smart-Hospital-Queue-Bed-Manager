import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { requireBootstrapKey } from '../middleware/requireBootstrapKey.js';
import {
  createDoctor,
  createDoctorValidators,
  createAdmin,
  createAdminValidators,
} from '../controllers/adminController.js';

const router = Router();

router.use(protect, restrictTo('admin'));

router.post('/doctors', createDoctorValidators, validateRequest, createDoctor);

/** Optional: set INTERNAL_BOOTSTRAP_KEY in env and call with header X-Bootstrap-Key */
const bootstrap = Router();
bootstrap.post(
  '/admin-user',
  requireBootstrapKey,
  createAdminValidators,
  validateRequest,
  createAdmin
);

export default router;
export { bootstrap as adminBootstrapRouter };
