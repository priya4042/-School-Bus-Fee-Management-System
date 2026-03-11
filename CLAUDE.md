# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start Vite dev server

# Build & Preview
npm run build        # TypeScript check + Vite production build
npm run preview      # Preview production build

# Linting
npm run lint         # TypeScript type checking (tsc --noEmit)

# Mobile (Capacitor/Android)
npm run cap:sync     # Sync web assets to native
npm run cap:open     # Open Android Studio
npm run android:build  # Full Android build pipeline
```

There are no test scripts configured.

## Architecture

### Tech Stack
- **Frontend:** React 19 + TypeScript + Vite 6, Tailwind CSS, Zustand, React Router 7
- **Backend:** Node.js hosted on Render.com (`VITE_API_BASE_URL`)
- **Database/Auth:** Supabase (PostgreSQL + Supabase Auth)
- **Payments:** Razorpay (primary), Stripe
- **SMS/OTP:** Twilio
- **Maps:** Google Maps + Leaflet
- **Mobile:** Capacitor 8 (Android)
- **Deployment:** Vercel (frontend) + Render (backend)

### Routing & Auth Flow
- [App.tsx](App.tsx) is the root. It reads `authStore` and renders role-based layouts.
- Three roles in DB: `SUPER_ADMIN`, `ADMIN`, `PARENT` — each sees different pages/sidebar items.
- [store/authStore.ts](store/authStore.ts): Zustand store managing `user`, `accessToken`, `loading`, `initialized`. `init()` checks Supabase session on startup; `loginWithCredentials()` calls the backend `/api/auth/login`, then sets a Supabase session.
- Auth guard: unauthenticated users see Login/Register/ForgotPassword; authenticated users see Sidebar + Topbar + page content.

### API Layer
- [lib/api.ts](lib/api.ts): Dual approach — `axiosInstance` (Axios with base URL from `ENV.API_BASE_URL`) for most calls; `apiPost()` (fetch-based) for specific cases. Request interceptor auto-attaches Supabase JWT. Response interceptor normalizes nulls to `{}`.
- [lib/supabase.ts](lib/supabase.ts): Supabase client + audit logging helpers.
- [config/env.ts](config/env.ts): Central `ENV` object with all environment variables; `checkEnvWarnings()` logs missing keys.

### State Management
- Zustand stores in [store/](store/): `authStore` (auth state), `loadingStore` (global loading indicator).
- Most data-fetching lives in custom hooks under [hooks/](hooks/) (e.g., `useStudents`, `useFees`, `usePayments`, `useTracking`).

### Serverless / Edge Functions
- [api/](api/): Vercel serverless functions for OTP endpoints.
- [supabase/functions/api/](supabase/functions/api/): Supabase Edge Functions.
- [vercel.json](vercel.json): SPA rewrite (all routes → `/index.html`), build output `dist`.

### Database Schema

**Profiles & Auth**
- `profiles` — roles: `SUPER_ADMIN`, `ADMIN`, `PARENT` (no DRIVER in DB). Has `preferences` JSONB (`{sms, push, email}`), `fleet_security_token`, `password` (custom auth alongside Supabase Auth).

**Core Domain**
- `routes` — bus routes with `base_fee`, `distance_km`, auto-generated `code` (`R-xxxxxx`)
- `boarding_points` — stops per route with `sequence_order`, lat/lng
- `buses` — status: `idle` | `active` | `maintenance`; linked to `routes`
- `bus_locations` — one row per bus (unique `bus_id`), real-time lat/lng/speed
- `camera_configs` — RTSP stream config per bus
- `students` — status: `active` | `inactive`; linked to `parent_id` (profiles), `bus_id`, `route_id`, `boarding_point`

**Billing & Payments (two separate tables)**
- `monthly_dues` — fee billing records; status: `PENDING` | `PAID` | `OVERDUE` | `PARTIAL`; has `fine_per_day`, `fine_after_days`
- `payments` — Razorpay/gateway transaction records; status: `pending` | `captured` | `overdue` | `failed`; linked to `student_id` + `parent_id`
- `receipts` — payment proof linked to `payments`, unique `transaction_id`
- `waiver_requests` — linked to `payments` (not `monthly_dues`); status: `pending` | `approved` | `rejected`

**Operations**
- `attendance` — per student per date; type: `PICKUP` | `DROP`
- `notifications` — per user; type: `INFO` | `SUCCESS` | `WARNING` | `DANGER`
- `otp_logs` — OTP codes with `expires_at`, `is_verified`
- `audit_logs` — stores `old_data`/`new_data` JSONB for admin actions

### Pages Structure
- [pages/](pages/) — top-level pages for Admin and Parent roles
- [pages/parent/](pages/parent/) — parent-specific sub-pages (FeeHistory, Notifications, Settings, StudentProfile, Support, etc.)
- [components/Admin/](components/Admin/), [components/Fees/](components/Fees/), [components/Payment/](components/Payment/) — role/domain-specific components

### Key Types
[types.ts](types.ts) defines all shared interfaces: `User`, `Student`, `MonthlyDue`, `Receipt`, `Route`, `Bus`, `Notification`, `CameraConfig`, `AIInsight`, `Defaulter`.

### Environment Variables
Copy `.env.example` for required variables. Key ones:
- `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL` — backend (default: `https://busway-backend-9maw.onrender.com`)
- `VITE_RAZORPAY_KEY_ID` / `VITE_RAZORPAY_KEY_SECRET`
- `VITE_GOOGLE_MAPS_API_KEY`
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE_NUMBER` (server-side only)

Dev demo credentials: `admin@school.com / admin123`
