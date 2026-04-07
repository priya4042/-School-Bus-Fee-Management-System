# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start Vite dev server (port 3000)
npm run build        # Vite production build (output: dist/)
npm run preview      # Preview production build
npm run lint         # TypeScript type checking (tsc --noEmit)

# Mobile (Capacitor/Android)
npm run cap:sync     # Sync web assets to native
npm run cap:open     # Open Android Studio
npm run android:build  # Full Android build pipeline (build + sync + open)
```

No test framework is configured. TypeScript strict mode is off (`strict: false`, `noImplicitAny: false`, `strictNullChecks: false`).

## Architecture

### Tech Stack
- **Frontend:** React 19 + TypeScript + Vite 6, Tailwind CSS 3, Zustand 5, React Router 7
- **Backend:** Node.js on Render.com (`VITE_API_BASE_URL`)
- **Database/Auth:** Supabase (PostgreSQL + Supabase Auth)
- **Payments:** Razorpay (primary), Stripe
- **SMS/OTP:** Twilio
- **Maps:** Google Maps + Leaflet
- **Mobile:** Capacitor 8 (Android)
- **Deployment:** Vercel (frontend) + Render (backend)

### Project Layout
Source files live at the repo root (no `src/` directory for components/pages). Path alias `@/*` maps to `./*`.

- `App.tsx` — root component, auth guard, tab-based navigation
- `types.ts` — all shared interfaces and enums
- `config/env.ts` — central `ENV` object for all environment variables
- `lib/api.ts` — API client (Axios + fetch), auto-attaches Supabase JWT
- `lib/supabase.ts` — Supabase client + audit logging helpers
- `store/` — Zustand stores (`authStore`, `loadingStore`)
- `hooks/` — data-fetching hooks (`useStudents`, `useFees`, `usePayments`, `useTracking`, etc.)
- `components/` — UI components organized by domain (`Admin/`, `Fees/`, `Payment/`)
- `pages/` — top-level pages; `pages/parent/` for parent-specific sub-pages
- `services/` — business logic services
- `api/` — Vercel serverless functions (OTP endpoints)
- `supabase/functions/` — Supabase Edge Functions

### Navigation Pattern
**Tab-based, not route-based.** App.tsx manages an `activeTab` state string and renders pages via a switch statement — not React Router `<Routes>`. BrowserRouter is present but only used for specific URL paths (`/privacy`, `/terms`, `/forgot-password`, etc.). To add a new page: add a tab string to `getAllowedTabs()`, add the component import, and add a case to the render switch.

### Auth & Roles
- Three DB roles: `SUPER_ADMIN`, `ADMIN`, `PARENT` (enum `UserRole` in types.ts also has `DRIVER` but it's unused in DB)
- `authStore.init()` checks Supabase session on startup; `loginWithCredentials()` calls backend `/api/auth/login` then sets Supabase session
- Unauthenticated users see Login/Register/ForgotPassword; authenticated users see Sidebar + Topbar + role-filtered tabs

### API Layer
- `axiosInstance` (Axios with interceptors) for most calls; `apiPost()` (fetch-based) for specific cases
- Request interceptor auto-attaches Supabase JWT from `authStore`
- Dev server proxies `/api/*` to the backend to avoid CORS issues
- Response interceptor normalizes nulls to `{}`

### Database Schema

**Profiles & Auth**
- `profiles` — roles, `preferences` JSONB (`{sms, push, email}`), `fleet_security_token`, `password` (custom auth alongside Supabase Auth)

**Core Domain**
- `routes` — bus routes with `base_fee`, `distance_km`, auto-generated `code` (`R-xxxxxx`)
- `boarding_points` — stops per route with `sequence_order`, lat/lng
- `buses` — status: `idle` | `active` | `maintenance`; linked to `routes`
- `bus_locations` — one row per bus (unique `bus_id`), real-time lat/lng/speed
- `students` — status: `active` | `inactive`; linked to `parent_id`, `bus_id`, `route_id`, `boarding_point`

**Billing & Payments (two separate tables)**
- `monthly_dues` — fee billing; status: `PENDING` | `PAID` | `OVERDUE` | `PARTIAL`; has `fine_per_day`, `fine_after_days`
- `payments` — Razorpay/gateway transactions; status: `pending` | `captured` | `overdue` | `failed`; linked to `student_id` + `parent_id`
- `receipts` — payment proof linked to `payments`, unique `transaction_id`
- `waiver_requests` — linked to `payments` (not `monthly_dues`); status: `pending` | `approved` | `rejected`

**Operations**
- `attendance` — per student per date; type: `PICKUP` | `DROP`
- `notifications` — per user; type: `INFO` | `SUCCESS` | `WARNING` | `DANGER`
- `otp_logs` — OTP codes with `expires_at`, `is_verified`
- `audit_logs` — stores `old_data`/`new_data` JSONB for admin actions

### Styling
Tailwind CSS with custom theme in `tailwind.config.js`: primary (`#1e40af`), secondary (`#64748b`), success/warning/danger colors. Font: Plus Jakarta Sans. Custom shadows: `premium`, `glass`.

### Environment Variables
Copy `.env.example`. Key ones:
- `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL` — backend (default: `https://busway-backend-9maw.onrender.com`)
- `VITE_RAZORPAY_KEY_ID` / `VITE_RAZORPAY_KEY_SECRET`
- `VITE_GOOGLE_MAPS_API_KEY`
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE_NUMBER` (server-side only)

Dev demo credentials: `admin@school.com / admin123`
