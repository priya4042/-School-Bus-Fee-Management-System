type PaymentEmailContext = {
  transactionId: string;
  dueId: string;
  studentName: string;
  monthLabel: string;
  amountPaid: number;
};

const isEnabled = () => {
  const enabled = String(process.env.PAYMENT_EMAIL_ENABLED || 'false').toLowerCase();
  return enabled === 'true' || enabled === '1' || enabled === 'yes';
};

const getResendKey = () => String(process.env.RESEND_API_KEY || '').trim();
const getFromEmail = () => String(process.env.PAYMENT_EMAIL_FROM || process.env.EMAIL_FROM || '').trim();

const sendViaResend = async (to: string[], subject: string, html: string) => {
  const apiKey = getResendKey();
  const from = getFromEmail();

  if (!apiKey || !from || to.length === 0) {
    return false;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
    }),
  });

  return response.ok;
};

const paymentTemplate = (title: string, context: PaymentEmailContext) => {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;max-width:640px;margin:0 auto;">
      <h2 style="margin-bottom:8px;">${title}</h2>
      <p>Payment has been verified successfully.</p>
      <table style="border-collapse:collapse;width:100%;margin-top:12px;">
        <tr><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Student</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">${context.studentName}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Amount</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">₹${context.amountPaid.toLocaleString('en-IN')}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Month</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">${context.monthLabel}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Transaction ID</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">${context.transactionId}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e2e8f0;"><strong>Due ID</strong></td><td style="padding:8px;border:1px solid #e2e8f0;">${context.dueId}</td></tr>
      </table>
    </div>
  `;
};

const uniqueEmails = (emails: string[]) => {
  const cleaned = emails.map((email) => String(email || '').trim().toLowerCase()).filter(Boolean);
  return [...new Set(cleaned)];
};

export const sendPaymentEmails = async (input: {
  parentEmail?: string | null;
  adminEmails?: string[];
  context: PaymentEmailContext;
}) => {
  if (!isEnabled()) {
    return {
      sent: false,
      reason: 'disabled' as const,
      provider: 'resend' as const,
      parentRecipients: [] as string[],
      adminRecipients: [] as string[],
      parentSent: false,
      adminSent: false,
    };
  }

  const parentRecipients = uniqueEmails([input.parentEmail || '']);
  const adminRecipients = uniqueEmails(input.adminEmails || []);

  const parentSubject = 'Fee Payment Successful';
  const adminSubject = 'Parent Fee Payment Confirmed';

  const parentHtml = paymentTemplate('Fee Payment Successful', input.context);
  const adminHtml = paymentTemplate('Parent Fee Payment Confirmed', input.context);

  const [parentOk, adminOk] = await Promise.all([
    sendViaResend(parentRecipients, parentSubject, parentHtml),
    sendViaResend(adminRecipients, adminSubject, adminHtml),
  ]);

  return {
    sent: parentOk || adminOk,
    parentSent: parentOk,
    adminSent: adminOk,
    provider: 'resend' as const,
    parentRecipients,
    adminRecipients,
  };
};
