import { Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';

export type Platform = 'web' | 'ios' | 'android';

export const getPlatform = (): Platform => {
  try {
    const native = Capacitor.getPlatform();
    if (native === 'ios') return 'ios';
    if (native === 'android') return 'android';
  } catch {
  }
  return 'web';
};

export const isNative = (): boolean => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

export const isWeb = (): boolean => !isNative();

export const isAndroid = (): boolean => getPlatform() === 'android';
export const isIOS = (): boolean => getPlatform() === 'ios';

export const applyPlatformClass = () => {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  const platform = getPlatform();

  html.classList.remove('platform-web', 'platform-native', 'platform-android', 'platform-ios');
  if (isNative()) {
    html.classList.add('platform-native');
    if (platform === 'android') html.classList.add('platform-android');
    if (platform === 'ios') html.classList.add('platform-ios');
  } else {
    html.classList.add('platform-web');
  }
};

export const usePlatform = () => {
  const [platform, setPlatform] = useState<Platform>(() => getPlatform());
  const [native, setNative] = useState<boolean>(() => isNative());

  useEffect(() => {
    setPlatform(getPlatform());
    setNative(isNative());
  }, []);

  return {
    platform,
    isNative: native,
    isWeb: !native,
    isAndroid: platform === 'android',
    isIOS: platform === 'ios',
  };
};
