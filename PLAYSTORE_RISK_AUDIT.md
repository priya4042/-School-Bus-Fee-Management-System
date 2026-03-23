# Play Store Risk Audit

Date: 2026-03-17

## High Priority
- `.env.production` still contains placeholder production values in this repo snapshot. Replace all placeholder values before generating a release build.
- `JAVA_HOME` is not configured on the current machine, so Android release bundling cannot complete until Java 17 is installed and exported.
- Release signing is not configured until `android/keystore.properties` and the upload keystore are provided locally.

## Medium Priority
- The Android launcher icon was previously the Capacitor template. It has been replaced with a branded vector asset, but you should still review it on real devices before submission.
- Camera and location permissions are declared and match app behavior. Manual Play Console declarations must still describe those uses precisely.
- This app requires authenticated access. App Access in Play Console must include working test credentials.

## Low Priority
- The web app still contains console logging in several API and operational paths. This does not block Play submission, but release logging should be reviewed before production scale.
- The web favicon previously used an emoji-only icon. It has been replaced with a simple branded SVG favicon.

## Verified Improvements
- Removed unnecessary `microphone` permission request from `metadata.json`.
- Added automated release precheck via `npm run release:check`.
- Added configurable Android versioning through `android/gradle.properties`.
- Added Android release scripts that fail early on missing release prerequisites.

## Manual Final Checks
- Test payments on a physical Android device.
- Test location permission prompts on Android 13+.
- Test camera permission prompt and denial flow.
- Confirm Privacy Policy and support contact are live before Play upload.