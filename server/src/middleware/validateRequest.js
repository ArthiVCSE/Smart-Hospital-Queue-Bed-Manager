import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

export function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new AppError('Invalid input', 422, {
        fields: errors.array().map((e) => ({ field: e.path, msg: e.msg })),
      })
    );
  }
  next();
}
