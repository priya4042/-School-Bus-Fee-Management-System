import { supabase } from '../lib/supabase';

export interface UserExistsResult {
  exists: boolean;
  valid?: boolean; // for ADMISSION: false = not found in students table
  message?: string;
}

export const userService = {
  checkUserExists: async (
    identifier: string,
    type: 'PHONE' | 'EMAIL' | 'ADMISSION'
  ): Promise<UserExistsResult> => {
    try {
      if (type === 'PHONE') {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('phone_number', identifier)
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
          .eq('email', identifier.toLowerCase())
          .maybeSingle();
        return {
          exists: !!data,
          valid: true,
          message: data ? 'This email is already registered. Please login instead.' : ''
        };
      }

      if (type === 'ADMISSION') {
        const { data } = await supabase
          .from('students')
          .select('id, parent_id')
          .eq('admission_number', identifier)
          .maybeSingle();

        if (!data) {
          return {
            exists: false,
            valid: false,
            message: 'Admission number not found. Please verify with school administration.'
          };
        }

        if (data.parent_id) {
          return {
            exists: true,
            valid: true,
            message: 'This admission number is already linked to an account. Please login instead.'
          };
        }

        return { exists: false, valid: true };
      }

      return { exists: false, valid: true };
    } catch (error) {
      console.error('Check user existence failed:', error);
      // On network/config error, let backend validate during registration
      return { exists: false, valid: true };
    }
  }
};
