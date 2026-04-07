import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';

function sendError(res, statusCode, message, details) {
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(details && { details }),
  });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.message, err.details);
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => e.message);
    return sendError(res, 400, 'Validation failed', details);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return sendError(res, 409, `Duplicate value for ${field}`);
  }

  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';
  const statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  return sendError(res, statusCode, message);
}
