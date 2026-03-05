import express from "express";
import { createServer as createViteServer } from "vite";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import twilio from "twilio";
import axios from "axios";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

// --- CONFIGURATION ---
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-this";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "super-refresh-secret-key";

// --- INITIALIZATION ---
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

// In-memory OTP store (fallback if DB table not ready)
const otpStore = new Map<string, { otp: string, expiresAt: number }>();

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("CRITICAL: Supabase URL or Key is missing from environment variables!");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

let razorpay: any = null;
function getRazorpay() {
  if (!razorpay) {
    const key_id = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      throw new Error("Razorpay keys are missing");
    }
    razorpay = new Razorpay({ key_id, key_secret });
  }
  return razorpay;
}

let twilioClient: any = null;
function getTwilio() {
  if (!twilioClient) {
    const sid = process.env.TWILIO_ACCOUNT_SID || process.env.VITE_TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN || process.env.VITE_TWILIO_AUTH_TOKEN;
    if (!sid || !token) {
      throw new Error("Twilio keys are missing");
    }
    twilioClient = twilio(sid, token);
  }
  return twilioClient;
}

async function startServer() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet({
    contentSecurityPolicy: false,
  }));
  app.use(cors({
    origin: [
      process.env.APP_URL || "", 
      process.env.SHARED_APP_URL || "",
      "http://localhost:3000",
      "http://localhost:5173"
    ].filter(Boolean),
    credentials: true
  }));
  app.use(cookieParser());
  
  app.use(express.json());

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // Increased for development/testing
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false },
    handler: (req, res) => {
      res.status(429).json({ error: "Too many login attempts, please try again later" });
    }
  });

  // --- OTP ROUTES ---

  // 1. Send OTP
  app.post("/api/v1/auth/send-otp", async (req, res) => {
    const { phone } = req.body;
    if (!phone || phone.length < 10) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    try {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

      // Save to DB (optional, if table exists)
      try {
        await supabase.from("otps").insert({
          phone,
          otp,
          expires_at: expiresAt
        });
      } catch (e) {
        console.warn("Could not save OTP to DB, using in-memory only.");
      }

      // Save to in-memory store
      otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

      // Send via Twilio
      const client = getTwilio();
      const from = process.env.TWILIO_PHONE_NUMBER || process.env.VITE_TWILIO_PHONE_NUMBER;
      
      if (!from) {
        throw new Error("TWILIO_PHONE_NUMBER is not configured in environment variables.");
      }

      // Format phone number for Twilio (India +91)
      let formattedPhone = phone.replace(/\D/g, '');
      if (formattedPhone.length === 10) {
        formattedPhone = `+91${formattedPhone}`;
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+${formattedPhone}`;
      }

      console.log(`Attempting to send OTP to ${formattedPhone} using Twilio from ${from}...`);

      try {
        const message = await client.messages.create({
          body: `Your School Bus WayPro verification code is: ${otp}`,
          from: from,
          to: formattedPhone
        });

        console.log(`OTP ${otp} sent successfully to ${formattedPhone}. SID: ${message.sid}`);
        res.json({ success: true, message: "OTP sent successfully" });
      } catch (twilioError: any) {
        console.error("Twilio API Error:", twilioError.message);
        throw new Error(`Twilio Error: ${twilioError.message}`);
      }
    } catch (error: any) {
      console.error("OTP Send Error:", error);
      res.status(500).json({ error: error.message || "OTP could not be sent. Please try again." });
    }
  });

  // 2. Verify OTP
  app.post("/api/v1/auth/verify-otp", async (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: "Phone and OTP are required" });
    }

    try {
      // 1. Check in-memory store first
      const memOtp = otpStore.get(phone);
      if (memOtp && memOtp.otp === otp && memOtp.expiresAt > Date.now()) {
        otpStore.delete(phone);
        return res.json({ success: true, message: "OTP verified successfully" });
      }

      // 2. Fallback to DB if not in memory
      const { data: otpRecord, error } = await supabase
        .from("otps")
        .select("*")
        .eq("phone", phone)
        .eq("otp", otp)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !otpRecord) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }

      // Delete OTP after verification to prevent reuse
      await supabase.from("otps").delete().eq("id", otpRecord.id);

      res.json({ success: true, message: "OTP verified successfully" });
    } catch (error: any) {
      console.error("OTP Verification Error:", error);
      res.status(500).json({ error: "Verification failed" });
    }
  });

  // --- AUTH ROUTES ---

  // 1. Admin Registration
  app.post("/api/v1/auth/register-admin", async (req, res) => {
    const { fullName, email, password, secret, phoneNumber } = req.body;
    
    const masterSecret = process.env.MASTER_ADMIN_SECRET || "admin123";
    if (secret !== masterSecret) {
      return res.status(403).json({ error: "Invalid master secret. Use 'admin123' if not configured." });
    }

    if (!email && !phoneNumber) {
      return res.status(400).json({ error: "At least one of Email or Phone Number is required." });
    }

    try {
      console.log(`Attempting admin registration for: ${email || phoneNumber}`);
      
      // Determine the email to use for Supabase Auth
      let authEmail = email;
      if (!authEmail && phoneNumber) {
        // Generate a placeholder email if only phone is provided
        // Format: admin_<phone>@buswaypro.local
        authEmail = `admin_${phoneNumber.replace(/\D/g, '')}@buswaypro.local`;
      }

      let authData, authError;
      
      // Try admin API first (requires service role key)
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.log("Using Supabase Admin API for user creation...");
        const result = await supabase.auth.admin.createUser({
          email: authEmail,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName, role: 'ADMIN', phone: phoneNumber }
        });
        authData = result.data;
        authError = result.error;
      } else {
        console.log("Falling back to regular Supabase signUp...");
        const result = await supabase.auth.signUp({
          email: authEmail,
          password,
          options: {
            data: { full_name: fullName, role: 'ADMIN', phone: phoneNumber }
          }
        });
        authData = result.data;
        authError = result.error;
      }

      if (authError) {
        console.error("Supabase Auth registration error:", authError);
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error("User creation failed: No user object returned from Supabase.");
      }

      console.log(`Auth user created: ${authData.user.id}. Creating profile...`);

      const hashedPassword = await bcrypt.hash(password, 10);

      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        full_name: fullName,
        email: authEmail, // Store the auth email (even if placeholder)
        phone_number: phoneNumber,
        password: hashedPassword,
        role: 'ADMIN'
      });

      if (profileError) {
        if (profileError.code === '23505') {
          console.warn("Profile already exists for this user ID, skipping insertion.");
        } else {
          console.error("Profile creation error:", profileError);
          throw profileError;
        }
      }

      // Auto-login after registration
      const accessToken = jwt.sign({ id: authData.user.id, role: 'ADMIN' }, JWT_SECRET, { expiresIn: "1h" });
      const refreshToken = jwt.sign({ id: authData.user.id }, JWT_REFRESH_SECRET, { expiresIn: "7d" });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      // Fetch the final profile to return
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (fetchError) {
        console.error("Error fetching created profile:", fetchError);
        // If we can't fetch it, we return a basic object since we know it was created
        return res.json({ 
          success: true, 
          user: { id: authData.user.id, email, fullName, role: 'ADMIN' }, 
          accessToken 
        });
      }

      res.json({ success: true, user: profile, accessToken });
    } catch (error: any) {
      console.error("Admin registration exception:", error);
      res.status(500).json({ 
        error: error.message || "Admin registration failed",
        details: error.details || null
      });
    }
  });

  // 2. Parent Registration (via Admission Number)
  app.post("/api/v1/auth/register-parent", async (req, res) => {
    const { admissionNumber, fullName, email, phone, password } = req.body;

    try {
      // 1. Search student in database
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("id, parent_id")
        .eq("admission_number", admissionNumber)
        .single();

      // 2. IF student NOT found
      if (studentError || !student) {
        return res.status(404).json({ error: "Student not found. Please contact school admin." });
      }

      // 3. IF student found, check if student already has parent_id
      if (student.parent_id) {
        return res.status(400).json({ error: "Parent account already registered. Please login." });
      }

      // 4. Create a new parent profile
      const authEmail = email || `parent_${admissionNumber}@buswaypro.local`;

      let authData, authError;
      
      // Try admin API first
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const result = await supabase.auth.admin.createUser({
          email: authEmail,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName, role: 'PARENT', phone, verified: true }
        });
        authData = result.data;
        authError = result.error;
      } else {
        // Fallback to regular signup
        const result = await supabase.auth.signUp({
          email: authEmail,
          password,
          options: {
            data: { full_name: fullName, role: 'PARENT', phone, verified: true }
          }
        });
        authData = result.data;
        authError = result.error;
      }

      if (authError) throw authError;
      if (!authData.user) throw new Error("User creation failed");

      const hashedPassword = await bcrypt.hash(password, 10);

      // Create profile record
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        full_name: fullName,
        email: authEmail,
        phone_number: phone,
        password: hashedPassword,
        role: 'PARENT',
        admission_number: admissionNumber
      });

      if (profileError && profileError.code !== '23505') throw profileError;

      // 5. Link parent with student
      const { error: updateError } = await supabase
        .from("students")
        .update({ parent_id: authData.user.id })
        .eq("admission_number", admissionNumber);

      if (updateError) throw updateError;

      // Auto-login after registration
      const accessToken = jwt.sign({ id: authData.user.id, role: 'PARENT' }, JWT_SECRET, { expiresIn: "1h" });
      const refreshToken = jwt.sign({ id: authData.user.id }, JWT_REFRESH_SECRET, { expiresIn: "7d" });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", authData.user.id).single();
      res.json({ success: true, user: profile, accessToken });
    } catch (error: any) {
      console.error("Parent registration error:", error);
      res.status(500).json({ error: error.message || "Parent registration failed" });
    }
  });

  // 3. Login (Universal)
  app.post("/api/v1/auth/login", authLimiter, async (req, res) => {
    const { identifier, password, type } = req.body;
    console.log(`Login attempt: ${identifier} (Type: ${type})`);
    
    try {
      let email = identifier;
      let profile = null;

      // If logging in via Admission Number
      if (type === 'ADMISSION') {
        // 1. Find student by admission_number
        const { data: student, error: studentError } = await supabase
          .from("students")
          .select("parent_id")
          .eq("admission_number", identifier)
          .single();

        if (studentError || !student) {
          return res.status(401).json({ error: "Admission number not found. Please contact school admin." });
        }

        // 2. If parent_id is NULL
        if (!student.parent_id) {
          return res.status(401).json({ error: "Parent account not registered." });
        }

        // 3. Fetch parent profile from profiles table
        const { data: p, error: pe } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", student.parent_id)
          .single();
          
        if (pe || !p) {
          return res.status(401).json({ error: "Parent profile not found." });
        }
        profile = p;
        email = p.email;
      } 
      // Admin/Generic Login (Email or Phone)
      else if (type === 'ADMIN' || type === 'EMAIL' || type === 'PHONE') {
        // 1. Try to find by Email
        const { data: emailProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", identifier)
          .single();
        
        if (emailProfile) {
          profile = emailProfile;
          email = emailProfile.email;
        } else {
          // 2. Try to find by Phone
          const { data: phoneProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("phone_number", identifier)
            .single();
            
          if (phoneProfile) {
            profile = phoneProfile;
            email = phoneProfile.email;
          }
        }
        
        if (!profile) {
          return res.status(401).json({ error: "Email or phone not found." });
        }
      }

      // Attempt Password Verification
      const isValid = await bcrypt.compare(password, profile.password);

      if (!isValid) {
        console.error("Password mismatch for:", email);
        return res.status(401).json({ error: "Incorrect password." });
      }

      console.log(`Login successful for: ${profile.email} (Role: ${profile.role})`);
      const accessToken = jwt.sign({ id: profile.id, role: profile.role }, JWT_SECRET, { expiresIn: "1h" });
      const refreshToken = jwt.sign({ id: profile.id }, JWT_REFRESH_SECRET, { expiresIn: "7d" });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({ user: profile, accessToken });
    } catch (error: any) {
      console.error("Unexpected login error:", error);
      res.status(500).json({ error: "Internal server error during login" });
    }
  });

  // 3.4 Login via OTP (Legacy/Alternative)
  app.post("/api/v1/auth/login-otp", async (req, res) => {
    const { identifier, type } = req.body;
    try {
      let profile = null;
      if (type === 'ADMISSION') {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("admission_number", identifier)
          .single();
        if (error || !data) return res.status(404).json({ error: "Admission number not found" });
        profile = data;
      } else if (type === 'PHONE') {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("phone_number", identifier)
          .single();
        if (error || !data) return res.status(404).json({ error: "Phone number not found" });
        profile = data;
      }

      if (!profile) {
        return res.status(404).json({ error: "User not found" });
      }

      const accessToken = jwt.sign({ id: profile.id, role: profile.role }, JWT_SECRET, { expiresIn: "1h" });
      const refreshToken = jwt.sign({ id: profile.id }, JWT_REFRESH_SECRET, { expiresIn: "7d" });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({ user: profile, accessToken });
    } catch (error: any) {
      res.status(500).json({ error: "Internal server error during OTP login" });
    }
  });

  // 4. Forgot Password
  app.post("/api/v1/auth/forgot-password-send-otp", async (req, res) => {
    const { identifier, type } = req.body;
    try {
      let phone = '';
      let profileId = '';

      if (type === 'ADMIN') {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("id, phone_number")
          .eq("role", "ADMIN")
          .eq("phone_number", identifier)
          .single();
        if (error || !profile) return res.status(404).json({ error: "Account not found." });
        phone = profile.phone_number;
        profileId = profile.id;
      } else if (type === 'PARENT') {
        const { data: student, error } = await supabase
          .from("students")
          .select("parent_id")
          .eq("admission_number", identifier)
          .single();
        if (error || !student || !student.parent_id) return res.status(404).json({ error: "Account not found." });
        
        const { data: profile, error: pError } = await supabase
          .from("profiles")
          .select("id, phone_number")
          .eq("id", student.parent_id)
          .single();
        if (pError || !profile) return res.status(404).json({ error: "Account not found." });
        phone = profile.phone_number;
        profileId = profile.id;
      }

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

      // Send OTP via Twilio
      const client = getTwilio();
      const from = process.env.TWILIO_PHONE_NUMBER || process.env.VITE_TWILIO_PHONE_NUMBER;
      let formattedPhone = phone.replace(/\D/g, '');
      if (formattedPhone.length === 10) formattedPhone = `+91${formattedPhone}`;
      else if (!formattedPhone.startsWith('+')) formattedPhone = `+${formattedPhone}`;

      await client.messages.create({
        body: `Your School Bus WayPro verification code is: ${otp}`,
        from: from,
        to: formattedPhone
      });

      res.json({ success: true, message: "OTP sent successfully", profileId, phone });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/v1/auth/forgot-password-verify-otp", async (req, res) => {
    const { phone, otp } = req.body;
    const memOtp = otpStore.get(phone);
    if (memOtp && memOtp.otp === otp && memOtp.expiresAt > Date.now()) {
      otpStore.delete(phone);
      return res.json({ success: true });
    }
    res.status(400).json({ error: "Invalid or expired OTP" });
  });

  app.post("/api/v1/auth/reset-password", async (req, res) => {
    const { profileId, newPassword } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const { error } = await supabase
        .from("profiles")
        .update({ password: hashedPassword })
        .eq("id", profileId);
      if (error) throw error;
      res.json({ success: true, message: "Password updated successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 5. Refresh Token
  app.post("/api/v1/auth/refresh", async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    try {
      const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", payload.id)
        .single();
        
      if (profileError || !profile) {
        console.warn(`Profile missing during refresh for ID: ${payload.id}. Attempting recovery...`);
        // If profile is missing, we try to fetch user from Auth to recreate it
        const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(payload.id);
        
        if (authError || !user) {
          console.error("Profile recovery failed during refresh:", authError);
          return res.sendStatus(403);
        }

        const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        const role = user.user_metadata?.role || 'PARENT';

        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email,
            full_name: fullName,
            role: role
          })
          .select()
          .single();

        if (createError) {
          console.error("Failed to recreate profile during refresh:", createError);
          return res.sendStatus(403);
        }
        
        const accessToken = jwt.sign({ id: newProfile.id, role: newProfile.role }, JWT_SECRET, { expiresIn: "1h" });
        return res.json({ user: newProfile, accessToken });
      }

      const accessToken = jwt.sign({ id: profile.id, role: profile.role }, JWT_SECRET, { expiresIn: "1h" });
      res.json({ user: profile, accessToken });
    } catch (err) {
      console.error("Refresh token error:", err);
      res.sendStatus(403);
    }
  });

  // 6. Logout
  app.post("/api/v1/auth/logout", (req, res) => {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.json({ message: "Logged out" });
  });

  // --- RAZORPAY ROUTES ---

  app.post("/api/v1/payments/create-order", authenticateToken, async (req, res) => {
    try {
      const { amount, dueId } = req.body;
      const options = {
        amount: Math.round(amount * 100), // amount in the smallest currency unit
        currency: "INR",
        receipt: `receipt_${dueId}`,
      };
      const rzp = getRazorpay();
      const order = await rzp.orders.create(options);
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/v1/payments/verify", authenticateToken, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dueId } = req.body;
    const user = (req as any).user;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "";
    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      try {
        // Update due status
        const { data: due, error: dueError } = await supabase
          .from("monthly_dues")
          .update({ status: "PAID", paid_at: new Date().toISOString() })
          .eq("id", dueId)
          .select()
          .single();

        if (dueError) throw dueError;

        // Generate receipt
        const receiptNo = `REC-${Date.now()}`;
        await supabase.from("receipts").insert({
          transaction_id: razorpay_payment_id,
          amount: due.amount + due.late_fee,
          student_name: due.student_name,
          month_year: `${due.month}/${due.year}`,
          method: 'ONLINE'
        });

        // Notify parent
        await supabase.from("notifications").insert({
          user_id: user.id,
          title: "Payment Successful",
          message: `Your payment of ₹${due.amount + due.late_fee} for ${due.month}/${due.year} has been received.`,
          type: 'SUCCESS'
        });

        res.json({ success: true, receiptNo });
      } catch (error: any) {
        res.status(500).json({ error: "Failed to update payment status" });
      }
    } else {
      res.status(400).json({ error: "Invalid signature" });
    }
  });

  // Razorpay Webhook
  app.post("/api/v1/webhooks/razorpay", express.raw({ type: "application/json" }), async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
    const signature = req.headers["x-razorpay-signature"] as string;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (expectedSignature === signature) {
      const event = JSON.parse(req.body);
      if (event.event === "payment.captured") {
        // Handle background updates if needed
      }
      res.json({ status: "ok" });
    } else {
      res.status(400).send("Invalid signature");
    }
  });

  // --- DASHBOARD STATS ---
  app.get('/api/v1/dashboard/stats', authenticateToken, async (req, res) => {
    try {
      // 1. Total Collection (Current Month)
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();
      
      const { data: paidDues, error: duesError } = await supabase
        .from('monthly_dues')
        .select('total_due')
        .eq('status', 'PAID')
        .eq('month', month)
        .eq('year', year);

      if (duesError) throw duesError;
      const totalCollection = (paidDues || []).reduce((sum, d) => sum + d.total_due, 0);

      // 2. Active Students
      const { count: activeStudents, error: studentError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (studentError) throw studentError;

      // 3. Defaulters
      const { count: defaulters, error: defaulterError } = await supabase
        .from('monthly_dues')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDING')
        .lt('due_date', new Date().toISOString());

      if (defaulterError) throw defaulterError;

      // 4. Revenue Trend (Last 6 Months)
      const trend = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const m = d.getMonth() + 1;
        const y = d.getFullYear();
        const monthName = d.toLocaleString('default', { month: 'short' });

        const { data: monthDues } = await supabase
          .from('monthly_dues')
          .select('total_due')
          .eq('status', 'PAID')
          .eq('month', m)
          .eq('year', y);
        
        const revenue = (monthDues || []).reduce((sum, d) => sum + d.total_due, 0);
        trend.push({ month: monthName, revenue });
      }

      res.json({
        totalCollection: `₹${(totalCollection / 100000).toFixed(1)}L`,
        activeStudents: activeStudents || 0,
        defaulters: defaulters || 0,
        lateFeeCollected: "₹0", // Placeholder
        revenueTrend: trend,
        paymentHealth: [
          { name: 'Paid', value: (paidDues || []).length, color: '#1e40af' },
          { name: 'Overdue', value: defaulters || 0, color: '#f59e0b' },
          { name: 'Unpaid', value: 0, color: '#ef4444' }, // Placeholder
        ]
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- REPORTS ---
  app.get('/api/v1/reports/defaulters', authenticateToken, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('monthly_dues')
        .select('*, students(full_name, admission_number, route_id, routes(route_name))')
        .eq('status', 'PENDING')
        .lt('due_date', new Date().toISOString());

      if (error) throw error;

      const formattedData = (data || []).map(d => ({
        id: d.id,
        full_name: d.students?.full_name || d.student_name,
        admission_number: d.students?.admission_number || d.admission_number,
        route_name: d.students?.routes?.route_name || 'N/A',
        month: d.month,
        year: d.year,
        total_due: d.total_due
      }));

      res.json(formattedData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- CRUD ROUTES ---

  // Students
  app.get('/api/v1/students', authenticateToken, async (req, res) => {
    const { data, error } = await supabase
      .from('students')
      .select('*, routes(route_name), buses(plate)')
      .order('full_name');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post('/api/v1/students', authenticateToken, async (req, res) => {
    const { data, error } = await supabase
      .from('students')
      .insert([req.body])
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.put('/api/v1/students/:id', authenticateToken, async (req, res) => {
    const { data, error } = await supabase
      .from('students')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.delete('/api/v1/students/:id', authenticateToken, async (req, res) => {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // Buses
  app.get('/api/v1/buses', authenticateToken, async (req, res) => {
    const { data, error } = await supabase
      .from('buses')
      .select('*, routes(route_name)')
      .order('bus_number', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post('/api/v1/buses', authenticateToken, async (req, res) => {
    const { data, error } = await supabase
      .from('buses')
      .insert([req.body])
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.put('/api/v1/buses/:id', authenticateToken, async (req, res) => {
    const { data, error } = await supabase
      .from('buses')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.delete('/api/v1/buses/:id', authenticateToken, async (req, res) => {
    const { error } = await supabase
      .from('buses')
      .delete()
      .eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // Routes
  app.get('/api/v1/routes', authenticateToken, async (req, res) => {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .order('route_name');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post('/api/v1/routes', authenticateToken, async (req, res) => {
    const { data, error } = await supabase
      .from('routes')
      .insert([req.body])
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.put('/api/v1/routes/:id', authenticateToken, async (req, res) => {
    const { data, error } = await supabase
      .from('routes')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.delete('/api/v1/routes/:id', authenticateToken, async (req, res) => {
    const { error } = await supabase
      .from('routes')
      .delete()
      .eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // Monthly Dues
  app.post('/api/v1/dues/generate', authenticateToken, async (req, res) => {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    try {
      // 1. Get all active students
      const { data: students, error: studentError } = await supabase
        .from('students')
        .select('id, base_fee, full_name, admission_number')
        .eq('status', 'active');

      if (studentError) throw studentError;

      // 2. Filter out students who already have dues for this month
      const { data: existingDues, error: existingError } = await supabase
        .from('monthly_dues')
        .select('student_id')
        .eq('month', month)
        .eq('year', year);

      if (existingError) throw existingError;

      const existingStudentIds = new Set(existingDues.map(d => d.student_id));
      const studentsToBill = students.filter(s => !existingStudentIds.has(s.id));

      if (studentsToBill.length === 0) {
        return res.json({ message: "No new dues to generate" });
      }

      // 3. Insert dues
      const duesToInsert = studentsToBill.map(s => ({
        student_id: s.id,
        student_name: s.full_name,
        admission_number: s.admission_number,
        month,
        year,
        amount: s.base_fee,
        total_due: s.base_fee,
        due_date: new Date(year, month - 1, 10).toISOString(),
        last_date: new Date(year, month - 1, 20).toISOString(),
        status: 'PENDING'
      }));

      const { error: insertError } = await supabase
        .from('monthly_dues')
        .insert(duesToInsert);

      if (insertError) throw insertError;

      res.json({ success: true, count: duesToInsert.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/v1/dues', authenticateToken, async (req, res) => {
    const { studentId } = req.query;
    let query = supabase.from('monthly_dues').select('*, students(full_name, admission_number)');
    if (studentId) query = query.eq('student_id', studentId);
    const { data, error } = await query.order('year', { ascending: false }).order('month', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  // Notifications
  app.get('/api/v1/notifications', authenticateToken, async (req, res) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', (req as any).user.id)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.put('/api/v1/notifications/:id/read', authenticateToken, async (req, res) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', req.params.id)
      .eq('user_id', (req as any).user.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // --- MIDDLEWARE ---
  function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      (req as any).user = user;
      next();
    });
  }

  // Attendance
  app.get('/api/v1/attendance', authenticateToken, async (req, res) => {
    const { date, type } = req.query;
    let query = supabase.from('attendance').select('*');
    if (date) query = query.gte('created_at', `${date}T00:00:00`).lte('created_at', `${date}T23:59:59`);
    if (type) query = query.eq('type', type);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post('/api/v1/attendance', authenticateToken, async (req, res) => {
    const { student_id, type, status, marked_by } = req.body;
    const { data, error } = await supabase
      .from('attendance')
      .insert([{ student_id, type, status, marked_by }])
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  // --- VITE / STATIC SERVING ---
  if (!isProd) {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          protocol: 'wss',
          clientPort: 443
        }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
