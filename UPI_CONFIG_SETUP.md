# UPI Configuration - Quick Setup

## Problem
You're seeing: **"UPI payment is not configured yet"**

## Solution

### Step 1: Set Your UPI ID
Edit `.env.local` (just created) and replace:

```env
# BEFORE (placeholder)
VITE_UPI_ID=your-upi-id@hdfc

# AFTER (your actual UPI)
VITE_UPI_ID=yourname@hdfc        # or @axis, @icici, @upi, etc.
VITE_BUSINESS_NAME=Your School Name
```

### Step 2: Get Your UPI ID
If you don't have one yet:
1. Open Google Pay, PhonePe, or BHIM
2. Go to **Settings → Payment Methods → UPI ID**
3. Create a business UPI ID (usually: `yourname@bankname`)
4. Copy it into `.env.local`

### Step 3: Restart Dev Server

Kill the current server (Ctrl+C) and restart:

```bash
npm run dev
```

## Example Configuration

```env
# Using HDFC Bank
VITE_UPI_ID=myschool@hdfc
VITE_BUSINESS_NAME=Global School Bus Pro

# OR Google Pay UPI
VITE_UPI_ID=schoolbus@okhdfcbank
VITE_BUSINESS_NAME=School Transportation
```

## Testing

After setup:
1. Open app at http://localhost:3000/
2. Login as **Parent**
3. Go to **Fee Ledger** → **Pay Now**
4. You should see:
   - ✅ **"Pay via UPI App"** button (no error)
   - ✅ **QR Code** displayed
   - ✅ **UTR Input Form** ready

## Environment Files

- `.env.local` - **Local development (used when running `npm run dev`)**
- `.env.production` - Production Vercel deployment
- `.env.example` - Template for all variables

## Files Modified

1. `hooks/usePayments.ts` - Updated to check `VITE_UPI_ID` first
2. `.env.local` - Created with UPI configuration

---

**Need Help?**
- UPI ID format: `yourname@bankname`
- Banks: HDFC, Axis, ICICI, Kotak, IDBI, etc.
- If no UPI ID, create one in your bank's app
