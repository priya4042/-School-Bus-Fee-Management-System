# Step 4: Data Usage and Handling - Complete Guidance

## Overview
You need to answer 4 questions for **each data type** you selected. Go through them one by one.

---

## PERSONAL INFO SECTION (4 items)

### 1️⃣ NAME
**Is this data collected, shared, or both?**
- ✅ **Collected** (CHECK THIS)
- ⬜ Shared

**Is this data processed ephemerally?**
- ⬜ Yes, this collected data is processed ephemerally
- ✅ **No, this collected data is not processed ephemerally** (CHECK THIS)

**Is this data required for your app, or can users choose?**
- ✅ **Data collection is required** (CHECK THIS)
  - *Why:* Parents/admins need student names for fee records and identification

**Why is this user data collected? (Select all that apply)**
- ✅ **App functionality** (CHECK THIS) - Used to identify students and manage fee records
- ⬜ Analytics
- ⬜ Developer communications
- ⬜ Advertising or marketing
- ⬜ Fraud prevention, security, and compliance
- ⬜ Personalization
- ✅ **Account management** (CHECK THIS) - Used in parent/student accounts

---

### 2️⃣ EMAIL ADDRESS
**Is this data collected, shared, or both?**
- ✅ **Collected** (CHECK THIS)
- ⬜ Shared

**Is this data processed ephemerally?**
- ⬜ Yes, this collected data is processed ephemerally
- ✅ **No, this collected data is not processed ephemerally** (CHECK THIS)

**Is this data required for your app, or can users choose?**
- ✅ **Data collection is required** (CHECK THIS)
  - *Why:* Email is needed for login/authentication

**Why is this user data collected? (Select all that apply)**
- ✅ **App functionality** (CHECK THIS) - Used for user authentication and login
- ⬜ Analytics
- ✅ **Developer communications** (CHECK THIS) - Send important fee notifications/updates
- ⬜ Advertising or marketing
- ⬜ Fraud prevention, security, and compliance
- ⬜ Personalization
- ✅ **Account management** (CHECK THIS) - Email is used for account creation and management

---

### 3️⃣ USER IDS
**Is this data collected, shared, or both?**
- ✅ **Collected** (CHECK THIS)
- ⬜ Shared

**Is this data processed ephemerally?**
- ⬜ Yes, this collected data is processed ephemerally
- ✅ **No, this collected data is not processed ephemerally** (CHECK THIS)

**Is this data required for your app, or can users choose?**
- ✅ **Data collection is required** (CHECK THIS)
  - *Why:* User IDs (Supabase) are essential for authentication and database operations

**Why is this user data collected? (Select all that apply)**
- ✅ **App functionality** (CHECK THIS) - Used to authenticate users and manage database records
- ⬜ Analytics
- ⬜ Developer communications
- ⬜ Advertising or marketing
- ⬜ Fraud prevention, security, and compliance
- ⬜ Personalization
- ✅ **Account management** (CHECK THIS) - Required for account identification in database

---

### 4️⃣ PHONE NUMBER
**Is this data collected, shared, or both?**
- ✅ **Collected** (CHECK THIS)
- ✅ **Shared** (CHECK THIS) - *Shared with Twilio for SMS notifications*

**Is this data processed ephemerally?**
- ⬜ Yes, this collected data is processed ephemerally
- ✅ **No, this collected data is not processed ephemerally** (CHECK THIS)

**Is this data required for your app, or can users choose?**
- ⬜ Data collection is required
- ✅ **Users can choose whether this data is collected** (CHECK THIS)
  - *Why:* SMS notifications are optional. Users can opt out.

**Why is this user data collected? (Select all that apply)**
- ✅ **App functionality** (CHECK THIS) - Enables SMS notifications for fee alerts
- ⬜ Analytics
- ✅ **Developer communications** (CHECK THIS) - Send fee payment reminders via SMS
- ⬜ Advertising or marketing
- ⬜ Fraud prevention, security, and compliance
- ⬜ Personalization
- ⬜ Account management

**Why is this user data shared? (Select all that apply)** ⭐ *APPEARS BECAUSE YOU SELECTED "SHARED"*
- ⬜ App functionality
- ⬜ Analytics
- ✅ **Developer communications** (CHECK THIS) - Twilio is used only to send fee payment notifications and reminders
- ⬜ Advertising or marketing
- ⬜ Fraud prevention, security, and compliance
- ⬜ Personalization
- ⬜ Account management

---

## FINANCIAL INFO SECTION (1 item)

### 5️⃣ USER PAYMENT INFO
**Is this data collected, shared, or both?**
- ✅ **Collected** (CHECK THIS)
- ✅ **Shared** (CHECK THIS) - *Shared with Razorpay for payment processing*

**Is this data processed ephemerally?**
- ⬜ Yes, this collected data is processed ephemerally
- ✅ **No, this collected data is not processed ephemerally** (CHECK THIS)

**Is this data required for your app, or can users choose?**
- ✅ **Data collection is required** (CHECK THIS)
  - *Why:* Payment information is essential for processing school bus fees

**Why is this user data collected? (Select all that apply)**
- ✅ **App functionality** (CHECK THIS) - Used to process school bus fee payments
- ⬜ Analytics
- ⬜ Developer communications
- ⬜ Advertising or marketing
- ✅ **Fraud prevention, security, and compliance** (CHECK THIS) - PCI DSS Level 1 compliant payment processing through Razorpay
- ⬜ Personalization
- ⬜ Account management

**Why is this user data shared? (Select all that apply)** ⭐ *APPEARS BECAUSE YOU SELECTED "SHARED"*
- ✅ **App functionality** (CHECK THIS) - Razorpay is the payment processor for all fee transactions
- ⬜ Analytics
- ⬜ Developer communications
- ⬜ Advertising or marketing
- ✅ **Fraud prevention, security, and compliance** (CHECK THIS) - Razorpay handles PCI DSS Level 1 compliant payment processing and fraud detection
- ⬜ Personalization
- ⬜ Account management

---

## LOCATION SECTION (2 items)

### 6️⃣ APPROXIMATE LOCATION
**Is this data collected, shared, or both?**
- ✅ **Collected** (CHECK THIS)
- ✅ **Shared** (CHECK THIS) - *Shared with parents/admins to view bus location*

**Is this data processed ephemerally?**
- ⬜ Yes, this collected data is processed ephemerally
- ✅ **No, this collected data is not processed ephemerally** (CHECK THIS)

**Is this data required for your app, or can users choose?**
- ✅ **Data collection is required** (CHECK THIS)
  - *Why:* Bus location tracking is a core feature parents rely on

**Why is this user data collected? (Select all that apply)**
- ✅ **App functionality** (CHECK THIS) - Used to display bus location on map for parents/admins
- ⬜ Analytics
- ⬜ Developer communications
- ⬜ Advertising or marketing
- ⬜ Fraud prevention, security, and compliance
- ⬜ Personalization
- ⬜ Account management

**Why is this user data shared? (Select all that apply)** ⭐ *APPEARS BECAUSE YOU SELECTED "SHARED"*
- ✅ **App functionality** (CHECK THIS) - Shared with parents and administrators to view real-time bus location
- ⬜ Analytics
- ⬜ Developer communications
- ⬜ Advertising or marketing
- ⬜ Fraud prevention, security, and compliance
- ⬜ Personalization
- ⬜ Account management

---

### 7️⃣ PRECISE LOCATION
**Is this data collected, shared, or both?**
- ✅ **Collected** (CHECK THIS)
- ✅ **Shared** (CHECK THIS) - *Shared with parents/admins and Google Maps API*

**Is this data processed ephemerally?**
- ⬜ Yes, this collected data is processed ephemerally
- ✅ **No, this collected data is not processed ephemerally** (CHECK THIS)

**Is this data required for your app, or can users choose?**
- ✅ **Data collection is required** (CHECK THIS)
  - *Why:* Precise GPS location is needed for accurate bus tracking and route visualization

**Why is this user data collected? (Select all that apply)**
- ✅ **App functionality** (CHECK THIS) - Used for real-time bus location tracking and navigation
- ⬜ Analytics
- ⬜ Developer communications
- ⬜ Advertising or marketing
- ⬜ Fraud prevention, security, and compliance
- ⬜ Personalization
- ⬜ Account management

**Why is this user data shared? (Select all that apply)** ⭐ *APPEARS BECAUSE YOU SELECTED "SHARED"*
- ✅ **App functionality** (CHECK THIS) - Shared with parents/administrators for real-time tracking and with Google Maps API for route visualization
- ⬜ Analytics
- ⬜ Developer communications
- ⬜ Advertising or marketing
- ⬜ Fraud prevention, security, and compliance
- ⬜ Personalization
- ⬜ Account management

---

## PHOTOS AND VIDEOS SECTION (2 items)

### 8️⃣ PHOTOS
**Is this data collected, shared, or both?**
- ✅ **Collected** (CHECK THIS)
- ⬜ Shared

**Is this data processed ephemerally?**
- ⬜ Yes, this collected data is processed ephemerally
- ✅ **No, this collected data is not processed ephemerally** (CHECK THIS)

**Is this data required for your app, or can users choose?**
- ⬜ Data collection is required
- ✅ **Users can choose whether this data is collected** (CHECK THIS)
  - *Why:* Student profile photos are optional

**Why is this user data collected? (Select all that apply)**
- ✅ **App functionality** (CHECK THIS) - Used for student profile identification
- ⬜ Analytics
- ⬜ Developer communications
- ⬜ Advertising or marketing
- ⬜ Fraud prevention, security, and compliance
- ⬜ Personalization
- ⬜ Account management

---

### 9️⃣ VIDEOS
**Is this data collected, shared, or both?**
- ✅ **Collected** (CHECK THIS)
- ✅ **Shared** (CHECK THIS) - *Shared with authorized admins/parents via RTSP bus cameras*

**Is this data processed ephemerally?**
- ⬜ Yes, this collected data is processed ephemerally
- ✅ **No, this collected data is not processed ephemerally** (CHECK THIS)

**Is this data required for your app, or can users choose?**
- ⬜ Data collection is required
- ✅ **Users can choose whether this data is collected** (CHECK THIS)
  - *Why:* Bus camera feeds are an optional safety feature

**Why is this user data collected? (Select all that apply)**
- ✅ **App functionality** (CHECK THIS) - Bus camera feeds for optional monitoring
- ⬜ Analytics
- ⬜ Developer communications
- ⬜ Advertising or marketing
- ✅ **Fraud prevention, security, and compliance** (CHECK THIS) - Optional safety monitoring for student security
- ⬜ Personalization
- ⬜ Account management

**Why is this user data shared? (Select all that apply)** ⭐ *APPEARS BECAUSE YOU SELECTED "SHARED"*
- ⬜ App functionality
- ⬜ Analytics
- ⬜ Developer communications
- ⬜ Advertising or marketing
- ✅ **Fraud prevention, security, and compliance** (CHECK THIS) - Video feeds shared with authorized school admins and parents for optional student safety monitoring
- ⬜ Personalization
- ⬜ Account management

---

## APP INFO & PERFORMANCE SECTION (3 items)

### 🔟 CRASH LOGS
**Is this data collected, shared, or both?**
- ✅ **Collected** (CHECK THIS)
- ✅ **Shared** (CHECK THIS) - *Shared with Firebase for error tracking*

**Is this data processed ephemerally?**
- ⬜ Yes, this collected data is processed ephemerally
- ✅ **No, this collected data is not processed ephemerally** (CHECK THIS)

**Is this data required for your app, or can users choose?**
- ⬜ Data collection is required
- ✅ **Users can choose whether this data is collected** (CHECK THIS)
  - *Why:* Crash reporting can be disabled in app settings

**Why is this user data collected? (Select all that apply)**
- ⬜ App functionality
- ✅ **Analytics** (CHECK THIS) - Diagnostic crashes to improve app stability
- ⬜ Developer communications
- ⬜ Advertising or marketing
- ⬜ Fraud prevention, security, and compliance
- ⬜ Personalization
- ⬜ Account management

**Why is this user data shared? (Select all that apply)** ⭐ *APPEARS BECAUSE YOU SELECTED "SHARED"*
- ⬜ App functionality
- ✅ **Analytics** (CHECK THIS) - Firebase Crashlytics collects crash data to diagnose bugs and improve app reliability
- ⬜ Developer communications
- ⬜ Advertising or marketing
- ⬜ Fraud prevention, security, and compliance
- ⬜ Personalization
- ⬜ Account management

---

### 1️⃣1️⃣ DIAGNOSTICS
**Is this data collected, shared, or both?**
- ✅ **Collected** (CHECK THIS)
- ✅ **Shared** (CHECK THIS) - *Shared with Firebase for performance diagnostics*

**Is this data processed ephemerally?**
- ⬜ Yes, this collected data is processed ephemerally
- ✅ **No, this collected data is not processed ephemerally** (CHECK THIS)

**Is this data required for your app, or can users choose?**
- ⬜ Data collection is required
- ✅ **Users can choose whether this data is collected** (CHECK THIS)
  - *Why:* Diagnostics can be disabled in app settings

**Why is this user data collected? (Select all that apply)**
- ⬜ App functionality
- ✅ **Analytics** (CHECK THIS) - Diagnostic data to monitor app health and performance
- ⬜ Developer communications
- ⬜ Advertising or marketing
- ⬜ Fraud prevention, security, and compliance
- ⬜ Personalization
- ⬜ Account management

**Why is this user data shared? (Select all that apply)** ⭐ *APPEARS BECAUSE YOU SELECTED "SHARED"*
- ⬜ App functionality
- ✅ **Analytics** (CHECK THIS) - Firebase Performance Monitoring analyzes diagnostics to track app responsiveness and stability
- ⬜ Developer communications
- ⬜ Advertising or marketing
- ⬜ Fraud prevention, security, and compliance
- ⬜ Personalization
- ⬜ Account management

---

### 1️⃣2️⃣ OTHER APP PERFORMANCE DATA
**Is this data collected, shared, or both?**
- ✅ **Collected** (CHECK THIS)
- ✅ **Shared** (CHECK THIS) - *Shared with Firebase for performance analytics*

**Is this data processed ephemerally?**
- ⬜ Yes, this collected data is processed ephemerally
- ✅ **No, this collected data is not processed ephemerally** (CHECK THIS)

**Is this data required for your app, or can users choose?**
- ⬜ Data collection is required
- ✅ **Users can choose whether this data is collected** (CHECK THIS)
  - *Why:* Performance data collection can be disabled

**Why is this user data collected? (Select all that apply)**
- ⬜ App functionality
- ✅ **Analytics** (CHECK THIS) - Performance metrics to improve app speed and reliability
- ⬜ Developer communications
- ⬜ Advertising or marketing
- ⬜ Fraud prevention, security, and compliance
- ⬜ Personalization
- ⬜ Account management

**Why is this user data shared? (Select all that apply)** ⭐ *APPEARS BECAUSE YOU SELECTED "SHARED"*
- ⬜ App functionality
- ✅ **Analytics** (CHECK THIS) - Firebase Analytics collects performance data to measure app usage and effectiveness
- ⬜ Developer communications
- ⬜ Advertising or marketing
- ⬜ Fraud prevention, security, and compliance
- ⬜ Personalization
- ⬜ Account management

---

## APP ACTIVITY SECTION (1 item)

### 1️⃣3️⃣ APP INTERACTIONS
**Is this data collected, shared, or both?**
- ✅ **Collected** (CHECK THIS)
- ✅ **Shared** (CHECK THIS) - *Shared with Google Analytics*

**Is this data processed ephemerally?**
- ⬜ Yes, this collected data is processed ephemerally
- ✅ **No, this collected data is not processed ephemerally** (CHECK THIS)

**Is this data required for your app, or can users choose?**
- ⬜ Data collection is required
- ✅ **Users can choose whether this data is collected** (CHECK THIS)
  - *Why:* Analytics can be disabled in app settings

**Why is this user data collected? (Select all that apply)**
- ⬜ App functionality
- ✅ **Analytics** (CHECK THIS) - Track feature usage, user behavior, and engagement metrics
- ⬜ Developer communications
- ⬜ Advertising or marketing
- ⬜ Fraud prevention, security, and compliance
- ⬜ Personalization
- ⬜ Account management

**Why is this user data shared? (Select all that apply)** ⭐ *APPEARS BECAUSE YOU SELECTED "SHARED"*
- ⬜ App functionality
- ✅ **Analytics** (CHECK THIS) - Google Analytics measures feature usage and user engagement to understand app performance
- ⬜ Developer communications
- ⬜ Advertising or marketing
- ⬜ Fraud prevention, security, and compliance
- ⬜ Personalization
- ⬜ Account management

---

## DEVICE OR OTHER IDS SECTION (1 item)

### 1️⃣4️⃣ DEVICE OR OTHER IDS
**Is this data collected, shared, or both?**
- ✅ **Collected** (CHECK THIS)
- ✅ **Shared** (CHECK THIS) - *Shared with Google Analytics*

**Is this data processed ephemerally?**
- ⬜ Yes, this collected data is processed ephemerally
- ✅ **No, this collected data is not processed ephemerally** (CHECK THIS)

**Is this data required for your app, or can users choose?**
- ⬜ Data collection is required
- ✅ **Users can choose whether this data is collected** (CHECK THIS)
  - *Why:* Device ID collection can be disabled through analytics settings

**Why is this user data collected? (Select all that apply)**
- ⬜ App functionality
- ✅ **Analytics** (CHECK THIS) - Device ID for tracking user sessions and analytics
- ⬜ Developer communications
- ⬜ Advertising or marketing
- ⬜ Fraud prevention, security, and compliance
- ⬜ Personalization
- ⬜ Account management

**Why is this user data shared? (Select all that apply)** ⭐ *APPEARS BECAUSE YOU SELECTED "SHARED"*
- ⬜ App functionality
- ✅ **Analytics** (CHECK THIS) - Google Analytics uses device ID to track sessions and correlate analytics data from the same user
- ⬜ Developer communications
- ⬜ Advertising or marketing
- ⬜ Fraud prevention, security, and compliance
- ⬜ Personalization
- ⬜ Account management

---

## Summary Table

| Data Type | Collected | Shared | Ephemeral | Required | Reasons |
|-----------|-----------|--------|-----------|----------|---------|
| Name | ✅ | ❌ | ❌ | ✅ | App functionality, Account management |
| Email | ✅ | ❌ | ❌ | ✅ | App functionality, Dev communications, Account mgmt |
| User IDs | ✅ | ❌ | ❌ | ✅ | App functionality, Account management |
| Phone Number | ✅ | ✅ Twilio | ❌ | ❌ Optional | App functionality, Dev communications |
| User Payment Info | ✅ | ✅ Razorpay | ❌ | ✅ | App functionality, Fraud prevention/security |
| Approximate Location | ✅ | ✅ Parents | ❌ | ✅ | App functionality |
| Precise Location | ✅ | ✅ Parents/Maps | ❌ | ✅ | App functionality |
| Photos | ✅ | ❌ | ❌ | ❌ Optional | App functionality |
| Videos | ✅ | ✅ Authorized | ❌ | ❌ Optional | App functionality, Fraud prevention/security |
| Crash Logs | ✅ | ✅ Firebase | ❌ | ❌ Optional | Analytics |
| Diagnostics | ✅ | ✅ Firebase | ❌ | ❌ Optional | Analytics |
| Other App Performance | ✅ | ✅ Firebase | ❌ | ❌ Optional | Analytics |
| App Interactions | ✅ | ✅ Google Analytics | ❌ | ❌ Optional | Analytics |
| Device IDs | ✅ | ✅ Google Analytics | ❌ | ❌ Optional | Analytics |

---

## Next Steps
1. ✅ Go through each data type above
2. ✅ Fill in the answers as shown
3. ✅ Click "Start" next to each item in Google Play Console
4. ✅ Answer the 4 questions for each item
5. ✅ Click "Save" after each item is complete
6. ✅ Once all items show "0 of X completed" → "X of X completed", click NEXT
7. ✅ You'll be taken to Step 5 (Final Review)
