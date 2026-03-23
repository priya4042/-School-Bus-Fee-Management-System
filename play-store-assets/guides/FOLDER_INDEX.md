# 📁 Play Store Assets - Folder Index

## Quick Overview

```
play-store-assets/
├── app-icon/                           ← APP ICON (512×512)
│   └── app_icon_512x512.png
├── feature-graphic/                    ← FEATURE GRAPHIC (1024×500)
│   └── feature_graphic_1024x500.png
├── screenshots/                        ← PHONE SCREENSHOTS (1242×2208)
│   ├── screenshot_1_dashboard.png
│   ├── screenshot_2_payment.png
│   ├── screenshot_3_tracking.png
│   ├── screenshot_4_attendance.png
│   └── screenshot_5_settings.png
└── guides/
    ├── UPLOAD_GUIDE.md                 ← HOW TO CREATE IMAGES
    ├── FOLDER_INDEX.md                 ← This file!
    └── PLAY_STORE_URLS.md              ← Where to upload (next)
```

---

## 📊 Assets Summary

| Asset | Size | Quantity | Format | Where to Create | Where to Upload |
|-------|------|----------|--------|-----------------|-----------------|
| **App Icon** | 512×512 | 1 | PNG | Figma/Canva/Android Asset Studio | Play Console → Setup → App icon |
| **Feature Graphic** | 1024×500 | 1 | PNG/JPG | Figma/Canva | Play Console → Setup → Graphics assets |
| **Phone Screenshots** | 1242×2208 | 5-8 | PNG/JPG | Real phone/Emulator/Figma | Play Console → Setup → Graphics assets |
| **Tablet Screenshots** | 1600×2560 | Optional | PNG/JPG | Real tablet/Emulator | Play Console → Setup → Graphics assets |

---

## 🎯 Which Folder? Which Image?

### FOLDER 1: app-icon/

**Purpose**: Your app's icon in Play Store  
**Size**: Exactly 512×512 pixels  
**What it shows**: App icon  
**File name**: `app_icon_512x512.png`  
**Upload to**: Google Play Console → Setup → App icon

**Appears in**:
- ✅ Play Store search results
- ✅ User home screen
- ✅ App drawer
- ✅ Settings
- ✅ Notification bar

**Quality**: Must be perfect! (Users never forget bad icons)

---

### FOLDER 2: feature-graphic/

**Purpose**: Banner image at top of Play Store listing  
**Size**: Exactly 1024×500 pixels (landscape)  
**What it shows**: App name, main features, call-to-action  
**File name**: `feature_graphic_1024x500.png`  
**Upload to**: Google Play Console → Setup → Graphics assets → Feature graphic

**Appears in**:
- ✅ Top of app listing page
- ✅ Featured apps section
- ✅ Category browsing
- ✅ Search results (sometimes)

**Quality**: Second most important! (First impression)

---

### FOLDER 3: screenshots/

**Purpose**: Show app features to potential users  
**Size**: Exactly 1242×2208 pixels (portrait/vertical)  
**What it shows**: Different app screens and features  
**File names**:
- `screenshot_1_dashboard.png` (Home/Dashboard)
- `screenshot_2_payment.png` (Payment feature)
- `screenshot_3_tracking.png` (Bus tracking)
- `screenshot_4_attendance.png` (Attendance/History)
- `screenshot_5_settings.png` (Settings/Menu)

**Upload to**: Google Play Console → Setup → Graphics assets → Phone screenshots

**Appears in**:
- ✅ App listing page
- ✅ User reviews (referenced)
- ✅ Ad campaigns
- ✅ Store promotion

**Quality**: Very important! (Drives conversions)

**Best Practices**:
- Show real app screenshots (not mockups)
- Use portrait orientation (tall, narrow)
- Include 5-8 screenshots (5 is minimum)
- Show progression through app
- Add text captions for clarity
- Show main features
- Use consistent styling
- No personal data/test accounts

---

## 📥 Download Instructions

### To Get Files When Ready:

**Option A: From play-store-assets folder**
```bash
# Navigate to folder
cd play-store-assets/

# You'll see:
app-icon/
  └── app_icon_512x512.png
feature-graphic/
  └── feature_graphic_1024x500.png
screenshots/
  ├── screenshot_1_dashboard.png
  ├── screenshot_2_payment.png
  ├── screenshot_3_tracking.png
  ├── screenshot_4_attendance.png
  └── screenshot_5_settings.png
```

**Option B: Download all at once** (on Windows)
```powershell
# Compress all images into ZIP
Compress-Archive -Path play-store-assets\* -DestinationPath play-store-assets.zip
```

---

## 🚀 Upload Order (Step-by-Step)

### Step 1: App Icon
1. Go to: https://play.google.com/console
2. Click your app
3. Left menu: **Setup** → **App icon**
4. Upload: `app-icon/app_icon_512x512.png`
5. Click **Save**

### Step 2: Feature Graphic
1. Same app in Play Console
2. Left menu: **Setup** → **Graphics assets**
3. Find: **Feature graphic** section
4. Upload: `feature-graphic/feature_graphic_1024x500.png`
5. Click **Save**

### Step 3: Screenshots
1. Same app in Play Console
2. Left menu: **Setup** → **Graphics assets**
3. Find: **Phone screenshots** section
4. Upload all 5 files from `screenshots/` folder
5. Verify order (1, 2, 3, 4, 5)
6. Click **Save**

---

## 📋 File Checklist

Before uploading, verify:

### App Icon Checklist
- [ ] File name: `app_icon_512x512.png`
- [ ] Size: Exactly 512×512 pixels
- [ ] Format: PNG (recommended)
- [ ] Location: `play-store-assets/app-icon/`
- [ ] Quality: Professional, clear
- [ ] Background: Solid color (no transparency)
- [ ] Visible design (not blank)

### Feature Graphic Checklist
- [ ] File name: `feature_graphic_1024x500.png`
- [ ] Size: Exactly 1024×500 pixels
- [ ] Format: PNG or JPG
- [ ] Location: `play-store-assets/feature-graphic/`
- [ ] Quality: Professional, bright
- [ ] Text: Large, readable, no cutoff
- [ ] Design: Landscape orientation
- [ ] Includes: App name, main features

### Screenshots Checklist (×5)
- [ ] File names: `screenshot_1_dashboard.png` through `screenshot_5_settings.png`
- [ ] Size: Exactly 1242×2208 pixels
- [ ] Format: PNG or JPG
- [ ] Location: `play-store-assets/screenshots/`
- [ ] Quantity: 5 minimum (8 maximum)
- [ ] Quality: Real screenshots (not mockups)
- [ ] Orientation: Vertical/portrait (tall, narrow)
- [ ] No personal data: No emails, names, addresses
- [ ] No test accounts: No test user info
- [ ] Text: Large and readable
- [ ] Progression: Shows different features in order
- [ ] Consistency: Same style throughout

---

## 🎯 What Each Screenshot Should Show

**Screenshot 1: Dashboard**
- App home/main screen
- Navigation menu
- Key metrics/balance
- User welcome message

**Screenshot 2: Payments**
- Fee due amount
- Payment method selection
- Payment button/CTA
- Receipt preview

**Screenshot 3: Bus Tracking**
- Map with bus location
- Real-time tracking info
- ETA/arrival time
- Bus details (number, speed)

**Screenshot 4: Attendance**
- Calendar or attendance list
- Check-in/check-out times
- Date selection
- Attendance history

**Screenshot 5: Settings**
- User profile menu
- Notifications settings
- Payment methods
- Help/Support options

---

## 🔄 Update/Replace Images

If you need to replace images later:

1. Create new image with same specification
2. Save to same folder (overwrite old file)
3. Go to Play Console
4. Upload new image (it will replace old one)
5. Click **Save**
6. Changes live in 1-2 hours

---

## 📐 Size Verification

To verify image sizes on Windows:

```powershell
# Check app icon
identify play-store-assets\app-icon\app_icon_512x512.png

# Check feature graphic
identify play-store-assets\feature-graphic\feature_graphic_1024x500.png

# Check all screenshots
Get-ChildItem play-store-assets\screenshots\*.png | ForEach-Object {
    identify $_.FullName
}
```

Or use online tool: https://www.imageresizer.com/

---

## 💾 File Size Limits

| Asset | Max Size | Recommended |
|-------|----------|-------------|
| App Icon | 512 KB | 100-200 KB |
| Feature Graphic | 5 MB | 1-2 MB |
| Screenshots | 5 MB each | 1-2 MB each |

**Too large?** Compress at: https://tinypng.com/

---

## ✅ Ready to Upload?

- [ ] All images created ✓
- [ ] All images correct size ✓
- [ ] All images in correct folders ✓
- [ ] All file names correct ✓
- [ ] All images professional quality ✓
- [ ] Verified no personal data ✓
- [ ] Verified dimensions ✓

**Then go to**: https://play.google.com/console  
**And follow**: UPLOAD_GUIDE.md

---

## 📞 Questions?

- **How to create images?** → See: `guides/UPLOAD_GUIDE.md`
- **Exact upload URLs?** → See: `guides/PLAY_STORE_URLS.md`
- **Full Play Console workflow?** → See: `PLAY_STORE_SUBMISSION_GUIDE.md` (root folder)

---

**Status**: 📁 Folders ready, awaiting image files  
**Next**: Create images using guides and tools recommended  
**Then**: Upload to Play Console using UPLOAD_GUIDE.md
