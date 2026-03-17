# Android Play Store Release Guide

This project now contains a Capacitor Android app under `android/` and can produce a release bundle for Play Store submission.

For the exact values and local files you still need to fill, use `PRODUCTION_RELEASE_INPUTS.md`.

## Current Android package
- Application ID: `com.buswaypro.app`
- App name: `BusWay Pro`
- Version name: from `android/gradle.properties` (`BUSWAY_VERSION_NAME`)
- Version code: from `android/gradle.properties` (`BUSWAY_VERSION_CODE`)

## Release prerequisites
- Android Studio installed
- Android SDK installed and configured via `ANDROID_HOME` or local Android Studio setup
- Java 17 installed
- Production env values filled in `.env.production` or your CI environment
- Upload keystore created and stored safely

## 1. Prepare production web assets
```bash
npm ci
npm run release:check
npm run lint
npm run build
npm run cap:sync:android
```

## 2. Create the upload keystore
```bash
keytool -genkey -v -keystore buswaypro-upload-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias buswaypro
```

## 3. Configure signing
1. Copy `android/keystore.properties.example` to `android/keystore.properties`
2. Fill the real values
3. Place `buswaypro-upload-key.jks` outside source control, or at the path declared in `storeFile`

Recommended local path:
```properties
storeFile=../buswaypro-upload-key.jks
storePassword=your_store_password
keyAlias=buswaypro
keyPassword=your_key_password
```

`android/keystore.properties` must not be committed.

## 4. Build release bundle
From the project root:
```bash
npm run android:bundle
```

Expected output:
- `android/app/build/outputs/bundle/release/app-release.aab`

If you need a release APK for device testing:
```bash
npm run android:apk
```

## 5. Play Console submission checklist
- Upload `app-release.aab`
- Provide Privacy Policy URL
- Provide support email/contact info
- Complete App Access with test credentials
- Complete Data Safety form
- Complete Content Rating questionnaire
- Add screenshots, feature graphic, and final launcher icon

## 6. App-specific declarations
- Camera is optional and used for authorized bus camera and profile/image capture flows
- Location is optional and used for live tracking, driver tracking, and boarding point selection
- Payments are processed over HTTPS and receipts are generated inside the app

## 7. Remaining manual items before production
- Review the new generated vector launcher icon on real devices and replace it with final design assets later if needed
- Verify login, map, payments, camera, and receipts on at least two physical Android devices
- Increment `BUSWAY_VERSION_CODE` and `BUSWAY_VERSION_NAME` in `android/gradle.properties` for each new Play Store release