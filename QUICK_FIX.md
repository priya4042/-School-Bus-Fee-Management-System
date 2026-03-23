# IMMEDIATE ACTION PLAN

## You're Getting "Admission number not found" During Parent Registration?

Follow these steps RIGHT NOW:

---

## STEP 1: Open Browser Console & Run Diagnostic
1. **Open your app** in browser
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. **Copy and paste this:**

```javascript
await debugHelper.checkAdmissionNumbers()
```

This will show you **ALL admission numbers** in your database.

---

## STEP 2: Check What You See

### Scenario A: ✅ "All admission numbers are displayed"
- Write down one of the admission numbers exactly
- Try registering with that exact number
- No extra spaces, no different case mixing
- **This should work now** - the system is case-insensitive

### Scenario B: ❌ "Empty list - No students found"
- Your students table is empty OR has RLS blocking access
- Contact Bus admin to:
  1. Verify students table exists
  2. Add test student records with admission numbers
  3. Check Supabase RLS policies

### Scenario C: ⚠️ "Error message about permissions"
- RLS (Row Level Security) is blocking the lookup
- Run: `await debugHelper.checkSupabaseConfig()`
- Share the error with Bus admin

---

## STEP 3: Normalize Your Admission Numbers (If Needed)

If admission numbers have different formats (spaces, mixed case, etc.):

**Contact Bus admin to run this SQL in Supabase:**

```sql
-- Fix all admission numbers to consistent format
UPDATE students
SET admission_number = TRIM(UPPER(admission_number))
WHERE admission_number IS NOT NULL;
```

Then refresh your browser and try registration again.

---

## STEP 4: Test Registration Flow

1. You're now ready to register!
2. Click **Register** → Select **PARENT**
3. Enter one of the admission numbers from Step 1
4. Fill in your details
5. Click **Send OTP**
6. **You should get an OTP code in a few seconds**

---

## WHAT I FIXED TODAY

✅ **Case-insensitive admission number lookup** - Works with any case now  
✅ **Fallback query methods** - Multiple ways to find your admission number  
✅ **Better error messages** - Tells you exactly what's wrong  
✅ **Debug helper** - Command line tools to troubleshoot  
✅ **Console logging** - See exactly what's happening during lookup  

---

## IF IT STILL DOESN'T WORK

Run this in browser console and **send the output to Bus admin:**

```javascript
// 1. See all admission numbers
await debugHelper.checkAdmissionNumbers()

// 2. Test your specific number
await debugHelper.testAdmissionLookup('YOUR_ADMISSION_NUMBER')

// 3. Check system configuration
await debugHelper.checkSupabaseConfig()
```

Then tell Bus admin:
- The admission numbers you see in step 1
- Whether step 2 found your number
- Any error messages from step 3

---

## QUICK FIX CHECKLIST

- [ ] Ran `debugHelper.checkAdmissionNumbers()` - saw admission numbers
- [ ] Admission numbers are in uppercase and don't have extra spaces
- [ ] Tried registering with exact admission number
- [ ] Got OTP sent to phone (success!)
- [ ] Parent account created

**If all checked** → You're all set! 🎉
