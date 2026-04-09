import crypto from 'crypto';

const cleanEnv = (value: string) => String(value || '').trim().replace(/^['\"]|['\"]$/g, '');

/**
 * Verify PayU response hash (reverse hash).
 * PayU response hash formula:
 * sha512(salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 *
 * If additionalCharges is present:
 * sha512(additionalCharges|salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export const verifyPayUResponseHash = (input: {
  salt: string;
  status: string;
  email: string;
  firstname: string;
  productinfo: string;
  amount: string;
  txnid: string;
  key: string;
  responseHash: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  additionalCharges?: string;
}) => {
  const salts = [
    cleanEnv(input.salt || ''),
    cleanEnv(process.env.PAYU_MERCHANT_SALT || ''),
    cleanEnv(process.env.VITE_PAYU_MERCHANT_SALT || ''),
  ].filter(Boolean);

  const keys = [
    cleanEnv(input.key || ''),
    cleanEnv(process.env.PAYU_MERCHANT_KEY || ''),
    cleanEnv(process.env.VITE_PAYU_MERCHANT_KEY || ''),
  ].filter(Boolean);

  if (salts.length === 0) {
    throw new Error('PAYU_MERCHANT_SALT is not configured on server');
  }

  if (keys.length === 0) {
    throw new Error('PAYU_MERCHANT_KEY is not configured on server');
  }

  for (const salt of [...new Set(salts)]) {
    for (const key of [...new Set(keys)]) {
      // Standard reverse hash
      let hashString = `${salt}|${input.status}||||||${input.udf5 || ''}|${input.udf4 || ''}|${input.udf3 || ''}|${input.udf2 || ''}|${input.udf1 || ''}|${input.email}|${input.firstname}|${input.productinfo}|${input.amount}|${input.txnid}|${key}`;

      // If additional charges present, prepend them
      if (input.additionalCharges && input.additionalCharges !== '' && input.additionalCharges !== '0') {
        hashString = `${input.additionalCharges}|${hashString}`;
      }

      const generated = crypto.createHash('sha512').update(hashString).digest('hex');

      if (generated === input.responseHash) {
        return true;
      }
    }
  }

  return false;
};

// Legacy export alias for backward compatibility
export const verifyCheckoutSignature = verifyPayUResponseHash;
export const verifyWebhookSignature = (_payload: string, _signature: string) => {
  // PayU uses response hash verification, not a separate webhook signature.
  // This is kept for backward compatibility but should not be called.
  return false;
};
