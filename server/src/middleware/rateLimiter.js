import rateLimit from 'express-rate-limit';
import { ErrorCode } from '../utils/errorCodes.js';

export const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many requests, please try again later', code: ErrorCode.RATE_LIMITED },
  },
});

export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many auth attempts, please try again later', code: ErrorCode.RATE_LIMITED },
  },
});

export const voteLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many votes, please slow down', code: ErrorCode.RATE_LIMITED },
  },
});

export const createPollLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many polls created, please try again later', code: ErrorCode.RATE_LIMITED },
  },
});
