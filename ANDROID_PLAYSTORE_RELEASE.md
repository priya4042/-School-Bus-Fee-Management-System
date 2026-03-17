# Android Play Store Release Guide

**App:** BusWay Pro | **Package:** `com.buswaypro.app`

---

## IMPORTANT: Files NOT in Git (keep these safe!)

These 3 files exist only on the machine that originally built the app.
Copy them to a USB drive or secure cloud storage immediately:

| File | Location |
|---|---|
| `buswaypro-upload-key.jks` | `android/buswaypro-upload-key.jks` |
| `keystore.properties` | `android/keystore.properties` |

**If you lose the keystore you can NEVER publish updates to the same app on Play Store.**

---

## SCENARIO A — Upload the AAB that is already built (do this RIGHT NOW)

The signed AAB is already built on this machine. No terminal needed.

**File to upload:**
```
android/app/build/outputs/bundle/release/app-release.aab
```

**Steps:**
1. Go to https://play.google.com/console
2. Create new app → Select "Android" → "Free" or "Paid" → Agree policies
3. Left sidebar → **Release** → **Testing** → **Internal testing** → **Create new release**
4. Upload `app-release.aab`
5. Fill release notes → **Save** → **Review release** → **Start rollout**
6. Once testing is complete → **Production** → same steps

---

## SCENARIO B — Rebuild on your home laptop (fresh setup)

### Step 1 — Prerequisites (one-time install, copy-paste each line)

Install Node.js 18+ from https://nodejs.org if not already installed, then:

```powershell
# Install Java 21 (required by Gradle)
winget install Microsoft.OpenJDK.21

# Install Android command-line tools
# 1. Download from: https://developer.android.com/studio#command-tools
# 2. Extract to C:\Android\cmdline-tools\latest\
# 3. Then run:
$env:ANDROID_HOME = "C:\Android\Sdk"
C:\Android\cmdline-tools\latest\bin\sdkmanager.bat "platform-tools" "build-tools;36.0.0" "platforms;android-36"
C:\Android\cmdline-tools\latest\bin\sdkmanager.bat --licenses

# Set environment variables permanently
setx JAVA_HOME "C:\Program Files\Microsoft\jdk-21.0.10.7-hotspot"
setx ANDROID_HOME "C:\Android\Sdk"
setx ANDROID_SDK_ROOT "C:\Android\Sdk"
```

**Close and reopen PowerShell after running setx commands.**

### Step 2 — Copy the 3 missing files to the new machine

Copy these from your USB drive / original machine into the project folder:

```
android/buswaypro-upload-key.jks
android/keystore.properties
```

Also create `android/local.properties` with:
```properties
sdk.dir=C\:\\Android\\Sdk
```

Or run this in PowerShell from the project root:
```powershell
"sdk.dir=C\:\\Android\\Sdk" | Out-File -FilePath android\local.properties -Encoding utf8
```

### Step 3 — Clone and install

```powershell
git clone https://github.com/priya4042/-School-Bus-Fee-Management-System.git
cd "-School-Bus-Fee-Management-System"
npm ci
```

### Step 4 — Build the release AAB

```powershell
npm run android:bundle
```

AAB will be at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

Upload this to Play Console (same as Scenario A, Step 3 onward).

---

## SCENARIO C — Publishing an UPDATE to the app

Yes — you can keep updating the app on Play Store forever, as long as you have the keystore.

### Step 1 — Bump the version

Edit `android/gradle.properties`:
```properties
BUSWAY_VERSION_CODE=2        # Must increase by 1 every release
BUSWAY_VERSION_NAME=1.1.0    # Human-readable version shown to users
```

### Step 2 — Make your code changes, then rebuild

```powershell
npm run android:bundle
```

### Step 3 — Upload new AAB to Play Console

1. Play Console → Your app → **Release** → **Production** → **Create new release**
2. Upload the new `app-release.aab`
3. Write what changed in release notes
4. **Review** → **Start rollout to Production**

Google will review and roll out within a few hours to a few days.

**Rule: `BUSWAY_VERSION_CODE` must be higher than the previous release every single time.**

---

## App details reference

- Application ID: `com.buswaypro.app`
- Version: `android/gradle.properties` → `BUSWAY_VERSION_CODE` / `BUSWAY_VERSION_NAME`
- Signing: `android/keystore.properties` + `android/buswaypro-upload-key.jks`
- Java required: 21 (auto-detected by `scripts/android-release.mjs`)
- Android SDK: `C:\Android\Sdk`

## Play Store listing checklist (first upload only)
- [ ] Upload `app-release.aab`
- [ ] Add Privacy Policy URL
- [ ] Add support email
- [ ] Fill Data Safety form (camera optional, location optional, payments via HTTPS)
- [ ] Fill Content Rating questionnaire
- [ ] Add screenshots (phone + 7-inch tablet)
- [ ] Add feature graphic (1024×500 px)
- [ ] Add short description and full description