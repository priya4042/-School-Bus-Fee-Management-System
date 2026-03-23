# BusWay Pro - Complete Project Documentation

## 📱 PROJECT OVERVIEW

**Project Name:** BusWay Pro  
**Version:** 1.0.0  
**Type:** Full-stack mobile + web application  
**Platform:** Android (via Capacitor), Web (React)  
**Purpose:** School Bus Fee Management, Location Tracking & Parents Portal  

---

## 🎯 WHAT THE APP DOES

BusWay Pro is a comprehensive system that helps:
- **Parents** track their children's school bus in real-time
- **Parents** view attendance (pickup/drop-off times)
- **Parents** pay school bus fees online securely
- **Parents** receive notifications about bus status and payments
- **Schools/Admins** manage routes, buses, students, and fees
- **Schools/Admins** view reports and payments

---

## 👥 WHO USES IT

### 1. **Parents**
- Track bus location in real-time
- View child's attendance
- Pay fees online
- Get notifications
- Download receipts

### 2. **School Admins**
- Manage bus routes
- Manage student enrollment
- Collect fees
- Send bulk notifications
- View reports

### 3. **Accountants** (Optional)
- View payment records
- Generate financial reports

---

# 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                   USER DEVICES                              │
│  (Parent Mobile App / Admin Web / Teacher App)              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
        ┌────────────────────────────┐
        │   FRONTEND LAYER            │
        │ (React 19 + TypeScript)     │
        │ - Vite (build tool)         │
        │ - React Router 7            │
        │ - Zustand (state)           │
        │ - Tailwind CSS              │
        └────────────────┬────────────┘
                         │
        ┌────────────────┴────────────────────┐
        │                                     │
        ↓                                     ↓
┌──────────────────┐                ┌──────────────────┐
│  AUTHENTICATION  │                │  PAYMENTS API    │
│  (Supabase Auth) │                │  (Razorpay)      │
│  + OTP (Twilio)  │                │  (Vercel Edge)   │
└──────────────────┘                └──────────────────┘
        │                                     │
        └────────────────┬────────────────────┘
                         │
                         ↓
        ┌────────────────────────────┐
        │   BACKEND API               │
        │ (Node.js on Render)         │
        │ - Express.js                │
        │ - Payment webhooks          │
        │ - Email service             │
        │ - Notifications             │
        └────────────────┬────────────┘
                         │
                         ↓
        ┌────────────────────────────┐
        │   DATABASE & SERVICES       │
        │ - Supabase (PostgreSQL)     │
        │ - Leaflet + OpenStreetMap   │
        │ - RazorPay Gateway          │
        │ - Twilio (SMS/OTP)          │
        │ - Resend (Email)            │
        │ - Firebase (Push Notif)     │
        └────────────────────────────┘
```

---

# 📦 COMPLETE TECHNOLOGY STACK

## **Frontend Technologies**

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.0.0 | UI library |
| **TypeScript** | 5.7.2 | Type safety |
| **Vite** | 6.0.3 | Fast build tool |
| **React Router** | 7.13.1 | Navigation/routing |
| **Tailwind CSS** | 3.4.16 | Styling |
| **Zustand** | 5.0.3 | State management |
| **Axios** | 1.7.9 | HTTP requests |
| **Lucide React** | 0.475.0 | Icons |
| **SweetAlert2** | 11.26.21 | Beautiful alerts |
| **Framer Motion** | 12.34.3 | Animations |

## **Mobile-Specific**

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Capacitor Core** | 8.1.0 | Native bridge |
| **Capacitor Android** | 8.1.0 | Android runtime |
| **Capacitor Geolocation** | 8.1.0 | GPS location |
| **Capacitor Camera** | 8.0.1 | Camera access |

## **Maps & Location**

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Leaflet** | 1.9.4 | Open-source map library (FREE) |
| **React Leaflet** | 5.0.0 | React wrapper for Leaflet |
| **OpenStreetMap** | Latest | Free tile provider (no API key needed) |

## **Payment & Billing**

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Razorpay** | 2.9.6 | Payment gateway (primary) |
| **Stripe** | 20.4.0 | Payment gateway (backup) |
| **QRCode** | 1.5.4 | Generate QR for payments |
| **JSBarcode** | 3.12.3 | Barcode generation |

## **Communications**

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Twilio** | 5.12.2 | SMS/OTP/WhatsApp |
| **Resend** | Latest | Transactional emails |

## **Other Libraries**

| Technology | Version | Purpose |
|-----------|---------|---------|
| **PDF Generation** | jspdf 4.2.0 | Receipt generation |
| **Video Player** | video.js 8.23.7 | Live stream playback |
| **Charts** | recharts 2.15.0 | Dashboard analytics |
| **QR Scanner** | react-qr-barcode-scanner 2.1.23 | Scan payments |

---

# 🗄️ BACKEND ARCHITECTURE

## **Backend Server (Node.js)**

**Language:** Node.js  
**Framework:** Express.js  
**Hosting:** Render.com  
**Environment:** Production & Development  

### **Key Modules:**

1. **Authentication APIs**
   - `/api/auth/login` - User login
   - `/api/auth/register` - User registration
   - `/api/auth/refresh` - Token refresh

2. **Payment APIs**
   - `/api/v1/payments/createOrder` - Create Razorpay order
   - `/api/v1/payments/verifyPayment` - Verify payment
   - `/api/v1/payments/webhook` - Razorpay webhook receiver

3. **OTP APIs**
   - `/api/v1/otp/send` - Send OTP via Twilio
   - `/api/v1/otp/verify` - Verify OTP

4. **Email Service**
   - Send payment receipts
   - Send notifications
   - Payment confirmations

---

# 💾 DATABASE SCHEMA (PostgreSQL via Supabase)

## **Core Tables:**

### 1. **Profiles Table** (Users)
```sql
- id (UUID)
- email (email)
- phone (varchar)
- role (SUPER_ADMIN | ADMIN | PARENT)
- full_name (text)
- password (hashed)
- preferences (JSONB) - {sms, push, email}
- created_at (timestamp)
```

### 2. **Routes Table** (Bus Routes)
```sql
- id (UUID)
- code (varchar) - R-xxxxxx
- name (text)
- base_fee (decimal)
- distance_km (integer)
- status (active | inactive)
- created_by (UUID)
- created_at (timestamp)
```

### 3. **Buses Table**
```sql
- id (UUID)
- route_id (UUID) - References routes
- registration_number (varchar)
- capacity (integer)
- status (idle | active | maintenance)
- driver_name (text)
- driver_phone (varchar)
- created_at (timestamp)
```

### 4. **Bus Locations Table** (Real-time tracking)
```sql
- id (UUID)
- bus_id (UUID) - References buses
- latitude (decimal)
- longitude (decimal)
- speed (decimal)
- last_updated (timestamp)
- status (in_transit | idle)
```

### 5. **Students Table**
```sql
- id (UUID)
- full_name (text)
- admission_number (varchar)
- grade (varchar)
- section (varchar)
- parent_id (UUID) - References profiles
- bus_id (UUID) - References buses
- route_id (UUID) - References routes
- boarding_point (UUID) - References boarding_points
- status (active | inactive)
- created_at (timestamp)
```

### 6. **Boarding Points Table** (Bus stops)
```sql
- id (UUID)
- route_id (UUID) - References routes
- name (text)
- sequence_order (integer)
- latitude (decimal)
- longitude (decimal)
- address (text)
```

### 7. **Monthly Dues Table** (Billing)
```sql
- id (UUID)
- student_id (UUID) - References students
- parent_id (UUID) - References profiles
- month (integer) 1-12
- year (integer)
- amount (decimal)
- total_due (decimal)
- status (PENDING | PAID | OVERDUE | PARTIAL)
- fine_per_day (decimal)
- fine_after_days (integer)
- due_date (date)
- paid_at (timestamp)
- transaction_id (varchar) - Razorpay ID
- payment_method (ONLINE | CASH | CHECK)
```

### 8. **Payments Table** (Transaction records)
```sql
- id (UUID)
- student_id (UUID)
- parent_id (UUID)
- razorpay_order_id (varchar)
- razorpay_payment_id (varchar)
- amount (decimal)
- status (pending | captured | overdue | failed)
- payment_date (timestamp)
- notes (text)
```

### 9. **Receipts Table** (Payment proof)
```sql
- id (UUID)
- payment_id (UUID) - References payments
- transaction_id (varchar)
- receipt_number (varchar)
- receipt_url (text)
- generated_at (timestamp)
```

### 10. **Attendance Table** (Daily tracking)
```sql
- id (UUID)
- student_id (UUID)
- attendance_date (date)
- type (PICKUP | DROP)
- time (time)
- status (present | absent)
- notes (text)
```

### 11. **Notifications Table**
```sql
- id (UUID)
- user_id (UUID)
- title (text)
- message (text)
- type (INFO | SUCCESS | WARNING | DANGER)
- is_read (boolean)
- created_at (timestamp)
```

### 12. **OTP Logs Table**
```sql
- id (UUID)
- user_id (UUID)
- phone (varchar)
- otp_code (varchar)
- is_verified (boolean)
- expires_at (timestamp)
- created_at (timestamp)
- verified_at (timestamp)
```

### 13. **Audit Logs Table** (Admin activity tracking)
```sql
- id (UUID)
- user_id (UUID)
- action (text)
- table_name (varchar)
- record_id (UUID)
- old_data (JSONB)
- new_data (JSONB)
- created_at (timestamp)
```

---

# 🔐 AUTHENTICATION FLOW

```
1. Parent/Admin enters email + password
                    ↓
2. Frontend sends credentials to Backend
                    ↓
3. Backend validates with Supabase
                    ↓
4. If OTP needed: Backend calls Twilio → SMS sent
                    ↓
5. Parent/Admin enters OTP
                    ↓
6. Backend verifies OTP with Twilio
                    ↓
7. Supabase creates JWT token
                    ↓
8. Frontend stores token in Zustand
                    ↓
9. All future requests include JWT
                    ↓
10. User logged in ✅
```

---

# 💳 PAYMENT FLOW

```
1. Parent clicks "Pay Fee"
                    ↓
2. Shows fee amount + due date
                    ↓
3. Parent clicks "Pay Now"
                    ↓
4. Frontend sends to Backend: /api/v1/payments/createOrder
                    ↓
5. Backend calls Razorpay API
                    ↓
6. Razorpay returns Order ID
                    ↓
7. Frontend opens Razorpay payment modal
                    ↓
8. Parent enters card/UPI/wallet details
                    ↓
9. Bank processes payment
                    ↓
10. Razorpay sends webhook to Backend
                    ↓
11. Backend verifies signature
                    ↓
12. Backend updates Monthly_Dues status = PAID
                    ↓
13. Backend creates Receipt & Audit Log
                    ↓
14. Backend sends email receipt via Resend
                    ↓
15. Backend sends SMS confirmation via Twilio
                    ↓
16. Frontend shows "Payment Successful" ✅
```

---

# 📍 LOCATION TRACKING FLOW

```
1. Bus has GPS device (Android phone/tracker)
                    ↓
2. Device location captured via Capacitor Geolocation
                    ↓
3. Location sent to Backend API every 30 seconds
                    ↓
4. Backend stores in bus_locations table (real-time)
                    ↓
5. Parents open app... Frontend requests /api/buses/locations
                    ↓
6. Backend returns latest bus coordinates
                    ↓
7. Frontend displays on Leaflet + OpenStreetMap (FREE)
                    ↓
8. Parents see "Bus is 2 km away, arriving in 5 min" ✅
```

---

# 🔔 NOTIFICATION SYSTEM

### **Push Notifications** (Firebase)
- Auto-sent when bus is near pickup point
- Payment reminders when fee due

### **SMS Notifications** (Twilio)
- OTP for login
- Payment confirmation
- Attendance alerts

### **Email Notifications** (Resend)
- Payment receipts
- Monthly statements
- Overdue notices

### **In-App Notifications**
- Stored in notifications table
- Displayed in parent dashboard

---

# 🚀 DEPLOYMENT ARCHITECTURE

## **Frontend Deployment (Vercel)**

```
GitHub Repo
    ↓
Vercel watches main branch
    ↓
npm run build (TypeScript check + Vite bundle)
    ↓
React app deployed to global CDN
    ↓
Live at: https://busway-pro.vercel.app
```

**Benefits:**
- Auto-deploys on code push
- Global CDN (fast worldwide)
- SSL certificate included
- Free tier available

---

## **Backend Deployment (Render.com)**

```
Backend code on Render
    ↓
npm start (starts Express server)
    ↓
Listens on port 3000
    ↓
Live at: https://busway-backend-9maw.onrender.com
```

**Environment Variables on Render:**
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- RESEND_API_KEY

---

## **Database Deployment (Supabase - PostgreSQL)**

```
Supabase Cloud
    ↓
PostgreSQL database
    ↓
Auto-backups every day
    ↓
Accessible from Frontend + Backend
    ↓
Database URL: https://xxxxx.supabase.co
```

---

## **Android App Deployment (Play Store)**

```
Source Code (React Native via Capacitor)
    ↓
Build APK/AAB (Gradle)
    ↓
Sign with keystore (buswaypro-upload-key.jks)
    ↓
Upload to Google Play Console
    ↓
Google reviews (1-3 days)
    ↓
Live on Play Store
    ↓
Users download .apk file
```

---

# 🌍 ALL EXTERNAL SERVICES INTEGRATED

| Service | Purpose | Pricing | Status |
|---------|---------|---------|--------|
| **Supabase** | Database + Auth | Free (500MB) | ✅ Active |
| **Vercel** | Frontend hosting | Free | ✅ Active |
| **Render** | Backend hosting | Free tier / Paid | ✅ Active |
| **Razorpay** | Payments | 2% per transaction | ✅ Integrated |
| **Twilio** | SMS/OTP | ₹3-4 per SMS | ✅ Integrated |
| **Leaflet** | Maps (Open-source) | **FREE** | ✅ Using |
| **OpenStreetMap** | Tile provider | **FREE** | ✅ Using |
| **Resend** | Email sending | Free (100/day) | ✅ Integrated |
| **Firebase** | Push notifications | Free | ✅ Ready |

---

# 📁 PROJECT FILE STRUCTURE

```
busway-pro/
├── src/
│   ├── App.tsx                 # Root component
│   ├── index.tsx               # Entry point
│   ├── types.ts                # TypeScript interfaces
│   ├── constants.ts            # App constants
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── ParentDashboard.tsx
│   │   ├── Payments.tsx
│   │   ├── LiveTracking.tsx
│   │   ├── Attendance.tsx
│   │   ├── StudentProfile.tsx
│   │   └── parent/
│   │       ├── FeeHistory.tsx
│   │       ├── StudentProfile.tsx
│   │       ├── Notifications.tsx
│   │       └── Support.tsx
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── PaymentPortal.tsx
│   │   ├── GoogleMap.tsx
│   │   ├── Admin/
│   │   │   ├── StudentManagement.tsx
│   │   │   ├── BusManagement.tsx
│   │   │   └── RouteManagement.tsx
│   │   ├── Payment/
│   │   │   ├── BarcodeScanner.tsx
│   │   │   └── PaymentForm.tsx
│   │   └── Location/
│   │       └── BoardingLocationPicker.tsx
│   ├── hooks/
│   │   ├── useStudents.ts      # Fetch students
│   │   ├── useFees.ts          # Fetch fees
│   │   ├── usePayments.ts      # Payment logic
│   │   ├── useTracking.ts      # Location tracking
│   │   ├── useAttendance.ts    # Attendance data
│   │   └── useAdmin.ts         # Admin functions
│   ├── store/
│   │   ├── authStore.ts        # Auth state (Zustand)
│   │   └── loadingStore.ts     # Loading state
│   ├── lib/
│   │   ├── api.ts              # Axios config
│   │   ├── supabase.ts         # Supabase client
│   │   ├── razorpay.ts         # Razorpay logic
│   │   ├── firebase.ts         # Firebase config
│   │   └── swal.ts             # Alert helpers
│   ├── services/
│   │   ├── otpService.ts       # OTP logic
│   │   ├── cameraService.js    # Camera access
│   │   └── feeManagement.service.ts
│   └── utils/
│       ├── feeCalculator.ts
│       └── notificationMessage.ts
├── api/
│   └── v1/
│       ├── otp/
│       │   ├── send.ts         # Send OTP
│       │   └── verify.ts       # Verify OTP
│       └── payments/
│           ├── createOrder.ts  # Create Razorpay order
│           ├── verifyPayment.ts # Verify payment
│           └── webhook.ts      # Razorpay webhook
├── android/
│   ├── app/
│   │   └── build.gradle        # Android build config
│   ├── buswaypro-upload-key.jks # Signing keystore
│   └── keystore.properties     # Signing credentials
├── public/
│   ├── index.html
│   ├── favicon.svg
│   ├── manifest.json           # PWA manifest
│   └── service-worker.js       # Offline support
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite config
├── capacitor.config.ts         # Capacitor config
└── tailwind.config.js          # Tailwind CSS config
```

---

# 🔄 USER FLOWS

## **Parent User Flow**

```
1. Download from Play Store
2. Install app
3. Launch app
4. Register with email/phone
5. Receive OTP via SMS (Twilio)
6. Verify OTP
7. Create password
8. Dashboard loads → See child and fees
9. Click "See Bus Location"
10. Live tracking shows on Leaflet map
11. See estimated arrival time
12. View attendance history
13. Click "Pay Fee"
14. Razorpay payment modal opens
15. Complete payment
16. Receive SMS confirmation
17. Download receipt as PDF
18. Email receipt also sent
19. Dashboard shows "Payment: PAID"
```

---

## **Admin User Flow**

```
1. Go to dashboard website
2. Login with email/password
3. Dashboard shows all buses, routes, students
4. See real-time bus locations on map
5. Can manage students (add/edit/delete)
6. Can manage routes
7. Can view all payments
8. Can send notifications to parents
9. Generate reports (PDF/Excel)
10. View audit logs
```

---

# 🛡️ SECURITY FEATURES

✅ JWT tokens for API authentication  
✅ Supabase row-level security (RLS)  
✅ Encrypted passwords (bcrypt)  
✅ HTTPS everywhere (SSL)  
✅ OTP verification for sensitive operations  
✅ Razorpay signature verification  
✅ CORS protection  
✅ Rate limiting  
✅ Audit logging for all admin actions  

---

# 📊 KEY METRICS & ANALYTICS

- Active students & parents
- Payment success rates
- Average fee collection time
- Bus location update frequency
- User engagement metrics
- System uptime

---

# 🚨 ERROR HANDLING

- Frontend validation (TypeScript + Zod)
- Backend validation (Node.js)
- Graceful error messages
- Automatic retry logic
- Error logging & monitoring
- User-friendly alerts (SweetAlert2)

---

# 🔧 DEVELOPMENT & DEPLOYMENT WORKFLOW

```
Local Development:
npm run dev → Vite dev server on localhost:5173

Building:
npm run build → TypeScript check + Vite bundle

Type Checking:
npm run lint → tsc --noEmit

Android Build:
npm run android:bundle → Build signed AAB

Deployment:
- Frontend: Push to GitHub → Auto-deploy to Vercel
- Backend: Push code → Render auto-redeploys
- Database: Supabase auto-backs up daily
```

---

# 📱 FEATURES CHECKLIST

- [x] User authentication (email/password + OTP)
- [x] Parent dashboard
- [x] Admin dashboard
- [x] Real-time bus tracking (GPS)
- [x] Student attendance tracking
- [x] Fee management & payments
- [x] Online payment (Razorpay)
- [x] Payment receipts (PDF generation)
- [x] Notifications (push/SMS/email)
- [x] QR code scanning for payments
- [x] Multi-language support (optional)
- [x] Dark mode (optional)
- [x] Offline support (PWA)
- [x] Report generation
- [x] Audit logging

---

# 🎓 HOW TO EXPLAIN TO CLIENTS

## **Simple Version**

> "BusWay Pro is like WhatsApp + Google Maps + Bank combined for school bus management."
>
> **Parent perspective:** See bus in real-time + pay fees online
>
> **School perspective:** Manage buses, collect fees, track students
>
> **Technical perspective:** Full-stack app with cloud database, online payments, real-time location, SMS/email notifications

---

## **Technical Version For CTO/Tech Person**

> "We've built a React 19 TypeScript app with Capacitor for Android. Frontend hosted on Vercel with global CDN, backend on Render with Express.js. Database is Supabase (PostgreSQL). Payments through Razorpay (2% fees), SMS via Twilio, email via Resend. Maps using Leaflet + OpenStreetMap (completely free). State managed with Zustand. Styling with Tailwind. Everything is containerized and deployed to cloud with auto-scaling."

---

## **Business Version For Client/Investor**

> "BusWay Pro automates school bus operations. Parents can track their child's bus in real-time and pay fees online securely. Schools can manage routes, buses, students, and collect payments automatically. We reduce manual work, increase payment collection rate, and improve parent satisfaction. The system scales as the school grows."

---

# 🎯 SUCCESS METRICS

After launch, track:
- Number of app downloads
- Daily active users
- Payment success rate (target: >95%)
- Average payment collection time
- Customer support tickets
- System uptime (target: 99.9%)

---

# 📞 SUPPORT & MAINTENANCE

- Regular backups (Supabase)
- Error monitoring & debugging
- User support email
- Bug fixes & updates
- Security patches
- Performance optimization

---

**Document Created:** March 2026  
**Last Updated:** Current Date  
**Status:** Ready for Production
