# BusWay Pro Release Readiness (Render + Play Store)

Date: 2026-03-11

## Status Summary
- ✅ App compiles and builds (`npm run lint`, `npm run build`)
- ✅ API base URL supports Render (`VITE_API_BASE_URL`)
- ✅ Password reset redirect is now configurable (`VITE_AUTH_REDIRECT_URL`)
- ✅ Account deletion path exists in Profile
- ✅ Privacy and Terms pages exist
- ⚠️ Render/Supabase/Play Console settings must be configured manually

## Checklist

### 1) Environment Variables
- [ ] Set these in production hosting:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_API_BASE_URL`
  - `VITE_APP_URL`
  - `VITE_AUTH_REDIRECT_URL`
  - `VITE_RAZORPAY_KEY_ID`
  - `VITE_GOOGLE_MAPS_API_KEY`
- Evidence in code: `config/env.ts`, `.env.example`, `.env.production`

### 2) Auth Redirects (Supabase)
- [ ] In Supabase Auth settings, configure:
  - Site URL = `VITE_APP_URL`
  - Redirect URLs include `VITE_AUTH_REDIRECT_URL`
- Evidence in code: `store/authStore.ts`, `services/otpService.ts`

### 3) Backend Availability (Render)
- [ ] Keep service on a plan that avoids cold-start delays
- [ ] Add uptime monitoring for `/health`
- Endpoint: `GET /health`

### 4) CORS Configuration
- [ ] Set backend env:
  - `FRONTEND_URL`
  - `FRONTEND_URLS` (comma-separated)
- Evidence in code: `backend/main.py`

### 5) Payments/Webhooks
- [ ] Configure payment gateway live keys
- [ ] Ensure webhook endpoint URLs are public and tested
- [ ] Add failure alerting/logging in Render/Sentry/Uptime monitor

### 6) Android / Play Store
- [ ] Run `npm run android:build`
- [ ] Open Android Studio and generate signed release bundle (`.aab`)
- [ ] Verify runtime permission prompts: internet, location, camera, notifications
- [ ] Upload Privacy Policy URL and Support contact in Play Console

### 7) Compliance
- [ ] Data Safety form completed with actual app behavior
- [ ] Account deletion steps documented in listing/support page
- [ ] Terms and Privacy URLs accessible from outside app

## Recommended Final QA Run
- Parent flow: login, forgot password (email + phone), fee payment, receipt
- Admin flow: login, user management, bus/routes, fee operations
- Edge checks: no-network handling, expired OTP, invalid reset links
