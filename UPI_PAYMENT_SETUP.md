# UPI Payment Integration - Setup Guide

## Overview
The app now includes a dedicated UPI payment flow for Fee History. When parents click "Pay Now" on a fee, they'll see a streamlined UPI payment interface with:

✅ **UPI App Payment** - Direct payment through Google Pay, PhonePe, BHIM, Paytm  
✅ **QR Code** - Scan-to-pay alternative  
✅ **UTR Verification** - Manual transaction ID entry with screenshot upload  
✅ **Supabase Integration** - Automatic payment record creation  
✅ **Mobile-First Design** - Optimized for all screen sizes  

---

## Environment Variables

### Required (Add to .env.production)

```env
# UPI Configuration
VITE_UPI_ID=your-upi-id@bank
VITE_BUSINESS_NAME=SchoolBusWay
```

**Example:**
```env
VITE_UPI_ID=schoolbus@hdfc
VITE_BUSINESS_NAME=Global Fleet School Bus Pro
```

### Optional Admin QR Code (for manual scans)
```env
VITE_ADMIN_PAYMENT_QR_URL=https://your-cdn.com/qr.png
VITE_ADMIN_UPI_ID=admin-upi@bank
```

---

## Database Schema

The implementation uses the existing `payments` table with these additions:

```sql
-- New columns (if not exists):
ALTER TABLE payments ADD COLUMN IF NOT EXISTS utr VARCHAR(50) UNIQUE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS screenshot_url TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'upi';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_utr ON payments(utr);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(payment_method);
```

---

## Features

### 1. **UPI Link Generation**
Dynamically creates UPI links with payment details:
```
upi://pay?pa=UPI_ID&pn=BUSINESS_NAME&am=AMOUNT&cu=INR&tn=Bus%20Fee%20StudentName
```

### 2. **QR Code Generation**
- Uses `qrcode` library (already installed)
- High error correction (Level H)
- 300x300px size, rendered dynamically
- Cached in component state

### 3. **UTR Verification**
- Minimum 12 characters validation
- Duplicate UTR check against Supabase
- Optional screenshot upload
- Screenshots stored in `receipts` bucket

### 4. **Success Handling**
- Shows confirmation message: "Payment submitted successfully. Awaiting verification."
- Record stored with status: `pending`
- Admin can verify and mark as `captured`

---

## File Structure

```
components/
├── PaymentPortal.tsx        ← Updated (now uses UpiPaymentFlow only)
└── Payment/
    └── UpiPaymentFlow.tsx   ← NEW: Handles entire UPI flow

pages/
└── parent/
    └── FeeHistory.tsx       ← Updated (passes user prop to PaymentPortal)

.env.example                 ← Updated with UPI variables
.env.production             ← Updated with UPI variables
vite-env.d.ts              ← Updated with type definitions
```

---

## How It Works

### User Flow
1. Parent clicks **"Pay Now"** on an unpaid fee
2. PaymentPortal opens with summary
3. **UpiPaymentFlow** component renders with:
   - **Button:** "Pay via UPI App" (opens UPI intent)
   - **OR Divider**
   - **QR Code:** Scan to pay
   - **Instructions:** Step-by-step guide
   - **UTR Form:** Enter transaction ID
   - **Submit:** Saves to database with `status: pending`

### Backend Process
1. UTR record created in `payments` table
2. Status: `pending` (awaiting admin verification)
3. Admin verifies payment in bank
4. Admin updates status to `captured` in database
5. Receipt generated and parent notified

### Success Message
After submitting UTR:
```
✓ Payment submitted successfully. 
  Awaiting verification from admin
```

---

## Configuration

### Redirect After Payment
Payment automatically closes when:
- Admin verifies in dashboard
- Frontend detects status change via real-time Supabase listener

### Upload Limits
- Screenshot: Max 5MB
- Formats: PNG, JPG

### Payment Record Structure
```json
{
  "user_id": "parent_uuid",
  "student_id": "student_uuid",
  "amount": 5000,
  "utr": "518003721843",
  "screenshot_url": "https://cdn.supabase.co/...",
  "status": "pending",
  "payment_method": "upi",
  "created_at": "2026-04-24T10:30:00Z"
}
```

---

## Testing

### Local Testing
1. Create a test UPI ID (or use `test@airtelpaymentsbank`)
2. Set `VITE_UPI_ID` in `.env.local`
3. Run `npm run dev`
4. Navigate to **Payments → Fee History → Pay Now**
5. Click UPI button (will try to open UPI app/error on desktop is expected)
6. Enter test UTR: `123456789012`
7. Submit and verify in Supabase

### QR Code Testing
- QR should display static code
- Test with phone camera/QR scanner
- Should open UPI URL when scanned

---

## Security & Compliance

✅ **SSL/TLS**: All transactions encrypted  
✅ **Duplicate Prevention**: UTR uniqueness enforced  
✅ **Audit Trail**: All payments logged with timestamps  
✅ **Manual Verification**: Admin confirms before marking as "captured"  
✅ **Screenshot Evidence**: Optional proof attached  

---

## Admin Verification (Backend Task)

After UTR submission:

1. Check payment in bank/UPI provider dashboard
2. Verify amount matches
3. Update Supabase:

```sql
UPDATE payments 
SET status = 'captured', 
    verified_at = NOW(),
    verified_by = 'admin_id'
WHERE utr = '518003721843';
```

4. System auto-sends confirmation to parent

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| QR not displaying | Check VITE_UPI_ID is set in env |
| Can't submit UTR | UTR must be ≥12 characters |
| Duplicate UTR error | Use unique transaction ID |
| Screenshot upload fails | Check file < 5MB, format PNG/JPG |
| Payment not showing | Wait for real-time sync, refresh page |

---

## Features Not Included (Optional Enhancements)

- ❌ Automatic payment confirmation (requires bank API integration)
- ❌ SMS notification on submission (can be added)
- ❌ Scheduled verification emails (admin task)
- ❌ Refund processing (separate workflow)

---

## Rollback

If issues occur, revert to `git checkout -- components/PaymentPortal.tsx components/Payment/UpiPaymentFlow.tsx`

---

**Last Updated:** April 24, 2026  
**Version:** 1.0.0  
**Status:** Production Ready
