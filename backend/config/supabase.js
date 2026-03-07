const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Missing Supabase environment variables. Using placeholder client.');
  // Create a dummy client that logs warnings
  supabaseAdmin = {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
          single: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
        }),
        insert: async () => ({ error: { message: 'Supabase not configured' } }),
        update: async () => ({ eq: async () => ({ error: { message: 'Supabase not configured' } }) }),
      }),
    }),
    auth: {
      signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      signUp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      refreshSession: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
    }
  };
} else {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
}

module.exports = supabaseAdmin;
