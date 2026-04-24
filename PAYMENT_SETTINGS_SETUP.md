# Payment Settings Database Setup

This file contains the SQL migration to set up the `payment_settings` table in Supabase.

## Option 1: Run in Supabase SQL Editor

1. Go to **Supabase Dashboard** → Your Project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Paste the following SQL and click **Run**:

```sql
-- Create payment_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  upi_id TEXT,
  business_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to read payment settings
CREATE POLICY "Admins can view payment settings"
  ON public.payment_settings FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
  );

-- Create policy for admins to update payment settings
CREATE POLICY "Admins can update payment settings"
  ON public.payment_settings FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
  );

-- Create policy for admins to insert payment settings
CREATE POLICY "Admins can insert payment settings"
  ON public.payment_settings FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('ADMIN', 'SUPER_ADMIN')
  );
```

## Option 2: Already in schema.sql

The table definition is already included in `schema.sql`. When you run the full schema setup, this table will be created automatically.

## How Admin Dashboard Uses It:

1. Admin logs in (role = ADMIN or SUPER_ADMIN)
2. Clicks **"Payment Settings"** tab
3. Sees UPI ID and Business Name input fields
4. Fills in settings and clicks **"Save Settings"**
5. Settings are saved to `payment_settings` table
6. When parents click "Pay via UPI", the app fetches UPI ID from database first
7. Falls back to environment variables if database settings are empty

## Testing:

After setting up the table:

```bash
# Restart dev server
npm run dev

# Login as admin@school.com / admin123
# Navigate to Payment Settings tab
# Enter your UPI ID and Business Name
# Click Save Settings
# Check Supabase > payment_settings table to confirm data was saved
```

## Troubleshooting:

**Error: "relation 'payment_settings' does not exist"**
- The table hasn't been created yet
- Run the SQL from Option 1 above

**Cannot save settings / permission denied**
- Check your Supabase RLS policies
- Make sure your admin user has the ADMIN role in the profiles table

**Settings not appearing on payment screen**
- Clear browser cache: Ctrl+Shift+Delete
- Restart dev server: npm run dev
- Check browser console for errors
