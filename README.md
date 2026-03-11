# 🚌 School Bus Fee Management System

An end-to-end, role-based platform for school transport operations — combining **fee collection**, **receipts**, **student/route management**, and **live parent notifications** in one system.

---

## ✨ Project Overview

This project helps schools manage transport services with separate experiences for:

- 👨‍💼 **Admin / Super Admin**
    - Student, bus, route and attendance operations
    - Fee policy management and waiver actions
    - Parent broadcast notifications
    - Audit-oriented payment visibility

- 👨‍👩‍👧 **Parent**
    - Dashboard, fee history, payments and receipts
    - Live notification center
    - Profile/preferences management
    - Password/account controls

---

## 🧩 Core Features

- 💳 **Payment Flow Hardening**
    - Razorpay order + verification fallback handling
    - Reliable due/payment persistence

- 🧾 **Receipt Management**
    - Receipt creation and download pathways
    - Payment-success metadata alignment

- 🔔 **Realtime Notifications**
    - Navbar alert bell powered by Supabase data
    - Parent/Admin notification focus jump from Topbar
    - Mark-read sync with database

- 📌 **Fee & Waiver Rules**
    - Dynamic overdue/late-fee logic
    - Admin waiver processing with parent notification updates

- 🛡️ **Auth & Recovery Improvements**
    - Robust forgot-password flow and fallback handling
    - Environment-aware redirect behavior

- 🖼️ **Profile Image Controls**
    - Upload + remove avatar support in settings
    - Fallback support for `preferences.avatar_url`

---

## 🏗️ Tech Stack

- ⚛️ **Frontend**: React + TypeScript + Vite + Tailwind CSS
- 🔐 **Auth / DB / Realtime**: Supabase
- 💰 **Payments**: Razorpay
- 🚀 **Frontend Hosting**: Vercel
- 🧠 **Backend/API**: Python service (Render deployment)

---

## 📁 Main Modules

- `pages/` — role-based screens (admin + parent)
- `components/` — reusable UI components
- `hooks/` — data and business logic hooks
- `lib/` — API, Supabase, telemetry, utility clients
- `backend/` — Python backend services
- `supabase/migrations/` — SQL schema updates

---

## ⚙️ Local Setup

1. Clone repository
2. Install dependencies

```bash
npm install
```

3. Configure environment variables in `.env`
4. Start dev server

```bash
npm run dev
```

5. Build production bundle

```bash
npm run build
```

---

## 🌐 Deployment Notes

### Vercel (Frontend)

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Root Directory: `./`

Required envs:

- `VITE_API_BASE_URL`
- `VITE_APP_URL`
- `VITE_AUTH_REDIRECT_URL`

### Render (Backend)

- Keep backend awake for stable auth/payment callbacks
- Configure CORS envs:
    - `FRONTEND_URL`
    - `FRONTEND_URLS`

---

## 🗃️ Database Notes

Recent migrations are in `supabase/migrations/`, including:

- fee/payment alignment
- notifications type updates
- avatar support (`profiles.avatar_url`)

---

## ✅ Production Readiness Checklist

- Supabase auth redirects match deployed URLs
- Privacy Policy + Terms URLs are publicly reachable
- Payments, receipts, and notifications tested in production mode
- Account recovery and delete-account flow verified
- Play Store release checklist completed (if mobile packaging is used)

---

## 🤝 Contributing

For internal team development:

- Use feature branches for major updates
- Run lint/build before pushing
- Add SQL migration for any DB schema change

---

## 📌 Maintainer Note

If this repository is private, only invited collaborators can access source code. Deployment with Vercel/Render continues as long as GitHub integration permissions remain enabled.
