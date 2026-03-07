import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export const sendSMS = async (to: string, message: string) => {
  if (!client || !fromNumber) {
    console.warn('[Twilio] Credentials missing. SMS not sent:', message);
    return null;
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: to
    });
    console.log(`[Twilio] SMS sent to ${to}. SID: ${result.sid}`);
    return result.sid;
  } catch (error) {
    console.error(`[Twilio] Error sending SMS to ${to}:`, error);
    throw error;
  }
};
