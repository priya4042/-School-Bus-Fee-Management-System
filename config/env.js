export const ENV = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  OTP_PROVIDER: import.meta.env.VITE_OTP_PROVIDER || "MSG91",
  MSG91_AUTH_KEY: import.meta.env.VITE_MSG91_AUTH_KEY || "",
  MSG91_TEMPLATE_ID: import.meta.env.VITE_MSG91_TEMPLATE_ID || "",
  MSG91_SENDER_ID: import.meta.env.VITE_MSG91_SENDER_ID || "",
  RAZORPAY_KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
  RAZORPAY_KEY_SECRET: import.meta.env.VITE_RAZORPAY_KEY_SECRET || "",
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  CAMERA_STREAM_BASE_URL: import.meta.env.VITE_CAMERA_STREAM_BASE_URL || ""
};

const missingKeys = [];
if (!ENV.SUPABASE_URL) missingKeys.push("SUPABASE_URL");
if (!ENV.MSG91_AUTH_KEY) missingKeys.push("MSG91_AUTH_KEY");
if (!ENV.RAZORPAY_KEY_ID) missingKeys.push("RAZORPAY_KEY_ID");
if (!ENV.GOOGLE_MAPS_API_KEY) missingKeys.push("GOOGLE_MAPS_API_KEY");

if (missingKeys.length > 0) {
  console.warn("⚠️ Missing API Keys in Environment Configuration:", missingKeys.join(", "));
  console.warn("Please add these keys to your environment variables for full functionality.");
}
