# Automatic QR Payment Requirements (Client Brief)

## Objective
Enable fully automatic parent fee payments via QR/UPI with no manual verification by admin.

## Current Reality
- Razorpay checkout flow in this app is automated (order + verify + webhook).
- Static admin QR (plain image scan) is not fully automated by default.
- If parent scans a static QR in any UPI app, your app may not receive guaranteed callback/payment status.

## What Client Must Provide
1. Razorpay business account with production access.
2. Payment Gateway enabled with UPI support.
3. Smart Collect / Dynamic QR capability enabled in Razorpay account.
4. Live credentials:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
5. Webhook management access in Razorpay dashboard.
6. Business policy approvals for automated receipt generation and notifications.
7. (Optional for emails) verified sender stack:
   - `PAYMENT_EMAIL_ENABLED=true`
   - `RESEND_API_KEY`
   - `PAYMENT_EMAIL_FROM` (verified domain sender)

## How To Enable This In Razorpay

### A) Razorpay Production Access (Live Mode)
1. Create/login account at Razorpay Dashboard.
2. Complete KYC and business activation.
3. Submit required business details/documents:
  - legal business name
  - PAN/GST (as applicable)
  - bank account for settlements
  - website/app details and business category
4. Wait for account activation approval from Razorpay.
5. In Dashboard, switch from `Test` to `Live` mode and generate live API keys.
6. Share live keys securely for deployment:
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`

### B) Enable UPI On Payment Gateway
1. In Razorpay Dashboard, open `Settings` -> `Payment Methods` (or equivalent payment configuration area).
2. Enable `UPI` under accepted methods.
3. If not visible/enabled, raise a support ticket with Razorpay to enable UPI for your account type.
4. Confirm UPI appears in checkout in `Live` mode.

### C) Enable Dynamic QR / Smart Collect (For Automatic QR)
1. Request/enable `Smart Collect` or Dynamic QR feature in Razorpay account.
2. Configure webhook and callback processing in your app (this repo already has payment webhook endpoint).
3. Validate with a live small-value transaction.

### D) Verify It Is Really Active
Use this checklist before going live:
1. Live mode keys are set in Vercel (not test keys).
2. Webhook URL is configured and delivering events:
  - `https://school-bus-fee-management-system.vercel.app/api/v1/payments/webhook`
3. Webhook events enabled:
  - `payment.captured`
  - `order.paid`
4. One real transaction succeeds and appears in Razorpay Dashboard and app ledger/receipt.

## If Client Does Not Want Razorpay
Alternative providers can be used, but automation still requires all 3:
1. programmatic payment order/collect creation
2. signed webhook/callback support
3. transaction reference mapping back to due/student in app backend

## Required Technical Approach For Automation
Use gateway-linked dynamic payment creation, not static image-only QR.

### Recommended Flow
1. Parent clicks `Pay` in app.
2. Backend creates Razorpay order or dynamic QR/collect request for that exact due.
3. Parent pays using UPI app / QR.
4. Razorpay sends webhook event to app backend.
5. Backend verifies webhook signature.
6. Backend marks due as paid and writes payment artifacts.
7. Parent/Admin notifications and receipt are auto-generated.

## Required Webhook Setup
- Webhook URL:
  - `https://school-bus-fee-management-system.vercel.app/api/v1/payments/webhook`
- Secret:
  - generate a strong random secret in Razorpay
  - store same value as `RAZORPAY_WEBHOOK_SECRET` in Vercel
- Active events:
  - `payment.captured`
  - `order.paid`

## Required Environment Variables (Vercel Production)
Core payment automation:
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Frontend payment display:
- `VITE_RAZORPAY_KEY_ID`
- `VITE_PAYMENT_API_BASE_URL` (optional if same-origin deployment is used)

Optional payment emails:
- `PAYMENT_EMAIL_ENABLED`
- `RESEND_API_KEY`
- `PAYMENT_EMAIL_FROM`

## Data/Status Effects Expected On Success
After successful auto capture + verify/webhook:
1. `monthly_dues.status` becomes `PAID`.
2. Receipt row exists/updates for due.
3. Parent notification inserted (`PAYMENT_SUCCESS`).
4. Admin notification inserted (`PAYMENT_SUCCESS`).
5. Email logs and delivery records (if enabled).

## Why Static Admin QR Is Not Fully Automatic
- Static QR is just a payment destination.
- Payment may occur outside your session/context.
- Without gateway order/collect linkage and callback mapping, system cannot guarantee who paid which due automatically.

## If Client Chooses To Keep Static QR
Use manual verification workflow:
1. Parent submits UTR/reference after payment.
2. Admin verifies bank statement.
3. Admin approves/rejects request.
4. Notifications and receipt generated based on admin decision.

## QR Not Showing (Troubleshooting)
If admin QR section does not appear in parent payment modal:
1. Ensure admin configured QR in app `Settings -> Fee Engine -> Parent Payment QR` and saved.
2. Verify QR URL is a direct public image URL.
3. Hard refresh parent app once after saving.
4. As fallback, set env vars:
   - `VITE_ADMIN_PAYMENT_QR_URL`
   - `VITE_ADMIN_UPI_ID` (optional)
5. Redeploy if using env fallback.

## Client Decision Checklist
Ask client to confirm:
1. Do they want full automation (recommended) or manual QR verification?
2. Is Smart Collect/Dynamic QR enabled in Razorpay account?
3. Can they share live Razorpay keys and webhook access?
4. Do they want automated email confirmations?
5. Who approves exception cases (if any payment mismatch occurs)?

## Final Recommendation
Use Razorpay-linked dynamic payment creation + webhook verification for reliable, auditable, and automatic parent fee settlement.
