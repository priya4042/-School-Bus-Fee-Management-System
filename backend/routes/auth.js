const express = require('express');
const router = express.Router();
const supabaseAdmin = require('../config/supabase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Login
router.post('/login', async (req, res) => {
  const { email, identifier, password, type } = req.body;
  const loginIdentifier = identifier || email;

  if (!loginIdentifier || !password) {
    return res.status(400).json({ error: 'Identifier and password are required' });
  }

  try {
    let finalEmail = loginIdentifier;
    if (type === 'ADMISSION') {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .eq('admission_number', loginIdentifier.trim())
        .maybeSingle();

      if (!profile?.email) {
        return res.status(404).json({ error: 'Admission number not found or not registered' });
      }
      finalEmail = profile.email;
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: finalEmail,
      password,
    });

    if (error) {
      return res.status(error.status || 401).json({ error: error.message });
    }

    // Generate custom JWT if needed, or just return Supabase session
    // For now, returning Supabase session data
    res.status(200).json({ message: 'Login successful', ...data });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Register
router.post('/register', async (req, res) => {
  const { email, password, full_name, role, admission_number } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required' });
  }

  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: authData.user.id,
      email,
      full_name,
      role,
      admission_number,
    });

    if (profileError) throw profileError;

    res.status(201).json({ message: 'User created', user: authData.user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Refresh Token
router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  try {
    const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token });
    if (error) {
      return res.status(error.status || 401).json({ error: error.message });
    }
    res.status(200).json(data);
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
