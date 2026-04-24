# BusWay Pro Release Readiness (Vercel + Render + Supabase)

Date: 2026-04-24 (Updated)

## Status Summary
- ✅ App compiles and builds (`npm run lint`, `npm run build`)
- ✅ API base URL supports Render (`VITE_API_BASE_URL`)
- ✅ Password reset redirect is now configurable (`VITE_AUTH_REDIRECT_URL`)
- ✅ Account deletion path exists in Profile
- ✅ Privacy and Terms pages exist
- ✅ Vercel serverless functions optimized (6/12 quota)
- ✅ Payment Settings admin panel created
- ✅ UPI payment flow implemented
- ⚠️ Vercel/Render/Supabase/Play Console settings must be configured manually

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

### 8) Vercel Serverless Functions Quota
- [x] **OPTIMIZED TO 6 FUNCTIONS (Under 12 limit!)**
  - ✅ api/v1/auth/login.ts - User authentication
  - ✅ api/v1/auth/refresh.ts - JWT token refresh
  - ✅ api/v1/otp/send.ts - OTP generation
  - ✅ api/v1/otp/verify.ts - OTP validation
  - ✅ api/v1/otp/reset-password.ts - Password reset
  - ✅ api/v1/payments/webhook.ts - Payment webhooks
- [x] All complex payment operations moved to Render backend
- [x] No duplicate functions
- [x] All frontend calls use VITE_API_BASE_URL (Render)
- Evidence: `PROJECT_REVIEW_API_AUDIT.md`, git commit `1aaf888`

### 9) Payment Settings Configuration
- [ ] Create `payment_settings` table in Supabase
  - Running SQL: See `PAYMENT_SETTINGS_SETUP.md`
- [ ] Enable Row-Level Security (RLS) on payment_settings table
- [ ] Admin can access "Payment Settings" tab
- [ ] Admin can save UPI ID and Business Name
- [ ] Settings persist in database
- [ ] Payment flow reads settings from database
- [ ] Fallback to environment variables if database is empty
- Evidence: `PaymentSettings.tsx`, `ADMIN_PAYMENT_SETTINGS_GUIDE.md`

### 10) UPI Payment Flow
- [ ] QR code generation working
- [ ] UTR (Transaction ID) validation working
- [ ] Screenshot upload to Supabase working
- [ ] Duplicate UTR detection working
- [ ] Parent can complete payment via UPI
- [ ] Admin approval workflow functional
- [ ] Receipts generated correctly
- Evidence: `components/Payment/UpiPaymentFlow.tsx`, `hooks/usePayments.ts`

## Recommended Final QA Run
- Parent flow: login, forgot password (email + phone), fee payment, receipt
- Admin flow: login, user management, bus/routes, fee operations, Payment Settings configuration
- Payment Settings: login as admin → click Payment Settings → save UPI ID → verify in Supabase
- UPI Payment: login as parent → click Pay Now → verify QR code shows admin's UPI ID
- Edge checks: no-network handling, expired OTP, invalid reset links, UPI not configured error
