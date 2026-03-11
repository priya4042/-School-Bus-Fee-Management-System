# RELEASE_PRECHECK.md

Use this checklist before every Play Store release.

## 1) Build + quality gate
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] `npx cap sync android` completed
- [ ] Release `AAB` generated from Android Studio
- [ ] App tested on at least 2 real Android devices (small + large screen)

---

## 2) Play Console — App Content (copy-ready)

### A) App Access
If login is required, provide demo credentials.

**Copy template:**
> This app requires login to access core features.  
> Test account email: `<ADD_TEST_EMAIL>`  
> Test account password: `<ADD_TEST_PASSWORD>`  
> User role: `Parent` (and optionally `Admin`)  
> OTP/testing note: `<ADD_IF_REQUIRED>`

### B) Ads
- [ ] Select **No, my app does not contain ads** (if true).

### C) Content rating
- [ ] Complete questionnaire with actual app behavior.
- [ ] Confirm no prohibited content categories are accidentally selected.

---

## 3) Data Safety form — app-specific declarations

Use this section to prepare your Data Safety answers.

## Data collected (likely)
- Account info: email, phone number, full name
- Student-linked data: admission number, profile details
- Approx/precise location (bus tracking)
- Payment-related metadata (transaction IDs, payment status)
- App activity/logs (notifications, attendance usage context)
- Optional profile image

## Data shared
- [ ] Confirm whether any data is shared with third parties beyond processors (payments, messaging, maps).
- [ ] If only processors are used on your behalf, declare appropriately as per Play policy wording.

## Purpose mapping (copy-ready)
- **Camera**: Used for in-app profile image capture/upload and/or monitored bus camera viewing experience.
- **Location**: Used to display live bus tracking and route monitoring for authorized users.
- **Payments**: Used to process and verify school bus fee payments and generate receipts.
- **Notifications**: Used to send fee reminders, route updates, and safety/operations alerts.

## Security handling (copy-ready)
> Data is transmitted over encrypted HTTPS connections. Access is restricted by authenticated user role and backend authorization rules.

---

## 4) Permissions declaration text (copy-ready)

Use/adapt these in Play Console policy forms and store listing.

### Camera permission
> The app uses camera access only for user-initiated actions such as profile image capture and authorized live camera-related safety features. Camera is not used in the background.

### Location permission
> The app uses location data to provide live school bus tracking and route visibility to authorized users (e.g., parents/admins). Location is used only for transport operations and safety context.

### Network/payment usage
> The app connects to secure backend/payment services to process bus-fee transactions, fetch due status, and generate payment receipts.

---

## 5) Store listing policy alignment
- [ ] Privacy Policy URL is live and publicly accessible
- [ ] Privacy Policy includes camera/location/payment usage clearly
- [ ] Support email and contact details are valid
- [ ] Screenshots reflect latest UI (Parent + Admin)
- [ ] No misleading claims in description

---

## 6) Functional release smoke tests

## Parent module
- [ ] Login with admission/email works
- [ ] OTP flow works (send/verify/register)
- [ ] Dashboard loads fees + map
- [ ] Boarding points add/delete works
- [ ] Profile image upload via camera/gallery works
- [ ] Payment flow + receipt generation works

## Admin module
- [ ] Admin login works
- [ ] Dashboard stats load
- [ ] Live monitor/map loads
- [ ] Student/admin management CRUD works
- [ ] Notifications/permissions flows work

---

## 7) Security precheck
- [ ] No secrets committed in client code (`.env.local`, API secrets, tokens)
- [ ] Production Supabase policies reviewed
- [ ] HTTPS-only endpoints in production
- [ ] Debug logs reduced for release builds

---

## 8) Release rollout plan
- [ ] Internal testing release first
- [ ] Verify crash-free + auth + payment on internal track
- [ ] Promote to closed testing
- [ ] Promote to production after sign-off

---

## 9) Fill these before submission
- App version name: `<x.y.z>`
- Version code: `<int>`
- Release date: `<YYYY-MM-DD>`
- Testers validated by: `<name>`
- Final approval by: `<name>`
