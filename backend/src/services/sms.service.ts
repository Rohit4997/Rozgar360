import env from '../config/env';
import logger from '../utils/logger';

export interface SMSService {
  sendOTP(phone: string, otp: string): Promise<boolean>;
}

/**
 * Mock SMS Service for development
 */
class MockSMSService implements SMSService {
  async sendOTP(phone: string, otp: string): Promise<boolean> {
    logger.info(`[MOCK SMS] Sending OTP to ${phone}: ${otp}`);
    console.log(`\n📱 OTP for ${phone}: ${otp}\n`);
    return true;
  }
}

/**
 * MSG91 SMS Service
 */
class MSG91Service implements SMSService {
  async sendOTP(phone: string, otp: string): Promise<boolean> {
    try {
      // MSG91 API call would go here
      // Example:
      // const authKey = env.MSG91_AUTH_KEY;
      // const response = await axios.post('https://api.msg91.com/api/v5/otp', {
      //   authkey: authKey,
      //   mobile: phone,
      //   otp: otp,
      //   sender: env.MSG91_SENDER_ID,
      //   template_id: env.MSG91_TEMPLATE_ID
      // });

      logger.info(`OTP sent to ${phone} via MSG91`);
      console.log(`MSG91 would send OTP ${otp} to ${phone}`);
      return true;
    } catch (error) {
      logger.error('MSG91 error:', error);
      return false;
    }
  }
}

/**
 * Twilio SMS Service
 */
class TwilioService implements SMSService {
  async sendOTP(phone: string, otp: string): Promise<boolean> {
    try {
      // Twilio API call would go here
      // Example:
      // const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
      // await client.messages.create({
      //   body: `Your Rozgar360 OTP is: ${otp}`,
      //   from: env.TWILIO_PHONE_NUMBER,
      //   to: phone
      // });

      logger.info(`OTP sent to ${phone} via Twilio`);
      console.log(`Twilio would send OTP ${otp} to ${phone}`);
      return true;
    } catch (error) {
      logger.error('Twilio error:', error);
      return false;
    }
  }
}

/**
 * Factory function to get SMS service based on configuration
 */
export const getSMSService = (): SMSService => {
  switch (env.SMS_PROVIDER) {
    case 'msg91':
      return new MSG91Service();
    case 'twilio':
      return new TwilioService();
    case 'mock':
    default:
      return new MockSMSService();
  }
};

export default getSMSService();

