# Production Release Inputs

Use this file as the exact fill-in checklist before building the Play Store bundle.

## 1. `.env.production`

File: `.env.production`

Current status:
- `VITE_SUPABASE_URL` already points to a real Supabase project URL.
- `VITE_API_BASE_URL` already points to a real backend URL.
- Several required values are still placeholders and must be replaced.

Use this checklist line by line:

### Keep or verify
- `VITE_SUPABASE_URL=https://pjovjynubnrvhwpnfnlw.supabase.co`
  - Keep this only if this is your real production Supabase project.
- `VITE_API_BASE_URL=https://busway-backend-9maw.onrender.com`
  - Keep this only if this is your real production backend and it is stable.
- `VITE_OTP_PROVIDER=TWILIO`
  - Keep this if Twilio is your production OTP provider.

### Replace required placeholders
- `VITE_SUPABASE_ANON_KEY=`
  - Put the real public anon key from Supabase Project Settings.
- `VITE_APP_URL=`
  - Put the real public frontend URL.
  - Example: `https://school-bus-fee-management-system.vercel.app`
- `VITE_AUTH_REDIRECT_URL=`
  - Usually: `<frontend-url>/forgot-password`
  - Example: `https://school-bus-fee-management-system.vercel.app/forgot-password`
- `VITE_RAZORPAY_KEY_ID=`
  - Put the live Razorpay publishable key.
- `VITE_GOOGLE_MAPS_API_KEY=`
  - Put the real Google Maps browser key with production domain restrictions.

### Fill if used in production
- `VITE_PAYMENT_API_BASE_URL=`
  - If payment endpoints are served from the same frontend domain, set this to the frontend origin.
  - If not needed, leave blank only if the runtime origin is guaranteed to serve the payment endpoints.
- `VITE_TWILIO_ACCOUNT_SID=`
- `VITE_TWILIO_AUTH_TOKEN=`
- `VITE_TWILIO_PHONE_NUMBER=`
- `VITE_CAMERA_STREAM_BASE_URL=`
  - Fill this only if production bus camera streaming is enabled.

### Recommended final `.env.production` shape
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://pjovjynubnrvhwpnfnlw.supabase.co
VITE_SUPABASE_ANON_KEY=<REAL_SUPABASE_ANON_KEY>
VITE_APP_URL=<REAL_FRONTEND_URL>
VITE_AUTH_REDIRECT_URL=<REAL_FRONTEND_URL>/forgot-password

# API Configuration
VITE_API_BASE_URL=https://busway-backend-9maw.onrender.com
VITE_PAYMENT_API_BASE_URL=<REAL_PAYMENT_ORIGIN_OR_BLANK>

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=<REAL_RAZORPAY_LIVE_KEY>

# SMS Gateway (Twilio)
VITE_OTP_PROVIDER=TWILIO
VITE_TWILIO_ACCOUNT_SID=<REAL_TWILIO_SID>
VITE_TWILIO_AUTH_TOKEN=<REAL_TWILIO_TOKEN>
VITE_TWILIO_PHONE_NUMBER=<REAL_TWILIO_PHONE>

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=<REAL_GOOGLE_MAPS_KEY>

# Camera Configuration
VITE_CAMERA_STREAM_BASE_URL=<REAL_CAMERA_STREAM_URL_OR_BLANK>
```

## 2. Local Android Signing File

File to create locally:
- `android/keystore.properties`

Source template:
- `android/keystore.properties.example`

Required contents:
```properties
storeFile=../buswaypro-upload-key.jks
storePassword=<YOUR_STORE_PASSWORD>
keyAlias=buswaypro
keyPassword=<YOUR_KEY_PASSWORD>
```

Rules:
- Do not commit `android/keystore.properties`.
- Do not commit the `.jks` file.
- Keep the keystore password and alias safe outside the repo.

## 3. Upload Keystore File

Local file required:
- `buswaypro-upload-key.jks`

Create it with:
```powershell
keytool -genkey -v -keystore buswaypro-upload-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias buswaypro
```

Store it:
- Outside source control
- In the location referenced by `storeFile` in `android/keystore.properties`

## 4. Java 17 on Windows

Current blocker on this machine:
- `JAVA_HOME` is not set
- No `java` executable was found in common locations

You need Java 17 installed before `npm run android:bundle` can succeed.

After installing Java 17, set it for the current PowerShell session:
```powershell
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-17'
$env:Path = "$env:JAVA_HOME\\bin;$env:Path"
java -version
```

To set it permanently in Windows:
- Add system environment variable `JAVA_HOME`
- Point it to your JDK 17 folder
- Add `%JAVA_HOME%\bin` to `Path`

## 5. Android Versioning

File:
- `android/gradle.properties`

Update before each Play Store release:
```properties
BUSWAY_VERSION_CODE=1
BUSWAY_VERSION_NAME=1.0.0
```

Rules:
- Increase `BUSWAY_VERSION_CODE` every release
- Update `BUSWAY_VERSION_NAME` to the user-facing app version

Example next release:
```properties
BUSWAY_VERSION_CODE=2
BUSWAY_VERSION_NAME=1.0.1
```

## 6. Play Console Inputs You Must Prepare

These are not in the repo and must be prepared manually.

### App Access
- Parent test email or phone login
- Parent test password or OTP test flow instructions
- Optional admin test account if Play review needs it

### Store Listing
- App title
- Short description
- Full description
- Support email
- Privacy Policy URL

### Graphics
- App icon
- Feature graphic
- Phone screenshots
- Optional tablet screenshots if you support tablets

### Policy Forms
- Data Safety answers
- Content Rating answers
- Camera permission explanation
- Location permission explanation

## 7. Recommended Release Order

Run these in order from the project root:
```powershell
npm ci
npm run release:check
npm run lint
npm run build
npx cap sync android
npm run android:bundle
```

Expected result:
- `android/app/build/outputs/bundle/release/app-release.aab`

## 8. Fastest Path To Green

If you want the shortest route to a valid bundle, complete these first:
1. Replace placeholder values in `.env.production`
2. Install Java 17 and set `JAVA_HOME`
3. Create `buswaypro-upload-key.jks`
4. Create `android/keystore.properties`
5. Run `npm run android:bundle`