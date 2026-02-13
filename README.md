
# 🚌 BusWay Pro: School Bus Fee Management System

BusWay Pro is a production-ready, full-stack solution designed for educational institutions to manage fleet operations, student registrations, and automated monthly billing.

## 🎯 Key Features

- **Sequential Payment Logic**: Prevents month-skipping (January must be paid before February).
- **Automated Late Fees**: Real-time calculation based on custom grace periods and daily rates.
- **Role-Based Portals**: Specialized dashboards for Admins, Parents, Drivers, and Teachers.
- **Live Fleet Tracking**: Real-time GPS synchronization between Drivers and Parents.
- **Digital Receipts**: Automated PDF generation with digital verification.
- **Broadcast System**: Multi-channel (SMS/Email/Push) notifications for emergencies and fee reminders.

## 🏗️ Technical Stack

- **Frontend**: React 19, Tailwind CSS, Recharts, Zustand, Vite.
- **Backend**: FastAPI (Python 3.10+), SQLAlchemy, Pydantic.
- **Database**: SQLite (Development) / PostgreSQL (Production ready).
- **Integrations**: Razorpay (Payments), Firebase (Auth/Push), FPDF2 (PDFs).

## 🚀 Deployment Guide

### **1. Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/busway-pro.git
git push -u origin main
```

### **2. Frontend Deployment (Vercel/Netlify)**
- Connect your GitHub repository.
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**: 
  - `VITE_API_URL`: Your backend API URL (e.g., `https://api.yourdomain.com/api/v1`)

### **3. Backend Deployment (Render/Railway/Docker)**
- Connect your GitHub repository.
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 8000`
- **Environment Variables**:
  - `DATABASE_URL`: Your PostgreSQL connection string.
  - `SECRET_KEY`: A secure random string for JWT.
  - `RAZORPAY_KEY_ID`: Your Razorpay Test/Live Key.
  - `RAZORPAY_KEY_SECRET`: Your Razorpay Secret.

## 🛠️ Local Development

### **Backend**
```bash
# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn main:app --reload
```

### **Frontend**
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## 🔐 Credentials (Development Mode)
- **Admin**: `admin@school.com` / `admin123`
- **Parent**: Admission ID `1001` (OTP is bypassed in mock mode)

## 📄 License
MIT License. Created for educational and enterprise transportation management.
