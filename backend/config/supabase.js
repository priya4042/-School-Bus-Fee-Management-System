const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Missing Supabase environment variables:');
  if (!supabaseUrl) console.warn('- SUPABASE_URL is missing');
  if (!supabaseServiceKey) console.warn('- SUPABASE_SERVICE_ROLE_KEY is missing');
  console.warn('Using placeholder client.');
  // Create a dummy client that logs warnings
  const placeholder = (method) => async () => {
    console.warn(`Supabase ${method} called but Supabase is not configured.`);
    return { data: null, error: { message: 'Supabase not configured' } };
  };

  const chainable = () => ({
    select: chainable,
    eq: chainable,
    lt: chainable,
    gt: chainable,
    insert: placeholder('insert'),
    update: placeholder('update'),
    delete: placeholder('delete'),
    maybeSingle: placeholder('maybeSingle'),
    single: placeholder('single'),
  });

  supabaseAdmin = {
    from: () => chainable(),
    auth: {
      signInWithPassword: placeholder('signInWithPassword'),
      signUp: placeholder('signUp'),
      refreshSession: placeholder('refreshSession'),
      getUser: placeholder('getUser'),
    }
  };
} else {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
}

module.exports = supabaseAdmin;
