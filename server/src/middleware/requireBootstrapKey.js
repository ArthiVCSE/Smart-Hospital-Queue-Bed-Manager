import { AppError } from '../utils/AppError.js';

export function requireBootstrapKey(req, res, next) {
  const key = process.env.INTERNAL_BOOTSTRAP_KEY;
  if (!key) {
    return next(new AppError('Bootstrap is disabled', 403));
  }
  if (req.headers['x-bootstrap-key'] !== key) {
    return next(new AppError('Invalid bootstrap key', 403));
  }
  next();
}
