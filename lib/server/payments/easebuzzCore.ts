import crypto from 'crypto';

const cleanEnv = (value: string) => String(value || '').trim().replace(/^['\"]|['\"]$/g, '');

export const resolveEasebuzzKeys = () => {
  const key = cleanEnv(process.env.EASEBUZZ_KEY || process.env.VITE_EASEBUZZ_KEY || '');
  const salt = cleanEnv(process.env.EASEBUZZ_SALT || '');
  const env = cleanEnv(process.env.EASEBUZZ_ENV || 'test').toLowerCase();
  return { key, salt, env: env === 'prod' || env === 'production' ? 'prod' : 'test' };
};

export const easebuzzBaseUrl = (env: string) =>
  env === 'prod' ? 'https://pay.easebuzz.in' : 'https://testpay.easebuzz.in';

/**
 * Request hash (sent TO Easebuzz when creating order):
 * sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt)
 */
export const generateEasebuzzRequestHash = (params: {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  salt: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  udf6?: string;
  udf7?: string;
  udf8?: string;
  udf9?: string;
  udf10?: string;
}) => {
  const u = (v?: string) => String(v || '');
  const hashString = [
    params.key,
    params.txnid,
    params.amount,
    params.productinfo,
    params.firstname,
    params.email,
    u(params.udf1),
    u(params.udf2),
    u(params.udf3),
    u(params.udf4),
    u(params.udf5),
    u(params.udf6),
    u(params.udf7),
    u(params.udf8),
    u(params.udf9),
    u(params.udf10),
    params.salt,
  ].join('|');
  return crypto.createHash('sha512').update(hashString).digest('hex');
};

/**
 * Response hash (received FROM Easebuzz after payment, reverse order):
 * sha512(salt|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export const verifyEasebuzzResponseHash = (input: {
  status: string;
  email: string;
  firstname: string;
  productinfo: string;
  amount: string;
  txnid: string;
  responseHash: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  udf6?: string;
  udf7?: string;
  udf8?: string;
  udf9?: string;
  udf10?: string;
  key?: string;
  salt?: string;
}) => {
  const resolved = resolveEasebuzzKeys();
  const keys = [cleanEnv(input.key || ''), resolved.key].filter(Boolean);
  const salts = [cleanEnv(input.salt || ''), resolved.salt].filter(Boolean);

  if (salts.length === 0) throw new Error('EASEBUZZ_SALT is not configured on server');
  if (keys.length === 0) throw new Error('EASEBUZZ_KEY is not configured on server');

  const u = (v?: string) => String(v || '');
  const expected = String(input.responseHash || '').toLowerCase();

  for (const salt of [...new Set(salts)]) {
    for (const key of [...new Set(keys)]) {
      const hashString = [
        salt,
        input.status,
        u(input.udf10),
        u(input.udf9),
        u(input.udf8),
        u(input.udf7),
        u(input.udf6),
        u(input.udf5),
        u(input.udf4),
        u(input.udf3),
        u(input.udf2),
        u(input.udf1),
        input.email,
        input.firstname,
        input.productinfo,
        input.amount,
        input.txnid,
        key,
      ].join('|');

      const generated = crypto.createHash('sha512').update(hashString).digest('hex');
      if (generated.toLowerCase() === expected) return true;
    }
  }

  return false;
};
