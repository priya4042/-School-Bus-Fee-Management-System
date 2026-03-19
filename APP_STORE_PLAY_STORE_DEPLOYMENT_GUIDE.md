# App Store + Play Store Deployment Guide (BusWay Pro)

This project now includes a reusable brand asset pipeline for both stores.

## 1) Generate all logo and icon assets

Run from project root:

```bash
npm install
npm run assets:generate
```

Generated folders/files:

- `public/`:
  - `favicon.svg`
  - `favicon-16x16.png`
  - `favicon-32x32.png`
  - `apple-touch-icon.png`
  - `logo192.png`
  - `logo512.png`
  - `brand-logo.svg`
- `resources/` (Capacitor source assets):
  - `icon.png` (1024x1024)
  - `icon-foreground.png` (1024x1024)
  - `splash.png` (2732x2732)
- `store-assets/` (store listing creatives):
  - `playstore-icon-512.png`
  - `appstore-icon-1024.png`
  - `playstore-feature-graphic-1024x500.png`
  - `brand-logo-1800x560.png`

## 2) Generate native launcher/splash assets

For Android:

```bash
npm run assets:capacitor:android
```

For iOS (run on macOS with Xcode and iOS platform added):

```bash
npm run assets:capacitor:ios
```

## 3) Android (Google Play) release flow

1. Build web app and sync Capacitor:

```bash
npm run build
npx cap sync android
```

2. Build signed bundle:

```bash
npm run android:bundle
```

3. Upload to Play Console:
- App bundle: `android/app/build/outputs/bundle/release/app-release.aab`
- App icon: `store-assets/playstore-icon-512.png`
- Feature graphic: `store-assets/playstore-feature-graphic-1024x500.png`

## 4) iOS (Apple App Store) release flow

1. Add iOS platform (macOS only):

```bash
npx cap add ios
npm run build
npx cap sync ios
```

2. Open in Xcode and archive:

```bash
npx cap open ios
```

3. In App Store Connect listing, use:
- App icon: `store-assets/appstore-icon-1024.png`
- Brand logo (marketing): `store-assets/brand-logo-1800x560.png`

## 5) Required store metadata you should prepare

- Privacy Policy URL
- Terms of Service URL
- Support email and support URL
- Age rating details
- Data safety/privacy disclosures
- Demo/test account for review (if login is required)
- Screenshots:
  - Android phones (minimum 2)
  - iPhone screenshots (minimum 3)
  - iPad screenshots if iPad is supported

## 6) Versioning and release discipline

Before every Play Store update:
- Increase `BUSWAY_VERSION_CODE` in `android/gradle.properties`
- Update `BUSWAY_VERSION_NAME`

Before every iOS update:
- Increase Build Number and Version in Xcode target settings

## 7) Branding source files (edit these only)

If you want to change icon/logo design, edit:

- `resources/branding/app-icon.svg`
- `resources/branding/app-mark.svg`
- `resources/branding/app-logo.svg`

Then rerun:

```bash
npm run assets:generate
```

This keeps web, Android, and iOS assets consistent for every release.
