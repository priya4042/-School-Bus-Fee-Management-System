# Admin Payment Settings - Quick Usage Guide

## How It Works ✨

The UPI payment configuration is now **managed directly from the Admin Dashboard** instead of environment variables!

### Flow:
1. **Admin opens Payment Settings tab**
2. **Enters UPI ID and Business Name**
3. **Settings auto-save to database**
4. **When parents pay, they see the admin's UPI settings**

---

## Step-by-Step Setup

### Step 1: Create Database Table

**In Supabase SQL Editor:**

1. Go to https://supabase.com → Your Project
2. Click **"SQL Editor"** in left sidebar
3. Click **"New Query"**
4. Paste this SQL:

```sql
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  upi_id TEXT,
  business_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view payment settings"
  ON public.payment_settings FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('ADMIN', 'SUPER_ADMIN'));

CREATE POLICY "Admins can update payment settings"
  ON public.payment_settings FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('ADMIN', 'SUPER_ADMIN'));

CREATE POLICY "Admins can insert payment settings"
  ON public.payment_settings FOR INSERT
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('ADMIN', 'SUPER_ADMIN'));
```

5. Click **"Run"** ✅

---

### Step 2: Access from Admin Dashboard

1. **Restart dev server:**
   ```bash
   npm run dev
   ```

2. **Login as admin:**
   - Email: `admin@school.com`
   - Password: `admin123`

3. **Click "Payment Settings"** tab in sidebar
   - You should see the form with UPI ID and Business Name fields

---

### Step 3: Enter Your UPI Details

**UPI ID Format:**
```
yourname@bankname
```

**Examples:**
- `schoolbus@hdfc`
- `admin@axis`
- `busway@icici`

**Business Name Examples:**
- `SchoolBusWay`
- `Your School Name`
- `Bus Transport`

---

### Step 4: Save & Test

1. **Fill in both fields**
2. **Click "Save Settings"** button
3. **Message:** "Payment settings saved successfully" ✅

---

## Verify It Works

**In Supabase:**
1. Go to **Table Editor** → select **`payment_settings`**
2. You should see your UPI ID and Business Name stored ✓

**In App:**
1. **Logout** (click profile → logout)
2. **Login as parent:** Use any parent account
3. **Go to Fees tab → Click "Pay Now"**
4. **Click "Pay via UPI" button**
5. **Should generate QR code with your UPI ID** ✓

---

## UI Preview

```
┌─────────────────────────────────────┐
│ Payment Gateway Configuration        │
│ Manage UPI and Payment Settings     │
└─────────────────────────────────────┘

UPI ID
└─ [schoolbus@hdfc...................]

Business Name
└─ [SchoolBusWay...................]

Last updated: Apr 24, 2026 2:30 PM

💡 HOW TO GET UPI ID:
• Download Google Pay, PhonePe, or BHIM
• Set up a merchant account
• Format: yourname@bankname

[✓ Save Settings]  [↶ Discard Changes]

✓ Settings are saved to database & persist
✓ When parents click Pay, they see your UPI
✓ Payment request includes your business name
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **"Payment Settings" tab not visible** | Make sure you're logged in as ADMIN or SUPER_ADMIN |
| **"Table payment_settings does not exist"** | Run the SQL migration from Step 1 |
| **Can't save / Permission denied** | Check your admin role in Supabase profiles table |
| **Settings not showing when parents pay** | Clear browser cache (Ctrl+Shift+Delete), restart server |
| **Invalid UPI ID format** | Make sure format is `name@bank` (has @ symbol) |

---

## Environment Variables Still Work

Even with Payment Settings in admin panel, environment variables still work as **fallback**:

```env
VITE_UPI_ID=backup@hdfc
VITE_BUSINESS_NAME=Backup Business
```

**Priority order:**
1. Database `payment_settings` (admin panel) **← PRIMARY**
2. Environment variables **← FALLBACK**

This means:
- ✅ Admin settings override env vars
- ✅ If admin settings are empty, uses env vars
- ✅ No code changes needed to switch

---

## What Changed

### Before (Environment Variables Only):
```
Admin wanted to change UPI ID
→ Developer edits .env file
→ Redeploy app
→ Takes 5-10 minutes
❌ School admin couldn't do it themselves
```

### After (Admin Dashboard):
```
Admin wants to change UPI ID
→ Opens "Payment Settings" tab
→ Clicks "Save Settings"
→ Done instantly!
✅ School admin can do it themselves
```

---

## Files Updated

- ✅ `pages/PaymentSettings.tsx` - New admin page
- ✅ `App.tsx` - Added tab to admin navigation
- ✅ `schema.sql` - Added payment_settings table
- ✅ `hooks/usePayments.ts` - Reads from database
- ✅ Commit: `e5b284b` pushed to GitHub

---

**Next Steps:**
1. ✅ Create table in Supabase (Step 1)
2. ✅ Restart dev server`npm run dev`
3. ✅ Go to admin Dashboard → Payment Settings
4. ✅ Enter your UPI ID
5. ✅ Test parent payment flow

Happy configuring! 🎉
