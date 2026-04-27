import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export interface UpiSettings {
  upiId: string;
  businessName: string;
  source: 'admin' | 'env' | 'fallback';
  updatedAt?: string;
}

const FALLBACK: UpiSettings = {
  upiId: 'business@upi',
  businessName: 'SchoolBusWay',
  source: 'fallback',
};

const CACHE_KEY = 'busway_upi_settings_v1';
const CACHE_TTL_MS = 5 * 60 * 1000;

export const UPI_SETTINGS_UPDATED_EVENT = 'busway:upi-settings-updated';

const readEnv = (): UpiSettings | null => {
  const upiId = String(import.meta.env.VITE_UPI_ID || '').trim();
  const businessName = String(import.meta.env.VITE_BUSINESS_NAME || '').trim();
  if (!upiId) return null;
  return {
    upiId,
    businessName: businessName || 'SchoolBusWay',
    source: 'env',
  };
};

const readCache = (): UpiSettings | null => {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { value: UpiSettings; ts: number };
    if (!parsed?.value?.upiId) return null;
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.value;
  } catch {
    return null;
  }
};

const writeCache = (settings: UpiSettings) => {
  try {
    window.localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ value: settings, ts: Date.now() })
    );
  } catch {
  }
};

export const fetchUpiSettings = async (): Promise<UpiSettings> => {
  try {
    const { data } = await supabase
      .from('payment_settings')
      .select('upi_id, business_name, updated_at')
      .limit(1)
      .single();

    if (data?.upi_id) {
      const result: UpiSettings = {
        upiId: String(data.upi_id).trim(),
        businessName: String(data.business_name || 'SchoolBusWay').trim(),
        source: 'admin',
        updatedAt: data.updated_at,
      };
      writeCache(result);
      return result;
    }
  } catch {
  }

  const envSettings = readEnv();
  if (envSettings) {
    writeCache(envSettings);
    return envSettings;
  }

  return FALLBACK;
};

export const isUpiConfigured = (settings: UpiSettings) =>
  !!settings.upiId &&
  settings.upiId.includes('@') &&
  settings.source !== 'fallback';

export const useUpiSettings = () => {
  const [settings, setSettings] = useState<UpiSettings>(() => readCache() || readEnv() || FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const fresh = await fetchUpiSettings();
      if (!cancelled) {
        setSettings(fresh);
        setLoading(false);
      }
    };

    load();

    const onUpdate = () => load();
    window.addEventListener(UPI_SETTINGS_UPDATED_EVENT, onUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener(UPI_SETTINGS_UPDATED_EVENT, onUpdate);
    };
  }, []);

  return { settings, loading, configured: isUpiConfigured(settings) };
};

export const notifyUpiSettingsUpdated = () => {
  try {
    window.localStorage.removeItem(CACHE_KEY);
  } catch {
  }
  window.dispatchEvent(new Event(UPI_SETTINGS_UPDATED_EVENT));
};
