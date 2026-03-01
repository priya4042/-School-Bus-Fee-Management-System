import express from 'express';
import { supabase } from '../services/supabase.js';
import twilio from 'twilio';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

const router = express.Router();
const MASTER_ADMIN_SECRET = process.env.MASTER_ADMIN_SECRET;

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 OTP requests per window
  message: { error: 'Too many OTP requests, please try again later' }
});

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;

const client = TWILIO_SID && TWILIO_AUTH ? twilio(TWILIO_SID, TWILIO_AUTH) : null;

// Validation Schemas
const adminRegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
  masterSecret: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const parentRegisterSchema = z.object({
  admissionNumber: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  phoneNumber: z.string()
});

const loginSchema = z.object({
  email: z.string().min(1, "Email or Admission Number is required"),
  password: z.string().min(1, "Password is required")
});

// Admin Registration
router.post('/admin/register', async (req, res, next) => {
  console.log("[Auth] Admin registration request received");
  try {
    const { name, email, password, masterSecret } = adminRegisterSchema.parse(req.body);
    
    const trimmedSecret = masterSecret.trim();
    const expectedSecret = (process.env.MASTER_ADMIN_SECRET || '').trim();

    if (trimmedSecret !== expectedSecret) {
      console.warn("[Auth] Master secret mismatch");
      return res.status(401).json({ 
        success: false,
        error: 'Invalid Master Admin Secret',
        code: 'INVALID_MASTER_SECRET'
      });
    }

    // 1. Supabase Auth Sign Up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: 'ADMIN'
        }
      }
    });

    if (authError) {
      console.error("[Auth] Supabase Auth error:", authError);
      return res.status(400).json({ success: false, error: authError.message });
    }

    if (!authData.user) {
      return res.status(400).json({ success: false, error: 'Failed to create auth user' });
    }

    // 2. Create Profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: name,
        email,
        role: 'ADMIN'
      });

    if (profileError) {
      console.error("[Auth] Profile creation error:", profileError);
      // Note: User is created in auth.users but profile failed. 
      // In a real app, you might want to delete the auth user here.
      return res.status(500).json({ success: false, error: 'Auth user created but profile failed' });
    }

    console.log(`[Auth] Admin registered successfully: ${email}`);
    res.status(201).json({ 
      success: true,
      message: 'Admin registered successfully. Please check your email for verification.', 
      user: { id: authData.user.id, email: authData.user.email } 
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        error: err.issues[0].message,
        code: 'VALIDATION_FAILED'
      });
    }
    next(err);
  }
});

// Parent Registration
router.post('/register-parent', async (req, res, next) => {
  try {
    const { admissionNumber, email, password, fullName, phoneNumber } = parentRegisterSchema.parse(req.body);

    // 1. Verify Admission Number exists in students table
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, admission_number')
      .eq('admission_number', admissionNumber)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ error: 'Invalid Admission Number. Please contact school admin.' });
    }

    // 2. Supabase Auth Sign Up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'PARENT'
        }
      }
    });

    if (authError) return res.status(400).json({ error: authError.message });
    if (!authData.user) return res.status(400).json({ error: 'Failed to create auth user' });

    // 3. Create Profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: fullName,
        email,
        role: 'PARENT',
        admission_number: admissionNumber,
        phone_number: phoneNumber
      });

    if (profileError) return res.status(500).json({ error: 'Profile creation failed' });

    // 3.5 Create Parent record
    await supabase.from('parents').insert({ id: authData.user.id });

    // 4. Link student to parent profile
    await supabase.from('students').update({ parent_id: authData.user.id }).eq('id', student.id);

    res.json({ success: true, message: 'Registration successful', user: authData.user });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues[0].message });
    next(err);
  }
});

// Unified Login
router.post('/login', async (req, res) => {
  console.log("[Auth] Login request body:", req.body);
  try {
    const { email: identifier, password } = loginSchema.parse(req.body);

    let email = identifier;

    // If identifier is not an email, check if it's an admission number or phone number
    if (!identifier.includes('@')) {
      // Try finding by admission_number (Parent)
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, role')
        .eq('admission_number', identifier)
        .single();

      // If not found, return error
      if (profileError || !profile) {
        return res.status(404).json({ error: 'User not found with this ID' });
      }
      email = profile.email;
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      return res.status(401).json({ error: authError?.message || 'Invalid credentials' });
    }

    // Fetch role from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json({ 
      success: true,
      user: { ...authData.user, role: profile.role },
      session: authData.session 
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const firstError = err.issues[0];
      return res.status(400).json({ 
        error: `${firstError.path.join('.')}: ${firstError.message}` 
      });
    }
    console.error("[Auth] Login error:", err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Forgot Password
router.post('/forgot-password', otpLimiter, async (req, res) => {
  try {
    const { email, admissionNumber } = req.body;
    let identifier = email || admissionNumber;
    
    if (!identifier) {
      return res.status(400).json({ error: 'Email or Admission Number is required' });
    }

    let profile;
    if (email) {
      const { data } = await supabase.from('profiles').select('*').eq('email', email).single();
      profile = data;
    } else {
      const { data } = await supabase.from('profiles').select('*').eq('admission_number', admissionNumber).single();
      profile = data;
    }

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    // Store OTP
    await supabase.from('otp_logs').insert({
      phone_number: profile.phone_number || profile.email, // Use email as fallback if no phone
      otp_code: otp,
      expires_at: expiresAt
    });

    // Send OTP via Twilio if phone exists and client is configured
    if (client && profile.phone_number) {
      try {
        await client.messages.create({
          body: `Your BusWay Pro password reset OTP is: ${otp}. Valid for 15 minutes.`,
          from: TWILIO_PHONE,
          to: profile.phone_number
        });
      } catch (err) {
        console.error("Twilio error:", err);
        // Continue even if SMS fails in dev
      }
    } else {
      console.log(`[DEV] OTP for ${profile.phone_number || profile.email}: ${otp}`);
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { identifier, otp, newPassword } = req.body;

    if (!identifier || !otp || !newPassword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find user
    let profile;
    if (identifier.includes('@')) {
      const { data } = await supabase.from('profiles').select('*').eq('email', identifier).single();
      profile = data;
    } else {
      const { data } = await supabase.from('profiles').select('*').eq('admission_number', identifier).single();
      profile = data;
    }

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify OTP
    const { data: otpRecord, error: otpError } = await supabase
      .from('otp_logs')
      .select('*')
      .eq('phone_number', profile.phone_number || profile.email)
      .eq('otp_code', otp)
      .eq('is_verified', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (otpError || !otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Mark OTP as verified
    await supabase.from('otp_logs').update({ is_verified: true }).eq('id', otpRecord.id);

    // Update password using Admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      profile.id,
      { password: newPassword }
    );

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update password' });
    }

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Account Deletion
router.delete('/delete-account', async (req, res) => {
  // In Supabase Auth, users can't easily delete themselves via client SDK without service role
  // or specific setup. For this app, we'll assume the user is authenticated.
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) return res.status(401).json({ error: 'Invalid session' });

    // Delete profile (cascade might handle auth user if configured, but usually not)
    await supabase.from('profiles').delete().eq('id', user.id);
    
    // Note: To delete the auth user, you typically need the service role key on the server
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    
    if (deleteError) console.error("Failed to delete auth user:", deleteError);

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
