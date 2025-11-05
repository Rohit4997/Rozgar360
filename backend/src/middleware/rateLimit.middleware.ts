import rateLimit from 'express-rate-limit';
import env from '../config/env';

/**
 * General rate limiter
 */
export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * OTP rate limiter (stricter)
 */
export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: env.OTP_RATE_LIMIT_MAX,
  message: {
    success: false,
    message: 'Too many OTP requests, please try again after 1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body.phone || req.ip || '',
});

