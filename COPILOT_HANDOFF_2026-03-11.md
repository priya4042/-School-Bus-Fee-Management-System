# Copilot Handoff — 2026-03-11

This file is a **full continuity log** so work can continue on another machine/session without losing context.

## 0) Current repo state (at handoff time)
- Repo path: `F:\TestProject\copy-of-school-bus-fee-management-system\-School-Bus-Fee-Management-System`
- Branch: `main`
- Recent commits:
  - `fed97e1` Fix parent login/registration to use Supabase directly
  - `f536490` Fix parent login/registration to use Supabase directly
  - `1864cba` Fix parent login/registration to use Supabase directly
  - `9cf15b7` Regenerate lock file for Node 24
  - `2254fc1` chore: update node engine to 24.x for Vercel deployment
- Remote:
  - `origin https://github.com/priya4042/-School-Bus-Fee-Management-System.git`
- Working tree not fully clean:
  - Modified: `capacitor.config.ts`
  - Untracked: `PLAY_STORE_RELEASE_CHECKLIST.md`

---

## 1) High-level work completed today

### A) Parent auth/register/login/OTP flow stabilization
**Goal:** Parent registration and login with admission + OTP should work reliably.

**Key outcomes:**
- Parent registration and login flow moved/hardened around Supabase auth + profiles + students linking.
- OTP UX improved and mismatch errors reduced.
- Admin registration aligned to OTP-based flow where requested.

**Key files touched (auth/OTP area):**
- `store/authStore.ts`
- `services/otpService.ts`
- `services/userService.ts`
- `pages/Register.tsx`
- `pages/ForgotPassword.tsx`
- `vite-env.d.ts`
- `.env.example`

**Notable fixes:**
- Added role normalization and safer profile mapping.
- Better handling of Supabase sign-up error modes (`Database error saving new user`, already-registered cases).
- Parent admission linking logic improved.
- OTP entry field forced numeric + 6-digit behavior and added DEV OTP autofill button.
- Forgot-password “Back to Sign In” corrected to real login route.

---

### B) Parent Boarding Points + map issues fixed
**Reported issue:**
- “Boarding points not working, add new not working, map not loading correctly.”

**Root causes found:**
1. Frontend used missing/incorrect API modules earlier.
2. Schema/table naming mismatch in environments (`boarding_locations` vs `boarding_points`).
3. Leaflet map reliability issues in modal contexts (size/recenter/geolocation fallbacks).

**Implemented fixes:**
- `pages/parent/BoardingLocations.tsx`
  - Migrated to Supabase-driven CRUD.
  - Added compatibility fallback for both table names:
    - tries `boarding_points`
    - falls back to `boarding_locations`
  - Delete behavior adapted:
    - `boarding_points`: hard delete
    - `boarding_locations`: soft delete (`is_active = false`)
  - Better toast/error handling and coordinate safety rendering.
- `components/Location/BoardingLocationPicker.tsx`
  - Imported Leaflet CSS directly.
  - Added map updater to force recenter + invalidate size in modal.
  - Added geolocation error handling and fallback messaging.

---

### C) Parent Settings profile image camera/upload fixed
**Reported issue:**
- Camera icon in Preferences/Profile didn’t do anything.

**Root cause:**
- UI button had no functional file input/upload wiring.

**Implemented fixes in `pages/parent/Settings.tsx`:**
- Added hidden file input (`accept="image/*"`, `capture="user"`) and button click hookup.
- Added image validation (type + size <= 5MB).
- Added upload flow:
  - tries Supabase Storage bucket `avatars`
  - if storage fails, falls back to Base64 Data URL
- Added persistence logic:
  - first tries `profiles.avatar_url`
  - if column missing, stores in `profiles.preferences.avatar_url`
- Avatar preview now reads from either:
  - `user.avatar_url`
  - `user.preferences.avatar_url`
- Preference save now preserves extra keys in preferences object.

**Related update:**
- `store/authStore.ts`
  - Added normalized profile mapping so avatar can be sourced from `avatar_url` or `preferences.avatar_url` on init/login.

**Error resolved:**
- `Could not find the 'avatar_url' column of 'profiles' in the schema cache`
  - handled with runtime fallback to `preferences.avatar_url`.

---

### D) Text terminology standardization
**User request:** replace “school administrator/admin” phrasing.

**Completed:**
- Updated source wording to “Bus Administrator” / “Bus Administration” across multiple files:
  - `store/authStore.ts`
  - `services/userService.ts`
  - `pages/ParentDashboard.tsx`
  - `pages/Privacy.tsx`
  - `pages/parent/BusCamera.tsx`
  - `pages/parent/FeeHistory.tsx`
  - `pages/parent/Support.tsx`
  - `hooks/useReceipts.ts`
- Also updated duplicate top-level `pages/` files where present.

---

### E) Import-path error fix in duplicate top-level pages
**Reported error in top-level file `pages/AdminDashboard.tsx`:**
- Cannot find modules for `../lib/*`, `../hooks/*`

**Root cause:**
- There are duplicate folders in outer workspace; top-level `pages` does not have sibling `lib/hooks`.

**Fix applied:**
- Repointed imports in outer `pages/AdminDashboard.tsx` to actual app folder paths under `-School-Bus-Fee-Management-System`.

---

### F) Git/repo setup corrections

**What happened:**
- Outer folder was accidentally initialized as a git repo, causing nested-repo/submodule warnings.
- Correct repo is inner folder `-School-Bus-Fee-Management-System`.

**Actions taken:**
- Added root `.gitignore` in outer workspace for `node_modules/` (to reduce noise there).
- Added `.gitattributes` in inner repo to normalize line endings and reduce LF/CRLF warnings.
- Clarified push flow to use inner repo where origin is configured.

---

### G) Play Store readiness support

**Delivered:**
- Added `PLAY_STORE_RELEASE_CHECKLIST.md` with end-to-end publishing steps:
  - Capacitor add/sync/open Android
  - signing keystore generation
  - AAB release flow
  - Play Console data safety/privacy/access checklist
- Hardened `capacitor.config.ts`:
  - `android.allowMixedContent` changed from `true` to `false`

---

## 2) Validation run results
- Multiple rounds of:
  - `npm run lint` → PASS
  - `npm run build` → PASS

No active TypeScript errors were left after the final patches in the inner project.

---

## 3) Important architecture/continuity notes

1. **Two similar directory trees exist in the outer workspace**
   - Inner active app: `-School-Bus-Fee-Management-System` (main target)
   - Duplicate outer `pages/components` also exist and can create confusion.

2. **Auth reality**
   - Real credentials come from Supabase `auth.users`.
   - `public.profiles` stores metadata and must stay linked by same UUID.

3. **Boarding table variance**
   - Some environments use `boarding_points`, others `boarding_locations`.
   - Current code handles both.

4. **Avatar schema variance**
   - `profiles.avatar_url` may not exist in some DBs.
   - Current code safely falls back to `profiles.preferences.avatar_url`.

---

## 4) Known unresolved / next recommended tasks

### Priority 1
- **Clean outer accidental git repo** if still needed:
  - keep only inner repo for project history.

### Priority 2
- **Create Android native project and test**:
  - run `npx cap add android` (if missing)
  - run `npx cap sync android`
  - test on physical Android device

### Priority 3
- **Mobile responsiveness polish**
- Parent/Admin modules are mostly responsive but still have fixed-height map blocks and many tiny text classes (`text-[8px]`, `text-[9px]`, `text-[10px]`) that may reduce readability on small phones.

### Priority 4
- **Optional DB migration**
- Add `avatar_url` column to `profiles` if you want to stop using fallback-only mode.

---

## 5) Quick resume command pack (next laptop)

```bash
# 1) clone/open repo
cd <repo>/-School-Bus-Fee-Management-System

# 2) install and verify
npm ci
npm run lint
npm run build

# 3) if mobile build work
npx cap sync android
npx cap open android
```

---

## 6) Files created for documentation during this cycle
- `PROJECT_COMPLETE_TECH_GUIDE.md`
- `PARENT_FLOW_QA_CHECKLIST.md`
- `PLAY_STORE_RELEASE_CHECKLIST.md`
- `.gitattributes`
- (this file) `COPILOT_HANDOFF_2026-03-11.md`

---

## 7) Handoff summary (one-line)
Core parent/admin functionality, OTP/auth, boarding points, settings avatar upload, terminology cleanup, and release-readiness docs were completed and validated; project is stable for continuation with remaining focus on Android native release setup and final mobile UX polish.

---

## 8) Continuation update — 2026-03-12

> Ongoing workflow note: after every future code change set in this project, append a new dated continuation entry in this file so handoff continuity always stays current.

### A) Git sync and environment correction
- Pulled latest code from the correct inner repo (`origin/main`) successfully.
- Confirmed branch tracking in inner project and avoided using outer accidental repo for pull/push operations.
- Fixed PowerShell navigation issue for folder name starting with `-` by using:
  - `cd ".\-School-Bus-Fee-Management-System"`

### B) Production MIME error fix (module script served as text/html)
**Reported issue:**
- Browser error: *Expected a JavaScript-or-Wasm module script but server responded with MIME type text/html*.

**Root cause:**
- SPA rewrite rule was intercepting JS/CSS asset requests and returning `index.html`.

**Fix applied:**
- Updated `vercel.json` to filesystem-first routing with SPA fallback only after static file checks.

### C) Parent-mode behavior updates (as requested)
**Scope respected:**
- No login/register changes in this cycle.
- No admin flow changes in this cycle.

**Implemented:**
- Parent sees only their children routes via dedicated parent routes page.
  - Added: `pages/parent/Routes.tsx`
- Parent live tracking separated from Family Hub style layout.
  - Added: `pages/parent/LiveTracking.tsx`
- Parent tab routing rewired in `App.tsx`:
  - `Routes` -> parent routes page
  - `Live Tracking` -> parent live tracking page
  - Parent `Payments` and `Receipts` -> unified fee/payment history page
- Sidebar simplified for parent in `components/Sidebar.tsx`:
  - Removed duplicate fee/receipt links in parent menu
  - Hid `Bus Camera` link when camera permission is not granted
- `pages/parent/BoardingLocations.tsx` hardened:
  - Graceful fallback on missing table / 404 / RLS denied cases
  - Reduced noisy hard-fail behavior
- `pages/parent/Notifications.tsx` enhanced:
  - Added handling for payment/bus/fee notification types so parent sees real admin/payment-driven notifications more reliably.

### D) Parent identity display correction
**Reported issue:**
- Parent profile identity badge was showing student identity.

**Fix applied:**
- Updated `pages/Profile.tsx` so parent role shows parent account identity badge instead of student admission identity.

### E) Validation performed
- Build verification:
  - `npm run build` -> PASS
- Localhost smoke checks:
  - Dev server started successfully.
  - Verified rendering of `/`, `/privacy`, `/terms`, `/forgot-password`.
  - Public route rendering is healthy.

### F) Current known follow-up
- Full authenticated end-to-end parent/admin scenario verification still requires interactive login credentials and browser walkthrough.

---

## 9) Continuation update — 2026-03-12 (runtime error fixes)

### A) Supabase 406 fix for bus tracking query
- **Issue observed:** `GET /rest/v1/bus_locations ... 406 (Not Acceptable)` during parent live tracking.
- **Root cause:** `hooks/useTracking.ts` used `.single()` for last-known bus row; when no row exists, PostgREST returns 406 for object expectation.
- **Fix:** switched to `.maybeSingle()` and added safe warning-only handling when no row/error is returned.

### B) Supabase 400 fix for boarding points schema variance
- **Issue observed:** `GET /rest/v1/boarding_points ... 400 (Bad Request)`.
- **Root cause:** strict column projection in `pages/parent/BoardingLocations.tsx` could fail when tenant schema differs (column name variance).
- **Fixes implemented:**
  - Added fallback query path: if preferred projection returns 400, retry with `select('*')`.
  - Added row normalization mapping to support alternate field names (`location_name/name/label`, `latitude/lat`, `longitude/lng`, etc.).
  - Retained existing table fallback logic (`boarding_points` <-> `boarding_locations`).

### C) Razorpay key resolution hardening
- **Issue observed:** `Payment Error: Razorpay key missing`.
- **Fixes implemented in `hooks/usePayments.ts`:**
  - Added resolver that accepts `VITE_RAZORPAY_KEY_ID` and fallback alias `VITE_RAZORPAY_KEY`.
  - Treats placeholder value (`your_razorpay_key_id`) as invalid.
  - Uses resolved key for checkout instead of raw env access.
  - Improved user-facing alert to explicitly request environment variable setup.
- **Typing update:** `vite-env.d.ts` now includes optional `VITE_RAZORPAY_KEY`.

### D) Validation
- Ran `npm run build` after patches -> **PASS**.

---

## 10) Continuation update — 2026-03-12 (safe payment pipeline phase-1)

### A) Objective implemented
- Started secure payment architecture upgrade so payment success is recorded on server (idempotent), not trusted from client only.
- Kept parent/admin UI flow intact while hardening backend verification + webhook handling.

### B) New shared secure payment core
- Added `api/v1/payments/paymentCore.ts` with shared functions:
  - checkout signature verification (`order_id|payment_id` HMAC)
  - webhook signature verification
  - idempotent payment recording (`monthly_dues` update, `receipts` upsert-style behavior)
  - parent + admin notification creation with duplicate protection via transaction token

### C) API endpoint hardening
- `api/v1/payments/verifyPayment.ts`
  - refactored to use shared core
  - supports both `dueId` and `due_id`
  - returns `alreadyProcessed` for idempotent repeat calls
- `api/v1/payments/webhook.ts`
  - verifies webhook signature before processing
  - handles successful payment events (`payment.captured`, `order.paid`)
  - extracts `due_id` from Razorpay notes and records payment through shared core
  - safely accepts/ignores unsupported events
- `api/v1/payments/createOrder.ts`
  - requires server-side Razorpay key config
  - includes `notes.due_id` + `notes.student_id` on order for webhook reconciliation

### D) Frontend alignment
- `hooks/usePayments.ts`
  - switched success flow to trust server verification path
  - removed client-side direct DB persistence from the main success branch
  - still dispatches local payment event for immediate UI refresh

### E) Validation
- `npm run lint` -> **PASS**
- `npm run build` -> **PASS**

### F) Deployment notes for testing
- Required server env vars must be present:
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
  - `RAZORPAY_WEBHOOK_SECRET`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Razorpay webhook should point to:
  - `/api/v1/payments/webhook`

---

## 11) Continuation update — 2026-03-12 (safe payment email phase-2)

### A) What was added
- Added optional email delivery for verified payments (parent + admins) with fail-safe behavior.
- Payment success remains non-blocking: DB/payment state is not rolled back if email provider is unavailable.

### B) New file
- `api/v1/payments/emailService.ts`
  - Supports provider-style API send (Resend endpoint) via server-side `fetch`.
  - Controlled by `PAYMENT_EMAIL_ENABLED` flag.
  - Uses `RESEND_API_KEY` + `PAYMENT_EMAIL_FROM`.
  - Sends distinct subjects for parent and admin mail.

### C) Payment core integration
- `api/v1/payments/paymentCore.ts`
  - Pulls parent/admin emails from `profiles` table.
  - Dispatches email after successful, idempotent payment record.
  - Wraps email dispatch in `try/catch` and logs warning on failure (non-blocking).

### D) Env updates
- `.env.example` now includes:
  - `RAZORPAY_WEBHOOK_SECRET`
  - `PAYMENT_EMAIL_ENABLED`
  - `RESEND_API_KEY`
  - `PAYMENT_EMAIL_FROM`

### E) Validation
- `npm run lint` -> **PASS**
- `npm run build` -> **PASS**

---

## 12) Continuation update — 2026-03-12 (payment email audit logs)

### A) Added audit table migration
- New migration: `supabase/migrations/20260312_payment_email_delivery_logs.sql`
- Creates `public.payment_email_logs` to track recipient-level email outcomes.
- Captures: `due_id`, `transaction_id`, `recipient_email`, `recipient_role`, `provider`, `status`, `error_message`, `metadata`, `created_at`.
- Includes indexes for `due_id`, `transaction_id`, and `created_at`.

### B) Email service response enriched
- `api/v1/payments/emailService.ts`
  - now returns recipient lists and provider metadata along with success flags.
  - supports explicit `disabled` reason when `PAYMENT_EMAIL_ENABLED` is off.

### C) Server-side log writes in payment flow
- `api/v1/payments/paymentCore.ts`
  - writes `payment_email_logs` rows after each email dispatch attempt.
  - records `SENT`, `FAILED`, or `SKIPPED` per recipient role (parent/admin).
  - keeps behavior non-blocking; payment remains successful even if log insert/email fails.

### D) Validation
- `npm run lint` -> **PASS**
- `npm run build` -> **PASS**

---

## 13) Continuation update — 2026-03-12 (gateway branding hidden in parent UI)

### A) Parent payment modal wording
- Updated `components/PaymentPortal.tsx`:
  - `Pay with Razorpay` -> `Pay Securely`
  - `Starting Payment...` -> `Starting Secure Payment...`

### B) Parent support copy
- Updated `pages/parent/Support.tsx` FAQ text to remove explicit Razorpay mention and use generic secure payment wording.

---

## 14) Continuation update — 2026-03-12 (payment API 404 routing fix)

### A) Issue observed
- Parent payment attempts were hitting Render backend payment paths and returning 404:
  - `/api/v1/payments/create-order`
  - `/api/v1/payments/createOrder`
  - `/api/payments/create-order`

### B) Root cause
- Generic API base URL was pointing to external backend (`VITE_API_BASE_URL`) that does not host app-specific Razorpay serverless endpoints.

### C) Fix implemented
- Updated `hooks/usePayments.ts`:
  - Added payment-specific base resolution order:
    1. `VITE_PAYMENT_API_BASE_URL` (if set)
    2. runtime origin (`window.location.origin`)
    3. `VITE_APP_URL`
    4. fallback `VITE_API_BASE_URL`
  - Added direct `fetch` helper with auth token for payment endpoint calls.
  - `createOrder` and `verifyPayment` now try app/serverless endpoints first, then legacy fallback calls.
- Added env typing: `VITE_PAYMENT_API_BASE_URL` in `vite-env.d.ts`.
- Added `.env.example` documentation for `VITE_PAYMENT_API_BASE_URL`.

### D) Validation
- `npm run build` -> **PASS**

### E) Env file alignment
- Updated `.env.local` and `.env.production` to include explicit `VITE_PAYMENT_API_BASE_URL` so payment calls are routed to the app domain hosting `/api/v1/payments/*` endpoints (instead of external generic backend routes that may 404).

---

## 15) Continuation update — 2026-03-12 (module MIME error fix)

### A) Issue observed
- Browser error: module script expected JS/Wasm but got `text/html`.

### B) Root cause
- Vercel SPA fallback route matched all paths and could rewrite missing/static asset requests to `index.html`.

### C) Fix applied
- Updated `vercel.json` fallback route from `"/.*"` to `"/[^.]*"` so only extensionless client routes are rewritten to `index.html`.
- Static files with extensions (like `/assets/*.js`, `/assets/*.css`) are no longer rewritten as HTML.

### D) Additional hardening for stale cache behavior
- Added cache headers in `vercel.json`:
  - `no-store` for `/`, `/index.html`, and `/service-worker.js`
  - long immutable cache for `/assets/*`
- Purpose: reduce stale `index.html` references to old hashed bundles, which can cause intermittent module MIME errors until hard refresh.

---

## 16) Continuation update — 2026-03-12 (payment CORS/preflight placeholder fix)

### A) Issue observed
- Browser calls were going to `https://your-project.vercel.app/...` and failing with CORS/preflight errors.

### B) Fixes applied
- Updated `.env.local`:
  - `VITE_PAYMENT_API_BASE_URL=https://school-bus-fee-management-system.vercel.app`
- Added runtime guard in `hooks/usePayments.ts`:
  - ignores placeholder `your-project.vercel.app` value if accidentally left in env.

### C) Validation
- `npm run build` -> **PASS**

---

## 17) Continuation update — 2026-03-12 (canonical payment endpoint routing)

### A) Problem
- Payment create flow was trying many legacy endpoint variants and multiple base URLs, causing noisy CORS/404 fallback errors.

### B) Fix
- `hooks/usePayments.ts` now uses canonical endpoints only:
  - create: `/api/v1/payments/createOrder`
  - verify: `/api/v1/payments/verifyPayment`
- If `VITE_PAYMENT_API_BASE_URL` is set, only that base is used.
- Legacy fallback calls are now used only if no payment base is configured.

### C) Validation
- `npm run build` -> **PASS**

---

## 18) Continuation update — 2026-03-12 (payment env health endpoint)

### A) Added API health check endpoint
- New file: `api/v1/payments/health.ts`
- Purpose: quickly validate deployment env readiness for payment APIs.

### B) What it returns
- `ok` boolean
- `missingRequired` for:
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- `missingOptional` for webhook/email vars.

### C) Use
- Hit: `/api/v1/payments/health` after deploy to verify env config before payment testing.

---

## 19) Continuation update — 2026-03-12 (Vercel Hobby function limit fix)

### A) Issue
- Vercel Hobby build failed: more than 12 serverless functions detected.

### B) Actions taken
- Moved payment helper modules out of `api/` into `lib/server/payments/`:
  - `emailService.ts`
  - `paymentCore.ts`
- Updated imports in:
  - `api/v1/payments/verifyPayment.ts`
  - `api/v1/payments/webhook.ts`
- Removed dev-only endpoint:
  - `api/dev/otp.ts`

### C) Result
- API route file count under `api/**/*.ts` reduced to **12** (fits Hobby limit).
- `npm run build` -> **PASS**

---

## 20) Continuation update — 2026-03-12 (Razorpay createOrder 500 + placeholder CORS hardening)

### A) Production issue observed
- Browser logs showed mixed failures during payment init:
  - `POST /api/v1/payments/createOrder` -> `500`
  - fallback calls attempted `https://your-project.vercel.app/...` -> CORS/preflight failure.

### B) Root causes
- Placeholder domain values from env templates could still be considered as payment API bases.
- Payment base ordering could prioritize explicit env value before same-origin runtime base.
- Some deployments may set `VITE_RAZORPAY_KEY_SECRET` but not `RAZORPAY_KEY_SECRET`, leading to server-side key lookup failure.

### C) Fixes applied
- `hooks/usePayments.ts`
  - Added placeholder-domain guard for all payment base candidates.
  - Payment base resolution now prioritizes runtime origin first, then explicit/app/api origins.
  - Placeholder domains (`your-project.vercel.app`, `your-app.vercel.app`, `example.com`, `your-domain.com`) are ignored.
- `api/v1/payments/createOrder.ts`
  - Added secret fallback lookup: `RAZORPAY_KEY_SECRET || VITE_RAZORPAY_KEY_SECRET`.
- `.env.production`
  - Cleared `VITE_PAYMENT_API_BASE_URL` placeholder default to avoid accidental cross-origin calls.

### D) Validation
- `npm run build` -> **PASS**

### E) Deployment verification steps
- Check `https://school-bus-fee-management-system.vercel.app/api/v1/payments/health`.
- Ensure `missingRequired` is empty, especially:
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET` (or ensure fallback var exists)
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

---

## 21) Continuation update — 2026-03-12 (payment UI error diagnostics)

### A) Request handled
- Added frontend surface for backend payment failure metadata to speed up live debugging.

### B) Changes
- `hooks/usePayments.ts`
  - `postPaymentApi` now preserves API error metadata on thrown errors:
    - `code`
    - `status`
    - `details`
  - Added `formatPaymentError(err, fallback)` helper.
  - Payment initiation failure alert now shows combined diagnostics:
    - message
    - `Code: ...` (if present)
    - `Status: ...` (if present)

### C) Validation
- `npm run build` -> **PASS**

---

## 22) Continuation update — 2026-03-12 (remove Render fallback for payment + live env finding)

### A) Issue observed
- Payment errors still showed mixed endpoint failures:
  - `500` from app payment endpoint
  - `404 Cannot POST /api/v1/payments/createOrder` from Render fallback.

### B) Code fix
- `hooks/usePayments.ts`
  - Removed generic backend (`VITE_API_BASE_URL` / Render) as payment API base candidate.
  - Removed legacy axios fallback calls (`/v1/payments/createOrder`, `/v1/payments/verifyPayment`).
  - Payment flow now stays on payment-capable origins only (runtime origin / explicit payment base / app URL).

### C) Live verification finding
- Checked: `https://school-bus-fee-management-system.vercel.app/api/v1/payments/health`
- Response:
  - `ok: false`
  - `missingRequired: ["RAZORPAY_KEY_ID", "SUPABASE_URL"]`
- Conclusion: Vercel production env is missing required variables; this is the current root cause for live payment `500`.

### D) Validation
- `npm run build` -> **PASS**

---

## 23) Continuation update — 2026-03-12 (health endpoint effective env resolution)

### A) Why
- Live health output showed missing `RAZORPAY_KEY_ID` and `SUPABASE_URL`, but server runtime already supports fallback env names in some paths.

### B) Changes
- `api/v1/payments/health.ts`
  - Added fallback-aware required checks:
    - `RAZORPAY_KEY_ID` or `VITE_RAZORPAY_KEY_ID`
    - `RAZORPAY_KEY_SECRET` or `VITE_RAZORPAY_KEY_SECRET`
    - `SUPABASE_URL` or `VITE_SUPABASE_URL`
    - `SUPABASE_SERVICE_ROLE_KEY`
  - Added `resolvedRequired` field to show which variable key is actually being used.
- `lib/server/payments/paymentCore.ts`
  - `verifyCheckoutSignature` now also supports `VITE_RAZORPAY_KEY_SECRET` fallback.

### C) Validation
- `npm run build` -> **PASS**

---

## 24) Continuation update — 2026-03-12 (verifyPayment serverless crash fix)

### A) Issue observed
- `GET /api/v1/payments/verifyPayment` showed Vercel `FUNCTION_INVOCATION_FAILED` while other payment routes were reachable.

### B) Root cause fixed
- `lib/server/payments/paymentCore.ts` imported `SupabaseClient` as a runtime value:
  - `import { createClient, SupabaseClient } from '@supabase/supabase-js'`
- In serverless runtime this can fail because `SupabaseClient` is a TypeScript type, not a runtime export.

### C) Fix applied
- Switched to type-only import:
  - `import { createClient } from '@supabase/supabase-js'`
  - `import type { SupabaseClient } from '@supabase/supabase-js'`

### D) Validation
- `npm run build` -> **PASS**
