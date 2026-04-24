# Multi-Cloud Architecture: Vercel + Render + Supabase

## 🎯 Problem-Solving Strategy

**Issue:** Vercel Hobby plan limited to 12 Serverless Functions  
**Solution:** Distribute workload across three platforms smartly

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        VERCEL                               │
│              (Frontend + Minimal APIs)                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ React App (App.tsx, components, pages)                │  │
│  │ Static: /privacy, /terms, /forgot-password routes     │  │
│  │ Minimal Functions: Stripe webhook (1), Auth callback   │  │
│  └───────────────────────────────────────────────────────┘  │
│                          ↓ API Calls                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                        ↓
┌──────────────────────────┐          ┌──────────────────────────┐
│      RENDER BACKEND      │          │     SUPABASE             │
│   (Node.js/Python)       │          │  (PostgreSQL Database)   │
├──────────────────────────┤          ├──────────────────────────┤
│ /api/auth/login          │          │ tables:                  │
│ /api/auth/register       │          │ ├── profiles (users)     │
│ /api/fees/*              │          │ ├── students            │
│ /api/payments/*          │          │ ├── monthly_dues        │
│ /api/admin/*             │          │ ├── payments            │
│ /health                  │          │ ├── payment_settings    │
│                          │          │ ├── receipts            │
│ Handles:                 │          │ └── audit_logs          │
│ • Business logic         │          │                        │
│ • Database queries       │          │ Features:              │
│ • Payment webhooks       │          │ • Row-Level Security   │
│ • Email/SMS logic        │          │ • Real-time subs       │
│ • File uploads           │          │ • Edge Functions*      │
│ • Admin operations       │          │ • Built-in Auth        │
│                          │          │ • 50K Edge Fn calls/mo │
└──────────────────────────┘          └──────────────────────────┘
```

---

## 🏗️ Where Each Payment Setting Lives

### **Database Layer (Supabase - Source of Truth)**
```sql
CREATE TABLE payment_settings (
  id UUID PRIMARY KEY,
  upi_id TEXT,
  business_name TEXT,
  updated_at TIMESTAMPTZ
);
```
**Pros:**
- ✅ Persistent storage
- ✅ RLS policies for security
- ✅ Real-time subscriptions
- ✅ NO serverless functions needed

---

### **Frontend (Vercel React App)**
```typescript
// pages/PaymentSettings.tsx
// Reads/writes directly to Supabase via API
// NO new serverless functions created
const PaymentSettings: React.FC = () => {
  const [settings, setSettings] = useState<PaymentConfig>({...});
  
  useEffect(() => {
    // Direct Supabase query with JWT auth
    supabase
      .from('payment_settings')
      .select('*')
      .single();
  }, []);
  
  const handleSave = async () => {
    // Direct Supabase insert/update
    supabase
      .from('payment_settings')
      .update({...});
  };
};
```

**Pros:**
- ✅ No new serverless functions
- ✅ Uses existing Supabase JWT auth
- ✅ Real-time UI updates
- ✅ Runs on CDN (fast)

---

### **Backend (Render - Business Logic)**
When Payment is initiated:
```typescript
// /api/payments/initiate (Render backend)
POST /api/payments/initiate {
  student_id,
  amount,
  due_id
}

// Backend does:
1. Fetch from Supabase (RLS protected)
   SELECT * FROM payment_settings LIMIT 1;

2. Generate UPI URL with fetched UPI ID
   upi://pay?pa=admin@hdfc&pn=SchoolBusWay...

3. Return to frontend
   {
     upi_url: "upi://pay?...",
     qr_code: "data:image/png;..."
   }
```

**Pros:**
- ✅ Uses existing Render backend
- ✅ Centralized business logic
- ✅ Secure database access
- ✅ No extra serverless functions

---

## 📈 Deployment Breakdown

### **Vercel (Frontend)**

**What's deployed:**
- React bundle (App.tsx, components, pages)
- Static files (public/*, icons, fonts)
- Edge Functions for: Stripe webhook only (1 function max)

**Serverless Functions Used:** 1-2 max (OK on Hobby)
```
/api/webhooks/stripe          ← Payment webhook
/api/auth/callback            ← OAuth callback (optional)
```

**Database Calls:** Direct to Supabase via JWT
```
✅ supabase.from('payment_settings').select(...)
✅ supabase.from('payments').insert(...)
✅ supabase.from('receipts').select(...)
```

---

### **Render (Backend API)**

**What's deployed:**
- Node.js/Python server (your backend code)
- Runs 24/7 (not serverless)
- Always available (no cold starts)

**Endpoints:**
```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/payments/{id}
POST   /api/payments/initiate
PATCH  /api/payments/verify
GET    /api/admin/settings
POST   /api/admin/settings
GET    /health
```

**Serverless Functions:** 0 (not applicable - it's a full server)

**Database Access:**
```
1. Fetch payment_settings from Supabase
2. Generate UPI link
3. Return to frontend
```

---

### **Supabase (Database)**

**What's deployed:**
- PostgreSQL database
- Auth system
- 50K Edge Function calls/month (included free)

**Tables:**
```
payment_settings  (admin config)
monthly_dues      (student fees)
payments          (transactions)
receipts          (proof)
profiles          (users)
```

**Security:**
```sql
-- RLS Policy: Only admins read/write payment_settings
CREATE POLICY "admin_payment_settings"
  ON payment_settings FOR ALL
  USING ((SELECT role FROM profiles 
          WHERE id = auth.uid()) = 'ADMIN');
```

**Functions:** Edge Functions only (unlimited on free tier)
- Optional: On webhook → update payment_settings

---

## 🔄 Payment Settings Flow (No Extra Functions)

```
1. Admin opens Dashboard
   └─ Vercel React loads /Payment Settings tab

2. Frontend fetches settings
   └─ supabase.from('payment_settings').select('*')
   └─ RLS checks: admin role? ✓ Grant access

3. Admin enters UPI ID + Business Name
   └─ UI shows form (locally validated)

4. Admin clicks SAVE
   └─ Frontend: supabase.from('payment_settings').update({...})
   └─ Supabase: Validates RLS policy ✓
   └─ Database: Row inserted/updated ✓
   └─ Frontend: Toast "Saved!"

5. Parent initiates payment
   └─ Vercel React App (usePayments hook)
   └─ const [settings] = supabase.from('payment_settings').select()
   └─ Generate QR code with UPI ID
   └─ Display to parent

6. Backend (Render) payment endpoint called
   └─ Fetch payment_settings from Supabase
   └─ Return UPI link + QR
   └─ Process verification webhook

RESULT: ✅ ZERO NEW SERVERLESS FUNCTIONS ADDED!
```

---

## 💾 Function Count Tracking

### **Vercel (Hobby Plan - Max 12)**

| Function | Purpose | Status |
|----------|---------|--------|
| stripe-webhook | Payment confirmation | ✅ Existing |
| auth-callback | OAuth redirect | ✅ Existing |
| payment-settings | **NOT NEEDED** | ❌ Removed |
| *Remaining slots* | Buffer for future | ✅ 10 slots free |

**Why no payment-settings function?**
- Frontend reads Supabase directly (JWT auth)
- Backend (Render) handles all logic
- No serverless function required

---

### **Render (Not Serverless - Always On)**

```
POST   /api/payments/initiate
POST   /api/payments/verify
PATCH  /admin/settings
GET    /admin/settings

→ These are regular API endpoints
→ Not serverless (always running)
→ No function count limits
→ CPU/memory based pricing only
```

---

### **Supabase (Edge Functions)**

```
50K calls/month included (free tier)
- Optional webhook triggers
- Not required for payment settings
- Used only if advanced logic needed
```

---

## 🚀 Scaling Path: Hobby → Pro

### **Current (Hobby - Limited)**
```
Vercel (12 slots max)
├── stripe-webhook
├── auth-callback
└── 10 slots available

Render + Supabase (unlimited)
└── All business logic
```

### **Future (Pro - Unlimited)**
```
Vercel (unlimited)
├── stripe-webhook
├── auth-callback
├── payment-settings (if needed)
├── admin-operations
├── analytics-processor
└── More microservices...

Render (unlimited)
└── Scales horizontally

Supabase (Pro plan scales)
└── 1M+ queries/day
```

---

## ✅ Implementation Checklist

- [x] Payment settings stored in Supabase database ✓
- [x] Admin page created (PaymentSettings.tsx) ✓
- [x] No new Vercel serverless functions ✓
- [x] Frontend reads Supabase directly (JWT auth) ✓
- [x] Backend (Render) handles payment logic ✓
- [x] RLS policies protect admin access ✓
- [x] Real-time updates on payment screen ✓

---

## 📋 Files & Deployment Locations

| File | Deployed On | Purpose |
|------|------------|---------|
| `pages/PaymentSettings.tsx` | Vercel | Admin UI |
| `hooks/usePayments.ts` | Vercel | Payment logic |
| `components/Payment/UpiPaymentFlow.tsx` | Vercel | UPI flow |
| `schema.sql` payment_settings | Supabase | Data storage |
| `App.tsx` | Vercel | Navigation |
| Backend payment endpoint | Render | Process payments |
| `.env.production` | Vercel env vars | Config |

---

## 🔐 Environment Variables (Vercel)

```env
# Vercel Frontend (.env.production)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_API_BASE_URL=https://busway-backend.render.com
VITE_UPI_ID=backup@hdfc              # Fallback only
VITE_BUSINESS_NAME=SchoolBusWay      # Fallback only

# Notes:
# - Primary UPI config read from Supabase table
# - Fallback to env vars if table is empty
# - No serverless functions needed
```

---

## 🎯 Current Status

✅ **Payment Settings Architecture Ready**

```
Admin Panel (Vercel)
    ↓
Supabase Database (payment_settings table)
    ↓
Backend (Render) - Fetches when needed
    ↓
UPI Payment Flow (Fast & Secure)
```

**Serverless Functions Used:** 1-2 (Hobby plan comfortable with 10+ slots free)  
**Ready to Scale:** Yes - upgrade Vercel to Pro when needed  
**Scalable:** Yes - Render + Supabase handle unlimited volume

---

## 📚 Next Steps

1. **Deploy to Vercel:**
   ```bash
   npm run build
   vercel deploy
   ```

2. **Set Vercel Environment Variables:**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL`

3. **Create Supabase Table:**
   - Run SQL migration in Supabase console
   - See `PAYMENT_SETTINGS_SETUP.md`

4. **Test Admin Panel:**
   - Login to production app
   - Go to Payment Settings
   - Save UPI ID
   - Verify in Supabase table

5. **Test Payment Flow:**
   - Login as parent
   - Click Pay Now
   - Should fetch updated UPI settings from database ✓

---

## 🛡️ Security Notes

✅ **JWT Authentication** - Vercel → Supabase
✅ **RLS Policies** - Only admins can read/write settings
✅ **HTTPS/TLS** - All traffic encrypted
✅ **No Sensitive Data in Functions** - Config in database only
✅ **Rate Limiting** - Render backend handles it

---

**Your app is architecture-ready for production!** 🚀
