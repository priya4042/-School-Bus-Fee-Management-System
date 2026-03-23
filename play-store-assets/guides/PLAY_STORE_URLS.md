# 🔗 Google Play Store Upload URLs & Locations

**This guide shows EXACTLY where to upload each image in Google Play Console**

---

## 📍 Play Console Navigation Map

```
https://play.google.com/console/
    ↓
[Select Your App: "BusWay Pro: School Bus Fee Manager"]
    ↓
Left Menu Options:
├── 📋 Dashboard (Overview)
├── 📝 Setup (← WE USE THIS)
│   ├── App icon ← IMAGE #1
│   ├── Graphics assets ← IMAGES #2-6
│   ├── App details
│   ├── Screenshots
│   ├── Video preview
│   ├── Content rating
│   ├── Data safety
│   └── Pricing & distribution
├── 📦 Release (Upload AAB)
└── ... Other options
```

---

## 🎯 LOCATION 1: App Icon Upload

### URL (Direct Link)
```
https://play.google.com/console/u/0/developers/account/
```

### Navigation Steps
1. Go to: **https://play.google.com/console/**
2. Log in with your Google account
3. Click your app: **"BusWay Pro: School Bus Fee Manager"**
4. Left menu: Click **"Setup"** (if not expanded, click arrow)
5. Under Setup, find: **"App icon"**
6. Click: **"App icon"**

### Upload Section
You'll see a section labeled:
```
📱 App Icon
(Shows current icon if exists)
[Upload images] button
```

### What to Upload
**File**: `play-store-assets/app-icon/app_icon_512x512.png`  
**Size**: 512 × 512 pixels  
**Format**: PNG (recommended)

### Screenshot of Upload
```
┌─────────────────────────────────────────┐
│ App icon                                 │
├─────────────────────────────────────────┤
│ [Current icon] [Upload images] button   │
│                                         │
│ Requirements:                           │
│ • 512×512 pixels minimum                │
│ • PNG or JPEG format                    │
│ • No transparency                       │
└─────────────────────────────────────────┘
```

### Steps to Upload
1. Click **[Upload images]** button
2. Select file: `app_icon_512x512.png`
3. Click **Open** or confirm
4. Wait for preview
5. Click **Save** (bottom right)

---

## 🎯 LOCATION 2: Feature Graphic Upload

### URL (Direct Link)
```
https://play.google.com/console/u/0/developers/account/
```

### Navigation Steps
1. Go to: **https://play.google.com/console/**
2. Log in with your Google account
3. Click your app: **"BusWay Pro: School Bus Fee Manager"**
4. Left menu: Click **"Setup"**
5. Under Setup, find: **"Graphics assets"** (or "Graphics")
6. Click: **"Graphics assets"**
7. Scroll down to: **"Feature graphic"** section

### Upload Section
You'll see:
```
🖼️ Feature graphic
(1024×500 px)
(Shows current image if exists)
[Upload images] button
```

### What to Upload
**File**: `play-store-assets/feature-graphic/feature_graphic_1024x500.png`  
**Size**: 1024 × 500 pixels EXACTLY  
**Format**: PNG or JPEG

### Screenshot of Upload
```
┌─────────────────────────────────────────────┐
│ Feature graphic (1024×500 px)               │
├─────────────────────────────────────────────┤
│ [Upload images] button                      │
│                                             │
│ Requirements:                               │
│ • 1024×500 pixels (landscape)              │
│ • PNG or JPEG format                       │
│ • Max 5 MB per image                       │
│ • Will display at top of app listing        │
└─────────────────────────────────────────────┘
```

### Steps to Upload
1. Scroll to **Feature graphic** section
2. Click **[Upload images]** button
3. Select file: `feature_graphic_1024x500.png`
4. Click **Open**
5. Wait for preview
6. Verify looks good
7. Click **Save**

---

## 🎯 LOCATIONS 3-7: Phone Screenshots Upload

### URL (Direct Link)
```
https://play.google.com/console/u/0/developers/account/
```

### Navigation Steps
1. Go to: **https://play.google.com/console/**
2. Log in with your Google account
3. Click your app: **"BusWay Pro: School Bus Fee Manager"**
4. Left menu: Click **"Setup"**
5. Under Setup, find: **"Graphics assets"**
6. Click: **"Graphics assets"**
7. Scroll down to: **"Phone screenshots"** section (below Feature graphic)

### Upload Section
You'll see:
```
📱 Phone screenshots
(1242×2208 px - portrait)
(Shows 0 screenshots if new)
[Upload images] button
Maximum 8 screenshots
Minimum 2 screenshots required
```

### What to Upload (5 files)
**Files**:
1. `play-store-assets/screenshots/screenshot_1_dashboard.png`
2. `play-store-assets/screenshots/screenshot_2_payment.png`
3. `play-store-assets/screenshots/screenshot_3_tracking.png`
4. `play-store-assets/screenshots/screenshot_4_attendance.png`
5. `play-store-assets/screenshots/screenshot_5_settings.png`

**Size**: 1242 × 2208 pixels (exactly)  
**Format**: PNG or JPEG  
**Quantity**: 5-8 screenshots

### Screenshot of Upload Section
```
┌──────────────────────────────────────────────────┐
│ Phone screenshots (1242×2208 px - portrait)      │
├──────────────────────────────────────────────────┤
│ [Uploaded: 0] [Upload images] button             │
│                                                  │
│ Order: (1) (2) (3) (4) (5) ...                  │
│                                                  │
│ Requirements:                                    │
│ • 1242×2208 pixels (portrait orientation)       │
│ • PNG or JPEG format                            │
│ • Minimum 2 screenshots                         │
│ • Maximum 8 screenshots                         │
│ • Recommended: 5-8 for better conversion        │
│ • Max 5 MB per image                            │
│ • No personal data                              │
│ • High quality images recommended               │
└──────────────────────────────────────────────────┘
```

### Steps to Upload All Screenshots
1. Scroll to **Phone screenshots** section
2. Click **[Upload images]** button
3. **You can drag & drop OR click to select**
   - Option A: Drag all 5 PNG files at once
   - Option B: Click and select file 1, then repeat for 2-5
4. Wait for all files to upload
5. Verify order matches (1, 2, 3, 4, 5)
6. If order wrong: Drag to reorder
7. Click **Save**

### Alternative: Upload One at a Time
If drag-drop doesn't work:
1. Click **[Upload images]**
2. Select: `screenshot_1_dashboard.png`
3. Click **Open**
4. Repeat for screenshot 2-5
5. All will appear in order
6. Click **Save** once at end

---

## 📋 Complete Upload Checklist

### Before Starting
- [ ] Play Console account created
- [ ] App listing created
- [ ] All images in folders:
  - [ ] `play-store-assets/app-icon/app_icon_512x512.png`
  - [ ] `play-store-assets/feature-graphic/feature_graphic_1024x500.png`
  - [ ] `play-store-assets/screenshots/screenshot_1_dashboard.png`
  - [ ] `play-store-assets/screenshots/screenshot_2_payment.png`
  - [ ] `play-store-assets/screenshots/screenshot_3_tracking.png`
  - [ ] `play-store-assets/screenshots/screenshot_4_attendance.png`
  - [ ] `play-store-assets/screenshots/screenshot_5_settings.png`

### During Upload
- [ ] Go to https://play.google.com/console
- [ ] Click your app
- [ ] Go to **Setup** → **App icon**
- [ ] Upload app icon (**Save**)
- [ ] Go to **Setup** → **Graphics assets**
- [ ] Upload feature graphic (**Save**)
- [ ] Upload 5 screenshots (**Save**)
- [ ] Verify all images appear in preview

### After Upload
- [ ] All images show in preview
- [ ] App icon looks good
- [ ] Feature graphic positioned correctly
- [ ] Screenshots in correct order
- [ ] No overlapping or cut-off content
- [ ] Ready to continue with other metadata

---

## 🔍 Upload Verification

After uploading, verify each image appears correctly:

### App Icon Verification
- [ ] Icon appears in app card preview
- [ ] Icon shows in search results
- [ ] Icon shows in featured section
- [ ] Icon visible and clear

### Feature Graphic Verification
- [ ] Appears at top of app listing
- [ ] Text doesn't get cut off
- [ ] Colors look good
- [ ] Properly displayed (1024×500)

### Screenshots Verification
- [ ] All 5 appear in gallery
- [ ] Order is correct (1, 2, 3, 4, 5)
- [ ] Each displays full height
- [ ] No zoomed-in or cut portions
- [ ] Text is readable on preview

---

## 🚨 Common Upload Issues & Fixes

### Image Won't Upload
**Problem**: Upload button doesn't work or file rejecting  
**Solution**:
1. Check file size isn't too large (< 5MB)
2. Verify format is PNG or JPEG
3. Check filename has no special characters
4. Try different browser (Chrome recommended)
5. Clear browser cache and try again

### Image Dimensions Wrong
**Problem**: Play Console says "Invalid size"  
**Solution**:
1. Verify exact dimensions in Figma/image editor
2. Resize using: https://www.imageresizer.com/
3. Check file hasn't been scaled by compression
4. Recreate image with correct size

### Image Appears Blurry
**Problem**: Upload looks pixelated or low quality  
**Solution**:
1. Ensure original image is high resolution
2. Screenshot at full device resolution (1242×2208)
3. Don't scale up low-res images
4. Use PNG for better quality than JPEG
5. Re-upload with better quality

### Can't Find "Setup" Menu
**Problem**: Left menu doesn't show Setup  
**Solution**:
1. Make sure you're logged into Play Console
2. Make sure you selected your app
3. Scroll left menu up/down to find "Setup"
4. Try refreshing page
5. Check you're in correct app's console

### Screenshots in Wrong Order
**Problem**: Screenshot order is 1, 3, 2, 5, 4 instead of 1, 2, 3, 4, 5  
**Solution**:
1. Look for drag handles (dots or grips)
2. Drag each screenshot to correct position
3. Or delete in wrong order and re-upload
4. Or use arrow buttons if available
5. Save after reordering

---

## 💾 Keeping Images Organized

**Recommended folder structure** (on your computer):
```
C:\BusWay\
├── play-store-assets\
│   ├── app-icon\
│   │   └── app_icon_512x512.png
│   ├── feature-graphic\
│   │   └── feature_graphic_1024x500.png
│   ├── screenshots\
│   │   ├── screenshot_1_dashboard.png
│   │   ├── screenshot_2_payment.png
│   │   ├── screenshot_3_tracking.png
│   │   ├── screenshot_4_attendance.png
│   │   └── screenshot_5_settings.png
│   └── guides\
│       ├── UPLOAD_GUIDE.md
│       ├── FOLDER_INDEX.md
│       └── PLAY_STORE_URLS.md (this file)
```

---

## 🔄 Updating Images Later

If you need to change images after submission:

1. Create new image with **same specifications**
2. Save to **same filename** (to keep organized)
3. Go to Play Console
4. Click the image you want to replace
5. Click **[Replace]** or **[Change]** button
6. Select new file
7. Click **Save**

**Note**: Updates may take 1-2 hours to reflect in Play Store

---

## ⏱️ Upload Timeline

```
⏱️ 0 min: Start uploading (logged in to Play Console)
⏱️ 2 min: App icon uploaded
⏱️ 3 min: Feature graphic uploaded
⏱️ 5 min: All 5 screenshots uploaded
⏱️ 5 min: Final verification in preview
⏱️ DONE: All images uploaded and saved!

TOTAL TIME: 5-10 minutes
```

---

## ✅ Ready to Upload?

1. ✓ Open Play Console: **https://play.google.com/console/**
2. ✓ Select your app
3. ✓ Go to **Setup** → **App icon**
4. ✓ Upload: `app_icon_512x512.png`
5. ✓ Go to **Setup** → **Graphics assets**
6. ✓ Upload: `feature_graphic_1024x500.png`
7. ✓ Upload all 5 screenshots
8. ✓ Click **Save**
9. ✓ **DONE!**

---

**Next Steps**:
1. Create images using guides in UPLOAD_GUIDE.md
2. Upload using this document (PLAY_STORE_URLS.md)
3. Continue with other metadata in Play Console
4. Submit app for review

**Questions?** Refer to UPLOAD_GUIDE.md or FOLDER_INDEX.md
