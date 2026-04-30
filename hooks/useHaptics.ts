/**
 * Tiny wrapper around @capacitor/haptics with web fallback.
 *
 * Use these tap helpers anywhere a press should feel "physical":
 *   tapLight()  — tab switches, secondary buttons
 *   tapMedium() — primary submit (Save, Pay)
 *   tapHeavy()  — destructive (Delete, Logout) and critical (Emergency)
 *   tapSuccess() / tapWarning() / tapError() — outcome feedback after async ops
 *
 * On native (Android/iOS) this triggers the platform haptic engine.
 * On web it's a no-op (no Vibration API hammering on Chrome warning).
 * Fully type-safe, never throws — failures are swallowed silently so a
 * missing plugin never breaks the UI.
 */

const isCapacitor = () => !!(window as any).Capacitor?.isNativePlatform?.();

const safeImport = async () => {
  try {
    return await import('@capacitor/haptics');
  } catch {
    return null;
  }
};

export const tapLight = async () => {
  if (!isCapacitor()) return;
  const mod = await safeImport();
  try { await mod?.Haptics.impact({ style: mod.ImpactStyle.Light }); } catch { /* ignore */ }
};

export const tapMedium = async () => {
  if (!isCapacitor()) return;
  const mod = await safeImport();
  try { await mod?.Haptics.impact({ style: mod.ImpactStyle.Medium }); } catch { /* ignore */ }
};

export const tapHeavy = async () => {
  if (!isCapacitor()) return;
  const mod = await safeImport();
  try { await mod?.Haptics.impact({ style: mod.ImpactStyle.Heavy }); } catch { /* ignore */ }
};

export const tapSuccess = async () => {
  if (!isCapacitor()) return;
  const mod = await safeImport();
  try { await mod?.Haptics.notification({ type: mod.NotificationType.Success }); } catch { /* ignore */ }
};

export const tapWarning = async () => {
  if (!isCapacitor()) return;
  const mod = await safeImport();
  try { await mod?.Haptics.notification({ type: mod.NotificationType.Warning }); } catch { /* ignore */ }
};

export const tapError = async () => {
  if (!isCapacitor()) return;
  const mod = await safeImport();
  try { await mod?.Haptics.notification({ type: mod.NotificationType.Error }); } catch { /* ignore */ }
};

/** Convenience: returns the same set as a hook so React components can destructure. */
export const useHaptics = () => ({
  tapLight,
  tapMedium,
  tapHeavy,
  tapSuccess,
  tapWarning,
  tapError,
});
