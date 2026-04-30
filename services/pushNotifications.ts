/**
 * Capacitor PushNotifications bridge — FCM on Android.
 *
 * What this does on app start:
 *  1. Requests permission (Android shows the system prompt).
 *  2. Registers for push, gets the FCM device token.
 *  3. Stores the token against the current user in `fcm_tokens` so the
 *     backend knows where to deliver notifications for this user.
 *  4. Listens for foreground notifications and surfaces them as toasts
 *     (so the user sees them whether the app is open or not).
 *
 * Setup required (once, by you):
 *  - Create a Firebase project at https://console.firebase.google.com
 *  - Add an Android app with package id com.buswaypro.app
 *  - Download google-services.json and drop it in:
 *        android/app/google-services.json
 *  - In android/build.gradle, ensure classpath:
 *        'com.google.gms:google-services:4.4.0'
 *  - In android/app/build.gradle, ensure plugin line at the bottom:
 *        apply plugin: 'com.google.gms.google-services'
 *
 * Until those are in place this bridge is a no-op on Android (the
 * Capacitor plugin's register() call simply errors out and we swallow
 * the error so the rest of the app keeps running).
 *
 * Required SQL (run once in Supabase SQL editor):
 *
 *   CREATE TABLE IF NOT EXISTS public.fcm_tokens (
 *     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *     user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 *     token TEXT NOT NULL,
 *     platform TEXT,
 *     created_at TIMESTAMPTZ DEFAULT NOW(),
 *     UNIQUE (user_id, token)
 *   );
 *   ALTER TABLE public.fcm_tokens ENABLE ROW LEVEL SECURITY;
 *   CREATE POLICY "user manages own tokens" ON public.fcm_tokens
 *     FOR ALL TO authenticated
 *     USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
 */

import { supabase } from '../lib/supabase';
import { showToast } from './../lib/swal';

let initialized = false;
let registeredToken: string | null = null;

const isCapacitor = () => !!(window as any).Capacitor?.isNativePlatform?.();

const safeImport = async () => {
  try {
    return await import('@capacitor/push-notifications');
  } catch {
    return null;
  }
};

export const initPushNotifications = async (userId: string) => {
  if (initialized || !userId) return;
  if (!isCapacitor()) return;
  initialized = true;

  const mod = await safeImport();
  if (!mod) return;
  const { PushNotifications } = mod;

  try {
    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }
    if (permStatus.receive !== 'granted') {
      console.warn('Push permission denied');
      return;
    }

    await PushNotifications.register();

    PushNotifications.addListener('registration', async (info: any) => {
      registeredToken = info?.value || null;
      if (!registeredToken) return;
      try {
        await supabase.from('fcm_tokens').upsert(
          {
            user_id: userId,
            token: registeredToken,
            platform: 'android',
            created_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,token' },
        );
      } catch (err) {
        console.warn('Failed to save FCM token (non-fatal):', err);
      }
    });

    PushNotifications.addListener('registrationError', (err: any) => {
      console.warn('FCM registration error (non-fatal — Firebase project not set up?):', err);
    });

    // Foreground push: show as a toast so the user notices even when the app is open.
    PushNotifications.addListener('pushNotificationReceived', (n: any) => {
      const title = n?.title || 'BusWayPro';
      const body = n?.body || '';
      showToast(`${title}${body ? ': ' + body : ''}`, 'info');
    });

    // User tapped the OS notification — could navigate to a deep link here later.
    PushNotifications.addListener('pushNotificationActionPerformed', (action: any) => {
      console.log('Push action:', action);
    });
  } catch (err) {
    console.warn('initPushNotifications skipped (non-fatal):', err);
  }
};

/** Detach this device's FCM token on logout. */
export const teardownPushNotifications = async (userId: string) => {
  if (!registeredToken || !userId) return;
  try {
    await supabase.from('fcm_tokens').delete().eq('user_id', userId).eq('token', registeredToken);
  } catch { /* ignore */ }
  registeredToken = null;
  initialized = false;
};
