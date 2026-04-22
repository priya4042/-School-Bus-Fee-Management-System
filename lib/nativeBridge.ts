import { isNative, isAndroid } from './platform';

const STATUS_BAR_COLOR = '#1e40af';
const STATUS_BAR_STYLE_LIGHT = 'LIGHT';

const tryImport = async <T>(modulePath: string): Promise<T | null> => {
  try {
    return (await import(/* @vite-ignore */ modulePath)) as T;
  } catch (err) {
    console.warn(`[nativeBridge] Optional plugin "${modulePath}" not installed.`, err);
    return null;
  }
};

const initStatusBar = async () => {
  if (!isNative()) return;
  const mod: any = await tryImport('@capacitor/status-bar');
  if (!mod?.StatusBar) return;

  try {
    await mod.StatusBar.setOverlaysWebView({ overlay: false });
    if (mod.Style) {
      await mod.StatusBar.setStyle({ style: mod.Style.Light ?? STATUS_BAR_STYLE_LIGHT });
    }
    if (isAndroid()) {
      await mod.StatusBar.setBackgroundColor({ color: STATUS_BAR_COLOR });
    }
  } catch (err) {
    console.warn('[nativeBridge] StatusBar config failed:', err);
  }
};

const hideSplashScreen = async () => {
  if (!isNative()) return;
  const mod: any = await tryImport('@capacitor/splash-screen');
  if (!mod?.SplashScreen) return;
  try {
    await mod.SplashScreen.hide({ fadeOutDuration: 200 });
  } catch (err) {
    console.warn('[nativeBridge] SplashScreen hide failed:', err);
  }
};

let backButtonListener: any = null;
let appStateListener: any = null;

const initHardwareBackButton = async () => {
  if (!isNative()) return;
  const mod: any = await tryImport('@capacitor/app');
  if (!mod?.App) return;

  try {
    backButtonListener?.remove?.();
    backButtonListener = await mod.App.addListener('backButton', (event: any) => {
      const path = window.location.pathname;
      const isRootPath =
        path === '/' ||
        path === '/index.html' ||
        path === '/login' ||
        path.length <= 1;

      if (event?.canGoBack && !isRootPath) {
        window.history.back();
      } else {
        mod.App.exitApp?.();
      }
    });
  } catch (err) {
    console.warn('[nativeBridge] BackButton listener failed:', err);
  }
};

const initAppResumeRefresh = async () => {
  if (!isNative()) return;
  const mod: any = await tryImport('@capacitor/app');
  if (!mod?.App) return;

  try {
    appStateListener?.remove?.();
    appStateListener = await mod.App.addListener('appStateChange', (state: any) => {
      if (state?.isActive) {
        window.dispatchEvent(new CustomEvent('app:resumed'));
      }
    });
  } catch (err) {
    console.warn('[nativeBridge] appStateChange listener failed:', err);
  }
};

let initialized = false;

export const initNativeBridge = async () => {
  if (initialized || !isNative()) return;
  initialized = true;

  await Promise.all([
    initStatusBar(),
    initHardwareBackButton(),
    initAppResumeRefresh(),
  ]);

  setTimeout(() => {
    hideSplashScreen();
  }, 300);
};

export const teardownNativeBridge = () => {
  backButtonListener?.remove?.();
  appStateListener?.remove?.();
  backButtonListener = null;
  appStateListener = null;
  initialized = false;
};
