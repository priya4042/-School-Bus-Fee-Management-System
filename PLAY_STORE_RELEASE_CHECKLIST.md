# Play Store Release Checklist (BusWay Pro)

## 1) One-time prerequisites
- Install Android Studio (latest stable) + SDK + Build Tools.
- Install Java 17 (required by modern Android Gradle).
- Ensure Node.js/npm are installed.
- Confirm package/app id is correct in `capacitor.config.ts` (`com.buswaypro.app`).

## 2) Prepare production web build
```bash
npm ci
npm run build
```

## 3) Add/sync Android project
If `android/` does not exist:
```bash
npx cap add android
```
Always sync after code/config updates:
```bash
npx cap sync android
```

## 4) Open Android project
```bash
npx cap open android
```

## 5) Generate signing keystore (one-time)
Run in terminal (adjust values):
```bash
keytool -genkey -v -keystore buswaypro-upload-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias buswaypro
```
Store this file safely. Never lose it.

## 6) Configure signing in Android Studio
- Open `android` project in Android Studio.
- Go to **Build > Generate Signed Bundle / APK**.
- Choose **Android App Bundle (AAB)**.
- Select keystore (`buswaypro-upload-key.jks`), alias, and passwords.
- Build `release` bundle.

Output should be:
- `app-release.aab`

## 7) Play Console required setup
- Create app listing (title, short description, full description).
- Upload app icon, feature graphic, screenshots (phone required; tablet if supported).
- Add Privacy Policy URL.
- Complete **Data Safety** form.
- Complete **App access** if login is required (test credentials).
- Complete **Content rating** questionnaire.
- Declare permissions usage clearly.

## 8) High-priority policy checks for this app
- Camera usage purpose must be clearly described (live bus safety monitoring).
- Location usage purpose must be declared (bus tracking).
- If SMS/phone permissions are used in native layer, justify and minimize.
- Use HTTPS-only endpoints in production.
- Do not ship debug keys/secrets in client builds.

## 9) Release flow
- Upload `app-release.aab` to **Internal testing** first.
- Test login, payments, map, camera view, and notifications on real Android devices.
- Promote to closed/open/production once stable.

## 10) Recommended pre-release verification
- `npm run lint`
- `npm run build`
- Manual mobile checks (small phone + large phone):
  - Parent dashboard map/cards
  - Admin dashboard map/cards
  - Settings profile image upload
  - Boarding points add/delete
  - Payment flow and receipts

---

## Optional hardening before production
- Keep `allowMixedContent` disabled.
- Avoid shipping `.env.local` with secrets.
- Ensure backend CORS and auth are restricted to production domains.
