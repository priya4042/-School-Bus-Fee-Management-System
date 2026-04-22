declare global {
  interface Window {
    EasebuzzCheckout?: any;
  }
}

const CHECKOUT_SRC =
  'https://ebz-static.s3.ap-south-1.amazonaws.com/easecheckout/v2.0.0/easebuzz-checkout.js';

let loader: Promise<boolean> | null = null;

export const loadEasebuzz = (): Promise<boolean> => {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.EasebuzzCheckout) return Promise.resolve(true);
  if (loader) return loader;

  loader = new Promise<boolean>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(!!window.EasebuzzCheckout));
      existing.addEventListener('error', () => resolve(false));
      if (window.EasebuzzCheckout) resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve(!!window.EasebuzzCheckout);
    script.onerror = () => {
      loader = null;
      resolve(false);
    };
    document.head.appendChild(script);
  });

  return loader;
};

export interface EasebuzzResponse {
  status: string;
  txnid: string;
  easepayid?: string;
  payment_id?: string;
  hash: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  [key: string]: any;
}

export interface OpenEasebuzzOptions {
  accessKey: string;
  merchantKey: string;
  env?: 'test' | 'prod';
  themeColor?: string;
  onResponse: (response: EasebuzzResponse) => void;
}

export const openEasebuzzCheckout = async ({
  accessKey,
  merchantKey,
  env = 'test',
  themeColor = '#1e40af',
  onResponse,
}: OpenEasebuzzOptions): Promise<boolean> => {
  const ready = await loadEasebuzz();
  if (!ready || !window.EasebuzzCheckout) return false;

  const checkout = new window.EasebuzzCheckout(merchantKey, env);
  checkout.initiatePayment({
    access_key: accessKey,
    onResponse,
    theme: themeColor,
  });

  return true;
};
