# Vercel Function Optimization Plan

## 🚨 CRITICAL ISSUE DISCOVERED

Your project has **14 Serverless Functions**, but Vercel Hobby plan allows **only 12**.

```
❌ CURRENT STATE: 14 functions (EXCEEDS QUOTA)
api/v1/users/delete.ts                    ← Can move to Render
api/v1/payments/webhook.ts                ✅ KEEP (webhook only)
api/v1/payments/verifyPayment.ts          ← Can move to Render
api/v1/payments/verifyEasebuzz.ts         ← Can move to Render
api/v1/payments/health.ts                 ← Can move to Render
api/v1/payments/easebuzzInitiate.ts       ← Can move to Render
api/v1/payments/createOrder.ts            ← Can move to Render
api/v1/otp/verify.ts                      ✅ KEEP (auth flow)
api/v1/otp/send.ts                        ✅ KEEP (auth flow)
api/v1/otp/reset-password.ts              ✅ KEEP (critical)
api/v1/auth/refresh.ts                    ✅ KEEP (auth flow)
api/v1/auth/login.ts                      ✅ KEEP (critical)
api/otp/send.ts                           ❌ DUPLICATE (delete)
api/otp/reset-password.ts                 ❌ DUPLICATE (delete)

⚠️ PLUS Payment Settings (would add more!)
```

---

## ✅ SOLUTION: Optimize to 6 Functions

### **Step 1: Delete Duplicate Functions**

These exist in TWO places - keep v1 version only:

```bash
# DELETE these duplicates:
api/otp/send.ts            ← Remove (duplicate of api/v1/otp/send.ts)
api/otp/reset-password.ts  ← Remove (duplicate of api/v1/otp/reset-password.ts)
```

**New count: 12 functions**

---

### **Step 2: Move Payment Functions to Render Backend**

These should be on Render (where they belong) instead of Vercel:

```
MOVE TO RENDER BACKEND:
├─ api/v1/payments/verifyPayment.ts     → POST /api/v1/payments/verify
├─ api/v1/payments/verifyEasebuzz.ts    → POST /api/v1/payments/verify-easebuzz
├─ api/v1/payments/easebuzzInitiate.ts  → POST /api/v1/payments/easebuzz-initiate
├─ api/v1/payments/createOrder.ts       → POST /api/v1/payments/create-order
├─ api/v1/payments/health.ts            → GET /health
└─ api/v1/users/delete.ts               → DELETE /api/v1/users/{id}
```

**Why?**
- ✅ Backend already handles payment logic
- ✅ These are complex operations (not webhooks)
- ✅ Reduces Vercel function count to 6
- ✅ Centralized business logic on one platform
- ✅ No additional latency (both are fast)

**New count: 6 functions** (well under 12 limit!)

---

### **Step 3: Keep Critical Functions on Vercel**

These MUST stay on Vercel:

```
KEEP ON VERCEL (6 functions):
├─ 1. api/v1/auth/login.ts        (required for auth flow)
├─ 2. api/v1/auth/refresh.ts      (JWT refresh token)
├─ 3. api/v1/otp/send.ts          (OTP generation - SMS)
├─ 4. api/v1/otp/verify.ts        (OTP validation)
├─ 5. api/v1/otp/reset-password.ts (password reset)
└─ 6. api/v1/payments/webhook.ts  (Stripe/PayU webhook only)
```

**Why these stay:**
- ✅ Authentication critical path
- ✅ Stripe/PayU webhooks MUST be fast
- ✅ OTP needs to be ultra-responsive
- ✅ All are lightweight operations

**New count: 6 functions** ✅ SAFE!

---

### **Step 4: Add Payment Settings (NO NEW FUNCTIONS)**

```
Payment Settings:
├─ FRONTEND (Vercel React)    ✅ pages/PaymentSettings.tsx
│                              NO serverless function needed!
│                              Reads Supabase directly (JWT auth)
│
├─ BACKEND (Render API)       ✅ Already has /api/admin/settings
│                              If needed, add there (not Vercel)
│
└─ DATABASE (Supabase)        ✅ payment_settings table
                              RLS policies enforce security
```

**New count: 6 functions + Payment Settings = STILL 6!** ✅

---

## 🛠️ Implementation Steps

### **PHASE 1: Delete Duplicates (2 mins)**

```bash
# Remove duplicate OTP files
rm -r api/otp/
```

**After:** 12 functions (still over limit)

---

### **PHASE 2: Move Payments to Render (10 mins)**

**Option A: Keep Render Backend as Proxy**
```bash
# Keep these files in Vercel but have them proxy to Render
# /api/v1/payments/verify → calls POST busway-backend.render.com/api/payments/verify
```

**Option B: Delete from Vercel (Recommended)**
```bash
# Delete payment functions from Vercel
rm api/v1/payments/verifyPayment.ts
rm api/v1/payments/verifyEasebuzz.ts
rm api/v1/payments/easebuzzInitiate.ts
rm api/v1/payments/createOrder.ts
rm api/v1/payments/health.ts

# Update frontend to call Render backend directly
# VITE_API_BASE_URL already points to Render!
```

**After:** 6 functions (SAFE! ✅)

---

### **PHASE 3: Add Render Backend Endpoints**

```python
# backend/routes/payments.py (Render)

@app.post('/api/v1/payments/verify')
def verify_payment():
    # Verify payment status
    
@app.post('/api/v1/payments/verify-easebuzz')
def verify_easebuzz():
    # Verify Easebuzz payment

@app.post('/api/v1/payments/create-order')
def create_order():
    # Create payment order

@app.post('/api/v1/payments/easebuzz-initiate')
def easebuzz_initiate():
    # Initiate Easebuzz

@app.delete('/api/v1/users/{user_id}')
def delete_user(user_id):
    # Delete user (caution!)

@app.get('/health')
def health():
    # Backend health
```

**These are regular API endpoints, NOT serverless functions!**

---

### **PHASE 4: Deploy & Verify**

```bash
# 1. Delete from Vercel
rm -r api/otp/
rm api/v1/payments/verifyPayment.ts
rm api/v1/payments/verifyEasebuzz.ts
rm api/v1/payments/createOrder.ts
rm api/v1/payments/easebuzzInitiate.ts
rm api/v1/payments/health.ts

# 2. Deploy to Vercel
vercel deploy --prod

# 3. Check function count (should be 6)
vercel inspect

# 4. Update frontend to use Render endpoints
# Already configured in config/env.ts!
# VITE_API_BASE_URL = https://busway-backend.render.com
```

---

## 📊 Before vs After

### BEFORE (Exceeds Quota)
```
Vercel Functions: 14 out of 12
┌─────────────────┐
├─ auth (2)       │  ✅
├─ otp (4)        │  ⚠️ 2 duplicates
├─ payments (5)   │  ❌ Should be on Render
├─ users (1)      │  ❌ Should be on Render
└─ TOTAL: 14      │  ❌ EXCEEDS 12!
└─────────────────┘
Status: 🚨 ERROR - Can't deploy!
```

### AFTER (Optimized)
```
Vercel Functions: 6 out of 12
┌──────────────────────┐
├─ auth/login          │  ✅ Essential
├─ auth/refresh        │  ✅ Essential
├─ otp/send            │  ✅ Essential
├─ otp/verify          │  ✅ Essential
├─ otp/reset-password  │  ✅ Essential
├─ payments/webhook    │  ✅ Critical
└─ TOTAL: 6            │  ✅ SAFE!
└──────────────────────┘
Available: 6 more slots ✅

Render Backend Functions (Unlimited)
├─ payments/verify
├─ payments/verify-easebuzz
├─ payments/easebuzz-initiate
├─ payments/create-order
├─ users/delete
└─ health

Payment Settings
├─ Frontend: pages/PaymentSettings.tsx (NO function)
├─ Backend: already on Render
├─ Database: Supabase table + RLS
└─ Total new functions: 0

Status: ✅ READY FOR PRODUCTION!
```

---

## 🔄 Frontend Updates Needed

### Current Config (Already Correct!)
```typescript
// config/env.ts
export const ENV = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,  // ← Points to Render!
};
```

### Current Usage (Already Fixed!)
```typescript
// lib/api.ts
const axiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,  // ← Uses Render backend!
});

// So these calls already go to Render:
// axios.post('/payments/initiate')
// axios.post('/payments/verify')
// axios.get('/users/me')
```

**Good news: Frontend is ALREADY configured to use Render backend!** No changes needed!

---

## ⚠️ What Needs Moving

Only these Vercel serverless functions need to move:

```javascript
// These 5 files should NOT be in /api/ on Vercel
1. api/v1/payments/verifyPayment.ts      ← Move to Render
2. api/v1/payments/verifyEasebuzz.ts     ← Move to Render
3. api/v1/payments/easebuzzInitiate.ts   ← Move to Render
4. api/v1/payments/createOrder.ts        ← Move to Render
5. api/v1/users/delete.ts                ← Move to Render
6. api/v1/payments/health.ts             ← Move to Render
7. api/otp/send.ts                       ← DELETE (duplicate)
8. api/otp/reset-password.ts             ← DELETE (duplicate)
```

**Keep on Vercel (DO NOT MOVE):**
```
1. api/v1/auth/login.ts                  ← Critical path
2. api/v1/auth/refresh.ts                ← Token refresh
3. api/v1/otp/send.ts                    ← SMS dispatcher (keep v1)
4. api/v1/otp/verify.ts                  ← OTP validator
5. api/v1/otp/reset-password.ts          ← Password reset (keep v1)
6. api/v1/payments/webhook.ts            ← Payment webhook (critical)
```

---

## ✅ Deployment Checklist

- [ ] Verify Render backend is running on https://busway-backend.render.com
- [ ] Check Render has endpoints for moved functions
- [ ] Delete duplicate files: api/otp/ (old one)
- [ ] Delete moved files from api/v1/payments/ (all except webhook.ts)
- [ ] Delete moved files: api/v1/users/delete.ts
- [ ] Run `npm run build` locally (should succeed)
- [ ] Run `vercel inspect` (should show ≤6 functions)
- [ ] Deploy: `vercel deploy --prod`
- [ ] Test login flow (uses 4 Vercel functions)
- [ ] Test payment webhook (uses 1 Vercel function)
- [ ] Verify payment flow calls Render backend
- [ ] Verify Payment Settings works (no new functions)

---

## 🎯 Summary

| Step | Action | Functions | Status |
|------|--------|-----------|--------|
| **Current** | 14 functions deployed | 14/12 | ❌ Over quota |
| **Delete Dupes** | Remove api/otp/ | 12/12 | ⚠️ At limit |
| **Move to Render** | Remove 5 payment+user functions | 6/12 | ✅ Safe! |
| **Final** | Add Payment Settings | 6/12 | ✅ Ready! |

---

**Next: I'll delete duplicates and move payment functions to optimize your deployment!**
