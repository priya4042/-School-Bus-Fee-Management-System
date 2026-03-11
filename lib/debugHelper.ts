/**
 * Debug Helper for troubleshooting admission number lookups
 * Use in browser console: debugHelper.checkAdmissionNumbers()
 */
import { supabase } from './supabase';

export const debugHelper = {
  /**
   * Fetch all admission numbers from database to verify they exist
   * Call in browser console: await debugHelper.checkAdmissionNumbers()
   */
  checkAdmissionNumbers: async () => {
    try {
      console.log('🔍 Fetching all admission numbers from database...');
      const { data, error } = await supabase
        .from('students')
        .select('admission_number, full_name, parent_id')
        .order('admission_number');

      if (error) {
        console.error('❌ Error fetching admission numbers:', error);
        console.log('Possible issues:');
        console.log('1. RLS policies might be blocking access');
        console.log('2. Supabase credentials might not be configured');
        return;
      }

      console.log(`✅ Found ${data?.length || 0} students in database:`);
      console.table(data?.map((s: any) => ({
        'Admission Number': s.admission_number,
        'Student Name': s.full_name,
        'Has Parent': !!s.parent_id ? '✅ Yes' : '❌ No'
      })));

      return data;
    } catch (err: any) {
      console.error('Error:', err);
    }
  },

  /**
   * Test admission lookup with your input
   * Call: await debugHelper.testAdmissionLookup('ADM001')
   */
  testAdmissionLookup: async (admissionNumber: string) => {
    try {
      const normalized = admissionNumber.trim().toUpperCase();
      console.log(`🔍 Testing admission lookup for: "${normalized}"`);

      // Try case-insensitive match first using filter
      const result1 = await supabase
        .from('students')
        .select('*')
        .filter('admission_number', 'ilike', normalized)
        .limit(1);

      if (result1.error) {
        console.error('❌ Filter search error:', result1.error);
      } else if (result1.data?.[0]) {
        console.log('✅ FILTER MATCH FOUND:', result1.data[0]);
        return result1.data[0];
      } else {
        console.log('❌ No filter match found');
      }

      // Try exact uppercase match
      const result2 = await supabase
        .from('students')
        .select('*')
        .eq('admission_number', normalized);

      if (result2.error) {
        console.error('❌ Exact match error:', result2.error);
      } else if (result2.data?.[0]) {
        console.log('✅ EXACT UPPERCASE MATCH FOUND:', result2.data[0]);
        return result2.data[0];
      } else {
        console.log('❌ No exact uppercase match found');
      }

      // Try original case-sensitive match as last resort
      const result3 = await supabase
        .from('students')
        .select('*')
        .eq('admission_number', admissionNumber.trim());

      if (result3.error) {
        console.error('❌ Case-sensitive match error:', result3.error);
      } else if (result3.data?.[0]) {
        console.log('✅ ORIGINAL CASE MATCH FOUND:', result3.data[0]);
        return result3.data[0];
      } else {
        console.log('❌ No case-sensitive match found either');
      }

      console.log('\n📋 Suggestions:');
      console.log('1. Run debugHelper.checkAdmissionNumbers() to see all available admission numbers');
      console.log('2. Check if there are extra spaces in your admission number');
      console.log('3. Verify the exact format in the database');
    } catch (err: any) {
      console.error('Error:', err);
    }
  },

  /**
   * Get the development OTP that was generated
   * Use during registration testing: await debugHelper.getDevOTP()
   */
  getDevOTP: () => {
    const otp = sessionStorage.getItem('devOTP');
    const phone = sessionStorage.getItem('devPhone');

    if (!otp) {
      console.warn('❌ No development OTP found');
      console.log('📝 Steps:');
      console.log('1. Go to Registration tab');
      console.log('2. Fill in all fields (admission: 2797, phone: 8278812686)');
      console.log('3. Click "Send OTP"');
      console.log('4. Then run: await debugHelper.getDevOTP()');
      return null;
    }

    console.warn('========================================');
    console.warn('🔐 DEVELOPMENT OTP CODE:');
    console.warn(`📱 Phone: ${phone}`);
    console.warn(`🔑 OTP: ${otp}`);
    console.warn('========================================');
    console.log('✅ Copy the OTP above and paste in the registration form');

    return { otp, phone };
  },

  /**
   * Check Supabase connection and configuration
   */
  checkSupabaseConfig: async () => {
    console.log('🔍 Checking Supabase configuration...');
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('Auth Status:', user ? `✅ Logged in as ${user.email}` : '❌ Not logged in (anon)');

      if (error) console.error('Auth error:', error);

      // Try to read a table
      const { data, error: readError } = await supabase
        .from('students')
        .select('id')
        .limit(1);

      if (readError) {
        console.error('❌ Cannot read students table:', readError);
        console.log('❗ This might be an RLS (Row Level Security) issue');
        console.log('Contact Bus admin to check Supabase RLS policies');
      } else {
        console.log('✅ Can read students table');
      }
    } catch (err: any) {
      console.error('Error:', err);
    }
  }
};

// Make available globally for debugging
(window as any).debugHelper = debugHelper;
