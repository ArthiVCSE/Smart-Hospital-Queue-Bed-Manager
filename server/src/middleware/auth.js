import { AppError } from '../utils/AppError.js';
import { verifyToken } from '../utils/token.js';
import { User } from '../models/User.js';

export async function protect(req, res, next) {
  let token;
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    token = header.slice(7);
  }
  if (!token) {
    return next(new AppError('You are not logged in', 401));
  }
  try {
    const payload = verifyToken(token);
    if (!payload?.sub) {
      return next(new AppError('Invalid token', 401));
    }
    const user = await User.findById(payload.sub);
    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }
    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name,
    };
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
}

export function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission', 403));
    }
    next();
  };
}
