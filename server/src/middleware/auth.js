import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export const requireAuth = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(AppError.unauthorized('Missing or malformed token'));
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.jwtAccessSecret);
    req.user = { id: payload.sub };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(AppError.unauthorized('Token expired'));
    }
    next(AppError.unauthorized('Invalid token'));
  }
};
