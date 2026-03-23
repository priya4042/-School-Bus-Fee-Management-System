# Play Store Assets Checklist

This file documents all the visual and textual assets required for Google Play Store submission.

## ✅ Assets Status

### Critical (Required for submission)
- [ ] **App Icon** (512×512 px)
  - Format: PNG (24-bit)
  - Alpha channel: Yes (but solid color in final version)
  - File location: `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`
  - File size: < 1 MB
  - Current status: **Placeholder exists**, needs professional design

- [ ] **Feature Graphic** (1024×500 px)
  - Format: PNG or JPG
  - Alpha: No (opaque background)
  - Upload location: Play Console → Graphic assets → Feature graphic
  - File size: < 5 MB
  - Current status: **MISSING** - needs creation

- [ ] **Phone Screenshots** (minimum 2, recommended 5+)
  - Dimensions: 1242×2208 px (9:16 aspect ratio)
  - Format: PNG or JPG (max 8 MB each)
  - Count: Minimum 2, recommended 4-5
  - Upload location: Play Console → Graphics assets → Phone screenshots
  - Should show: Dashboard, payments, map, attendance, settings
  - Current status: **MISSING** - needs creation

- [ ] **Privacy Policy URL** 
  - URL: `https://school-bus-fee-management-system.vercel.app/privacy-policy`
  - Status: ✅ **READY** - verified accessible

### Optional (Recommended for better visibility)
- [ ] **Tablet Screenshots** (1280×1920 px)
  - Only if app supports tablets
  - Minimum: 2 screenshots
  - Current status: Not required (phone-first app)

- [ ] **App Preview Video** (30 seconds max)
  - Dimensions: 1280×720 (16:9) or 1920×1080 (16:9)
  - Format: MP4, MOV, AVI, WebM
  - Max file size: 1 GB
  - Content: Show key user workflows
  - Current status: **OPTIONAL** - nice-to-have

## 📝 Textual Assets

### Required
- [x] **App Title:** "BusWay Pro: School Bus Fee Manager" (50 chars)
- [x] **Short Description:** "Manage school bus fees and attendance easily" (50 chars max)
- [x] **Full Description:** Location: `PLAY_STORE_DESCRIPTION.txt`
- [x] **Privacy Policy URL:** https://school-bus-fee-management-system.vercel.app/privacy-policy
- [ ] **Contact Email:** support@buswayapp.com (in Help & Support form)

### Metadata (in Play Console)
- [x] **App Category:** Education → Travel → Personal Finance
- [x] **Content Rating:** Family-friendly (ESRB: EVERYONE, PEGI: 3)
- [ ] **Supported Languages:** English (primary), regional languages (optional)

## 🎨 Design Guidelines

### Color Scheme (for assets)
```
Primary Blue:    #1e40af (RGB: 30, 64, 175)
Secondary Gold:  #fbbf24 (RGB: 251, 191, 36)
Success Green:   #22c55e (RGB: 34, 197, 94)
Alert Red:       #ef4444 (RGB: 239, 68, 68)
Neutral Gray:    #475569 (RGB: 71, 85, 105)
Light Gray:      #f1f5f9 (RGB: 241, 245, 249)
```

### Icon Design Tips
- Should represent "school bus" or "fee management"
- Use simplified shapes for clarity at small sizes
- High contrast for readability
- Avoid text/complex details
- Include padding/safe zone

### Screenshot Best Practices
- Real device screenshots (not mockups)
- Minimum 4 screenshots showing key features:
  1. Login/Dashboard (parent view)
  2. Fee payment or map view
  3. Student attendance
  4. Receipts/payment history
  5. Settings/profile (optional)
- Include app header/UI (not just content)
- Portrait orientation only
- Annotations/captions (optional) - max 48 chars
- Real data or realistic dummy data

### Feature Graphic Tips
- Clear text readable at small sizes
- Include:
  - App name/logo (left)
  - 2-3 key benefit phrases (center/right)
  - App icon and brand colors
  - Avoid cluttered design
- Professional appearance (not hand-drawn)

## 📸 Screenshot Creation Steps

### Option 1: Using Real Device
1. Launch app on Android phone (5.5" minimum)
2. Navigate to each key screen
3. Take screenshot (Power + Volume Down on most phones)
4. Use standard resolution (1242×2208 recommended)
5. Crop to exact dimensions if needed

### Option 2: Using Android Emulator
1. Open Android Studio
2. Run app on virtual device
3. Take screenshot via AVD Manager
4. Ensure correct resolution

### Option 3: Using Design Tool
1. Import app UI screenshots
2. Use Figma, Adobe XD, or Photoshop
3. Create 1242×2208 canvas
4. Arrange screenshots with annotations
5. Export as PNG

## 📋 Submission Checklist

Before uploading AAB to Play Console:
- [ ] App Icon created (512×512)
- [ ] Feature Graphic created (1024×500)
- [ ] At least 2 phone screenshots (1242×2208)
- [ ] All graphics match brand colors
- [ ] Privacy Policy URL provided
- [ ] App title and descriptions reviewed
- [ ] Data Safety form completed
- [ ] Content Rating questionnaire answered
- [ ] AAB file size verified (current: 6.02 MB)
- [ ] Tested on real Android device
- [ ] All permissions justified in description
- [ ] Support email configured
- [ ] Legal pages accessible from app

## 🔗 Helpful Resources

**Asset Creation Tools:**
- Icons: https://romannurik.github.io/AndroidAssetStudio/
- Screenshots: Figma, Adobe XD, or native device
- Video: DaVinci Resolve (free), Adobe Premiere, or ffmpeg
- Image compression: https://tinypng.com/ (for PNG)
- Image optimization: https://squoosh.app/

**Design Templates:**
- Google Play Console design specs: https://support.google.com/googleplay/android-developer/...
- Figma Play Store templates: Search "Play Store screenshot template"
- Adobe Stock graphics: Can be used under license

**Screenshots Examples:**
- Look at competitor apps on Google Play
- View real app screenshots in Play Store listings
- Get inspiration from Behance app case studies

## 🎯 Priority for Launch

**MUST HAVE (blocking):**
1. App Icon (512×512)
2. Feature Graphic (1024×500)
3. 2+ Phone Screenshots
4. Privacy Policy URL
5. Complete Data Safety form
6. Complete Content Rating

**NICE TO HAVE (improves visibility):**
7. 4-5 Screenshots (more detail)
8. App Preview Video
9. Localized descriptions
10. Feature badges/highlights

---

**Current Status:** Ready for asset creation and final submission!

**Estimated time to create all assets:** 2-4 hours (depending on design resources)

**Next step:** Contact designer or use template tools to create the required graphics.
