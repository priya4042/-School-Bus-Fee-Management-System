# Deployment Guide: Vercel + Render + Supabase

## 🚀 Quick Deployment (15 mins)

### **Step 1: Vercel Frontend (5 mins)**

```bash
# 1. Build locally first
npm run build

# 2. Install Vercel CLI
npm install -g vercel

# 3. Deploy
vercel deploy --prod

# 4. Set environment variables in Vercel Dashboard
```

**Vercel Dashboard:**
```
Project Settings → Environment Variables
├── VITE_SUPABASE_URL = https://xxx.supabase.co
├── VITE_SUPABASE_ANON_KEY = xxx
├── VITE_API_BASE_URL = https://busway-backend.render.com
├── VITE_UPI_ID = admin@hdfc (fallback)
└── VITE_BUSINESS_NAME = SchoolBusWay (fallback)
```

**Check:**
- ✅ App loads at https://yourapp.vercel.app
- ✅ Admin can see "Payment Settings" tab
- ✅ NO new serverless functions created (should be 1-2 max)

---

### **Step 2: Supabase Database (5 mins)**

**Run in Supabase SQL Editor:**

```sql
-- 1. Create payment_settings table
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  upi_id TEXT,
  business_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Admins can view
CREATE POLICY "Admins can view payment settings"
  ON public.payment_settings FOR SELECT
  USING ((SELECT role FROM public.profiles 
          WHERE id = auth.uid()) IN ('ADMIN', 'SUPER_ADMIN'));

-- 4. Policy: Admins can update
CREATE POLICY "Admins can update payment settings"
  ON public.payment_settings FOR UPDATE
  USING ((SELECT role FROM public.profiles 
          WHERE id = auth.uid()) IN ('ADMIN', 'SUPER_ADMIN'));

-- 5. Policy: Admins can insert
CREATE POLICY "Admins can insert payment settings"
  ON public.payment_settings FOR INSERT
  WITH CHECK ((SELECT role FROM public.profiles 
              WHERE id = auth.uid()) IN ('ADMIN', 'SUPER_ADMIN'));

-- 6. Insert default settings (optional)
INSERT INTO payment_settings (upi_id, business_name) 
VALUES ('admin@hdfc', 'SchoolBusWay')
ON CONFLICT DO NOTHING;
```

**Check:**
- ✅ Table exists in Supabase
- ✅ RLS policies display
- ✅ Can see 1 row with default values

---

### **Step 3: Render Backend (5 mins)**

**Deploy existing backend (already running):**

```bash
# Check if backend is running
curl https://busway-backend.render.com/health

# Response should be:
# {"status": "ok"}
```

**Render Dashboard:**
```
Your Service → Environment
├── Existing vars (keep as is)
├── SUPABASE_URL = https://xxx.supabase.co
├── SUPABASE_KEY = xxx (service role key)
└── FRONTEND_URL = https://yourapp.vercel.app
```

**Check:**
- ✅ Backend `/health` endpoint responds
- ✅ Payment endpoints accessible
- ✅ Can connect to Supabase

---

## ✅ Verification Checklist

### **1. Vercel Functions Count**

```
Vercel Dashboard → Deployments → Functions tab
└─ Should show 1-2 functions max (NOT 12+)

Examples:
├── stripe-webhook.js        ← Existing
├── auth-callback.js         ← Existing (optional)
└─ Payment settings: NONE    ← Correct!
```

### **2. Admin Panel Test**

```
1. Go to https://yourapp.vercel.app
2. Login: admin@school.com / admin123
3. Click "Payment Settings" tab
4. Should see form with:
   └─ UPI ID field: admin@hdfc
   └─ Business Name field: SchoolBusWay
5. Click "Save Settings"
6. Should show: "Payment settings updated successfully" ✓
```

### **3. Database Check**

```
Supabase → Table Editor → payment_settings
└─ Should show 1 row:
   ├─ id: [UUID]
   ├─ upi_id: admin@hdfc
   ├─ business_name: SchoolBusWay
   ├─ created_at: [timestamp]
   └─ updated_at: [timestamp]
```

### **4. Parent Payment Test**

```
1. Login as parent
2. Go to Fees tab
3. Click "Pay Now"
4. Should see UPI button (no error)
5. Click UPI button
6. Should generate QR code with:
   └─ UPI ID: admin@hdfc ✓
```

---

## 📊 Performance Metrics

### **Vercel (Frontend)**

| Metric | Expected | Status |
|--------|----------|--------|
| Serverless Functions | 1-2 | ✅ Under quota |
| Edge Functions | 0 | ✅ Not needed |
| Build Time | 1-2 min | ⚠️ Check first build |
| Cold Start | N/A (CDN) | ✅ Instant |
| Data APIs | Direct Supabase | ✅ Fast |

### **Render (Backend)**

| Metric | Expected | Status |
|--------|----------|--------|
| Uptime | 99%+ | ✅ Running 24/7 |
| Response Time | <500ms | ✅ OK |
| CPU Usage | <50% | ⚠️ Check initially |
| Memory | <512MB | ✅ Included |
| Cold Starts | None | ✅ N/A (not serverless) |

### **Supabase (Database)**

| Metric | Expected | Status |
|--------|----------|--------|
| Connections | 10-20 | ✅ Available |
| Queries/sec | <100 | ✅ OK for this scale |
| Storage | <1GB | ✅ Available |
| RLS Policies | 3 active | ✅ Secure |
| Edge Functions | 0 of 50K | ✅ Free tier |

---

## 🔧 Troubleshooting

### **Problem: "Service partially unavailable"**

**Cause:** Serverless function cold start on Vercel  
**Solution:** Upgrade to Pro plan or optimize function count

```bash
# Check current functions
vercel inspect

# Should show ≤ 2 functions
```

### **Problem: "Payment settings not showing"**

**Cause:** Supabase table doesn't exist  
**Solution:** Run SQL migration (see Step 2 above)

```sql
-- Verify table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'payment_settings';
```

### **Problem: "Admin can't save settings"**

**Cause:** RLS policy denying access  
**Solution:** Check user role in profiles table

```sql
-- Verify admin role
SELECT id, email, role FROM profiles 
WHERE email = 'admin@school.com';

-- Result should be:
-- id | email | role
-- xxx | admin@school.com | ADMIN
```

### **Problem: "Backend can't access Supabase"**

**Cause:** Missing SUPABASE_KEY in Render env  
**Solution:** Add service role key to Render

```
Render → Environment Variables
SUPABASE_KEY = [GET FROM SUPABASE → Project Settings → API]
```

---

## 🎯 Production Readiness Checklist

- [ ] Vercel app deployed and building successfully
- [ ] Environment variables set in Vercel dashboard
- [ ] Serverless functions count ≤ 12 (ideally 2-3)
- [ ] Supabase payment_settings table created
- [ ] RLS policies show 3 entries
- [ ] Render backend responding to /health
- [ ] Render can access Supabase database
- [ ] Admin can save payment settings via UI
- [ ] Parent can see updated UPI settings
- [ ] QR code generates correctly
- [ ] Payment verification works end-to-end

---

## 📈 Scaling Path

### **Current Setup (Hobby)**
```
Vercel (12 slots, 2 used)  ✅ Comfortable
Render (free tier)         ✅ OK for 1-2 buses
Supabase (free tier)       ✅ 500MB enough
```

### **When to Upgrade (Pro)**

**Trigger:** You've added 5+ more serverless functions
```
Signs you need Pro:
- ✗ >10 serverless functions
- ✗ >1000 parent login/day
- ✗ Multiple payment gateways
- ✗ Complex admin operations
- ✗ Analytics/reporting functions
```

**Upgrade Steps:**
```bash
# Vercel Pro ($20/mo)
vercel upgrade

# Render Pro ($12/mo minimum)
# Go to Render Dashboard → Account → Upgrade

# Supabase Pro ($25/mo)
# Go to Supabase → Billing → Upgrade
```

**After Upgrade:**
```
Vercel Pro
├── Unlimited serverless functions ✓
├── 100GB bandwidth/mo ✓
└── Advanced monitoring ✓

Render Pro
├── Horizontal scaling ✓
├── Custom domains ✓
└── Priority support ✓

Supabase Pro
├── 8GB storage ✓
├── 1M Edge Function calls/mo ✓
└── Priority support ✓
```

**Monthly Cost:**
- Vercel: $20
- Render: $12
- Supabase: $25
- **Total: ~$57/mo** (still < $100/mo!)

---

## 🚀 Deploy Commands

```bash
# Full deployment cycle

# 1. Build and test locally
npm run build
npm run preview

# 2. Deploy frontend
vercel deploy --prod

# 3. Check functions count
vercel inspect

# 4. Verify Supabase table
# (Do in Supabase console - SQL Editor)

# 5. Test backend
curl https://busway-backend.render.com/health

# 6. Full end-to-end test
# See "Verification Checklist" above
```

---

## 📞 Support Contacts

**Vercel Issues:**
- Docs: https://vercel.com/docs
- Support: https://vercel.com/contact/support
- Community: https://github.com/vercel/next.js/discussions

**Render Issues:**
- Docs: https://render.com/docs
- Support: https://dashboard.render.com/support
- Email: support@render.com

**Supabase Issues:**
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com
- GitHub: https://github.com/supabase/supabase

---

**You're all set for production!** 🎉
