import env from '../config/env';

/**
 * Generate a random OTP
 */
export const generateOTP = (): string => {
  const length = env.OTP_LENGTH;
  const digits = '0123456789';
  let otp = '';

  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }

  return otp;
};

/**
 * Get OTP expiry date
 */
export const getOTPExpiry = (): Date => {
  const expiryMinutes = env.OTP_EXPIRY_MINUTES;
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + expiryMinutes);
  return expiry;
};

/**
 * Check if OTP is expired
 */
export const isOTPExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt;
};

