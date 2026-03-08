const twilio = require('twilio');

let client;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
} else {
  console.warn('Missing Twilio credentials. SMS will not be sent.');
  client = {
    messages: {
      create: async (msg) => {
        console.log('MOCKED SMS:', msg);
        return { sid: 'mock-sid' };
      }
    }
  };
}

const sendSMS = async (to, body) => {
  try {
    // Ensure phone number is in E.164 format
    let formattedPhone = to;
    if (!to.startsWith('+')) {
      formattedPhone = `+91${to.replace(/\D/g, '').slice(-10)}`;
    }

    const message = await client.messages.create({
      body: body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });
    console.log(`SMS sent successfully: ${message.sid}`);
    return message;
  } catch (error) {
    console.error('Error sending SMS:', error);
    // Don't throw error to avoid breaking the main flow, just log it
    return null;
  }
};

module.exports = { sendSMS };
