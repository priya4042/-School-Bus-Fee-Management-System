# Troubleshooting: "Admission number not found" Error

## Quick Diagnosis Steps

### Step 1: Check Available Admission Numbers
1. Open your app in browser
2. Open **Browser Console** (F12 or Right-click → Inspect → Console tab)
3. Run this command:
```javascript
await debugHelper.checkAdmissionNumbers()
```

This will show you ALL admission numbers in your database. **Write down the exact format** (uppercase/lowercase/spaces).

### Step 2: Test Your Specific Admission Number
In the console, run:
```javascript
await debugHelper.testAdmissionLookup('YOUR_ADMISSION_NUMBER')
```

Example:
```javascript
await debugHelper.testAdmissionLookup('ADM001')
```

This will tell you:
- ✅ If the exact admission number exists
- ✅ If a case-insensitive match exists
- ❌ If the number is not in the database

### Step 3: Check Supabase Configuration
Run in console:
```javascript
await debugHelper.checkSupabaseConfig()
```

This checks if:
- ✅ Supabase is connected
- ✅ Your anon key is valid
- ✅ RLS policies allow reading students table

---

## Common Issues & Solutions

### Issue 1: Admission Number Not Found
**Cause**: The admission number doesn't exist in the `students` table

**Solution**:
1. Run `await debugHelper.checkAdmissionNumbers()` to see all available numbers
2. Verify you're typing the exact admission number
3. Check for extra spaces or different character case
4. Contact Bus admin to verify the number was created in the system

---

### Issue 2: Admission Numbers Have Different Format (Spaces, Dashes, etc.)

**Cause**: Database might have numbers like `"ADM - 001"` but you're entering `"ADM001"`

**Solution**: 
Run this command to normalize all admission numbers in your database:
```sql
-- Contact Bus admin to run this SQL:
UPDATE students
SET admission_number = TRIM(UPPER(admission_number))
WHERE true;
```

This will:
- ✅ Convert to uppercase
- ✅ Remove leading/trailing spaces
- ✅ Make all numbers consistent

---

### Issue 3: RLS Policy Blocking Anonymous User

**Cause**: Supabase Row Level Security (RLS) policies might block anon users from reading students table

**What to check**:
1. Run `await debugHelper.checkSupabaseConfig()`
2. Look for error message: `"Cannot read students table"`
3. If you see this, contact Bus admin to:
   - Check RLS policies on `students` table
   - Ensure `SELECT` permission for `anon` role
   - Or disable RLS for now (less secure but works)

**Temporary workaround** (if RLS is blocking):
Contact Bus admin to run in Supabase dashboard:
```sql
-- Disable RLS on students table (temporary)
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
```

**Then re-enable** (after confirming admission lookup works):
```sql
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
```

---

### Issue 4: Admission Number Column Missing or Empty

**Cause**: The `admission_number` column might not be filled for all students

**Solution**:
1. Run `await debugHelper.checkAdmissionNumbers()`
2. Check if admission numbers show as empty or NULL
3. Contact Bus admin to populate admission numbers for all students:
```sql
-- Example: auto-generate if missing
UPDATE students
SET admission_number = 'STU-' || substring(id::text, 1, 8)
WHERE admission_number IS NULL OR admission_number = '';
```

---

## Step-by-Step Debugging Process

```
Trying to register parent...
                ↓
User enters admission number: "ADM001"
                ↓
System normalizes to: "ADM001"
                ↓
Query students table using ILIKE (case-insensitive)
                ↓
┌─────────────────────────────────────┐
│ Is "ADM001" found?                  │
├─────────────┬───────────────────────┤
│    NO       │         YES           │
├─────────────┼───────────────────────┤
│ Error shown │ Continue to OTP step  │
│ "Admission  │                       │
│ not found"  │ ✅ Registration OK    │
└─────────────┴───────────────────────┘

If NO → Run debugHelper.checkAdmissionNumbers()
        to see what numbers ARE in database
```

---

## Most Likely Solution

99% of the time, this error is because:

1. **The admission number doesn't exist in database** 
   - Check with `debugHelper.checkAdmissionNumbers()`

2. **Admission numbers have different formatting**
   - Database might have spaces: `"ADM - 001"`
   - You entered: `"ADM001"`
   - Run the SQL normalization script above

3. **RLS policies blocking access**
   - Run `debugHelper.checkSupabaseConfig()`
   - Check if it says "Cannot read students table"
   - Contact Bus admin to check RLS

---

## How to Get Help

When contacting Bus admin, provide:
1. Screenshot or output of `debugHelper.checkAdmissionNumbers()`
2. The exact admission number you're trying to use
3. Output of `debugHelper.testAdmissionLookup('YOUR_NUMBER')`
4. Output of `debugHelper.checkSupabaseConfig()`

This will help them diagnose quickly!

---

## Testing After Fix

After implementing any fix:

1. Clear browser cache (Ctrl+Shift+Del)
2. Refresh page
3. Try registration again
4. If still failing, run debug commands again to verify database changes

✅ **Success**: You'll get to OTP verification step and receive SMS
