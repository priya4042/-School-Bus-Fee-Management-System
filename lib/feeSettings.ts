export const FEE_SETTINGS_KEY = 'busway_fee_settings_v1';
export const FEE_SETTINGS_UPDATED_EVENT = 'busway:fee-settings-updated';

export type FeeSettings = {
  cutoffDay: number;
  gracePeriod: number;
  dailyPenalty: number;
  maxPenalty: number;
  strictNoSkip: boolean;
  enforce2FA: boolean;
  adminPaymentQrUrl: string;
  adminUpiId: string;
};

export const defaultFeeSettings: FeeSettings = {
  cutoffDay: 10,
  gracePeriod: 2,
  dailyPenalty: 50,
  maxPenalty: 500,
  strictNoSkip: true,
  enforce2FA: false,
  adminPaymentQrUrl: '',
  adminUpiId: '',
};

const toNumber = (value: any, fallback: number) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

export const normalizeFeeSettings = (raw: any): FeeSettings => {
  const data = raw || {};
  return {
    cutoffDay: Math.max(1, Math.min(31, toNumber(data.cutoffDay, defaultFeeSettings.cutoffDay))),
    gracePeriod: Math.max(0, toNumber(data.gracePeriod, defaultFeeSettings.gracePeriod)),
    dailyPenalty: Math.max(0, toNumber(data.dailyPenalty, defaultFeeSettings.dailyPenalty)),
    maxPenalty: Math.max(0, toNumber(data.maxPenalty, defaultFeeSettings.maxPenalty)),
    strictNoSkip: typeof data.strictNoSkip === 'boolean' ? data.strictNoSkip : defaultFeeSettings.strictNoSkip,
    enforce2FA: typeof data.enforce2FA === 'boolean' ? data.enforce2FA : defaultFeeSettings.enforce2FA,
    adminPaymentQrUrl: String(data.adminPaymentQrUrl || '').trim(),
    adminUpiId: String(data.adminUpiId || '').trim(),
  };
};

export const loadFeeSettings = (): FeeSettings => {
  try {
    const raw = window.localStorage.getItem(FEE_SETTINGS_KEY);
    if (!raw) return { ...defaultFeeSettings };
    return normalizeFeeSettings(JSON.parse(raw));
  } catch {
    return { ...defaultFeeSettings };
  }
};

export const saveFeeSettings = (settings: any) => {
  const normalized = normalizeFeeSettings(settings);
  window.localStorage.setItem(FEE_SETTINGS_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent(FEE_SETTINGS_UPDATED_EVENT, { detail: normalized }));
  return normalized;
};
