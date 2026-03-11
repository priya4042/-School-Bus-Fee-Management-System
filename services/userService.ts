import { supabase } from '../lib/supabase';

export interface UserExistsResult {
  exists: boolean;
  valid?: boolean; // for ADMISSION: false = not found in students table
  message?: string;
  parentName?: string | null;
  parentPhone?: string | null;
}

export const userService = {
  checkUserExists: async (
    identifier: string,
    type: 'PHONE' | 'EMAIL' | 'ADMISSION'
  ): Promise<UserExistsResult> => {
    try {
      if (type === 'PHONE') {
        const digits = identifier.replace(/\D/g, '').slice(-10);
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .or(`phone_number.eq.${digits},phone_number.eq.+91${digits}`)
          .maybeSingle();
        return {
          exists: !!data,
          valid: true,
          message: data ? 'This phone number is already registered. Please login instead.' : ''
        };
      }

      if (type === 'EMAIL') {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', identifier.trim().toLowerCase())
          .maybeSingle();
        return {
          exists: !!data,
          valid: true,
          message: data ? 'This email is already registered. Please login instead.' : ''
        };
      }

      if (type === 'ADMISSION') {
        const normalizedAdmission = identifier.trim();
        const { data } = await supabase
          .from('students')
          .select('id, parent_id, parent_name, parent_phone')
          .eq('admission_number', normalizedAdmission)
          .maybeSingle();

        if (!data) {
          return {
            exists: false,
            valid: false,
            message: 'Admission number not found. Please verify with Bus Administration.'
          };
        }

        if (data.parent_id) {
          return {
            exists: true,
            valid: true,
            message: 'This admission number is already linked to an account. Please login instead.',
            parentName: data.parent_name || null,
            parentPhone: data.parent_phone || null
          };
        }

        return { exists: false, valid: true, parentName: data.parent_name || null, parentPhone: data.parent_phone || null };
      }

      return { exists: false, valid: true };
    } catch (error) {
      console.error('Check user existence failed:', error);
      // On network/config error, let backend validate during registration
      return { exists: false, valid: true };
    }
  }
};
