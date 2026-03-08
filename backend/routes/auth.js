const express = require('express');
const router = express.Router();
const supabaseAdmin = require('../config/supabase');

// ================= LOGIN =================
router.post('/login', async (req, res) => {
  const { email, identifier, password, type } = req.body;
  const loginIdentifier = identifier || email;

  if (!loginIdentifier || !password) {
    return res.status(400).json({ error: 'Identifier and password are required' });
  }

  try {
    let finalEmail = loginIdentifier;

    // Login using Admission Number
    if (type === 'ADMISSION') {

      // 1️⃣ Find student
      const { data: student, error: studentError } = await supabaseAdmin
        .from('students')
        .select('parent_id')
        .eq('admission_number', loginIdentifier.trim())
        .maybeSingle();

      if (studentError) throw studentError;

      if (!student) {
        return res.status(404).json({ error: 'Admission number not found' });
      }

      if (!student.parent_id) {
        return res.status(404).json({ error: 'Parent not registered for this admission number' });
      }

      // 2️⃣ Get parent email
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .eq('id', student.parent_id)
        .eq('role', 'PARENT')
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile?.email) {
        return res.status(404).json({ error: 'Parent profile not found' });
      }

      finalEmail = profile.email;
    } else if (type === 'PHONE') {
      // Login using Phone Number
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .eq('phone_number', loginIdentifier.trim())
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile?.email) {
        return res.status(404).json({ error: 'User with this phone number not found' });
      }

      finalEmail = profile.email;
    }

    console.log("LOGIN EMAIL:", finalEmail);

    // 3️⃣ Login via Supabase Auth
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: finalEmail,
      password,
    });

    if (error) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    res.status(200).json({
      message: 'Login successful',
      session: data.session,
      user: data.user
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});


// ================= REGISTER =================
router.post('/register', async (req, res) => {

  const { email, password, full_name, role, admission_number } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({
      error: 'Email, password, and role are required'
    });
  }

  try {

    // 1️⃣ Create auth user
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.signUp({
        email,
        password,
      });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData.user.id;

    // 2️⃣ Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name,
        role,
        admission_number,
      });

    if (profileError) throw profileError;

    // 3️⃣ Link parent to student
    if (role === 'PARENT' && admission_number) {

      const { data: student } = await supabaseAdmin
        .from('students')
        .select('id')
        .eq('admission_number', admission_number)
        .maybeSingle();

      if (!student) {
        return res.status(404).json({
          error: 'Student admission number not found'
        });
      }

      await supabaseAdmin
        .from('students')
        .update({ parent_id: userId })
        .eq('admission_number', admission_number);
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: authData.user
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
});


// ================= REFRESH TOKEN =================
router.post('/refresh', async (req, res) => {

  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({
      error: 'Refresh token is required'
    });
  }

  try {

    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.status(200).json(data);

  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;