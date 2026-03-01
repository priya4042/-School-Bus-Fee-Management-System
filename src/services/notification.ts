import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

const client = twilio(accountSid, authToken);

export const sendWhatsAppMessage = async (to: string, message: string) => {
  if (!accountSid || !authToken) {
    console.warn('[Twilio] Credentials missing. Skipping WhatsApp message.');
    return;
  }

  try {
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    await client.messages.create({
      body: message,
      from: fromWhatsApp,
      to: formattedTo,
    });
    console.log(`[Twilio] WhatsApp message sent to ${to}`);
  } catch (error) {
    console.error('[Twilio] Failed to send WhatsApp message:', error);
  }
};

export const sendPaymentConfirmation = async (parentPhone: string, studentName: string, month: string, amount: number) => {
  const message = `Payment Received\n\nStudent: ${studentName}\nMonth: ${month}\nAmount: ₹${amount}\n\nThank you for using BusWay Pro.`;
  await sendWhatsAppMessage(parentPhone, message);
};
