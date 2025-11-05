import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { otpLimiter } from '../middleware/rateLimit.middleware';
import {
  sendOTPSchema,
  verifyOTPSchema,
  refreshTokenSchema,
  logoutSchema,
} from '../validators/auth.validator';

const router = Router();

// Public routes
router.post('/send-otp', otpLimiter, validate(sendOTPSchema), authController.sendOTP.bind(authController));
router.post('/verify-otp', validate(verifyOTPSchema), authController.verifyOTP.bind(authController));
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken.bind(authController));

// Protected routes
router.post('/logout', authenticate, validate(logoutSchema), authController.logout.bind(authController));

export default router;

