# BusWay Pro Enterprise - Production Deployment Guide

This guide outlines the steps to deploy the BusWay Pro Enterprise system for real-world school use.

## 1. Razorpay Configuration
1.  **Dashboard**: Login to [Razorpay Dashboard](https://dashboard.razorpay.com).
2.  **API Keys**: Generate `Key ID` and `Key Secret` from Settings > API Keys.
3.  **Webhooks**:
    *   URL: `https://your-api-domain.com/api/payments/webhook`
    *   Secret: Generate a strong random string for `RAZORPAY_WEBHOOK_SECRET`.
    *   Events: Select `payment.captured`.
4.  **Idempotency**: The system uses `razorpay_order_id` to prevent duplicate processing.

## 2. Twilio Configuration
1.  **Account**: Get your `Account SID` and `Auth Token` from [Twilio Console](https://www.twilio.com/console).
2.  **Phone Number**: Purchase a SMS-enabled phone number.
3.  **Messaging Service**: (Optional) Create a Messaging Service for better delivery.

## 3. Supabase Configuration
1.  **Project**: Create a new project on [Supabase](https://supabase.com).
2.  **Schema**: Run the provided `schema.sql` in the SQL Editor.
3.  **RLS**: Ensure Row Level Security is enabled on sensitive tables (`users`, `students`, `payments`).
4.  **Service Role Key**: Use the `service_role` key for backend operations.

## 4. Google Maps API
1.  **Cloud Console**: Enable "Maps SDK for Android" and "Maps JavaScript API".
2.  **API Key**: Generate an API key and restrict it to your app's package name/domain.

## 5. Backend Deployment (VPS/Render)
1.  **Environment Variables**: Set all variables from `.env.production`.
2.  **Build**: Run `npm run build`.
3.  **Start**: Use a process manager like PM2: `pm2 start dist/server.js`.
4.  **SSL**: Ensure HTTPS is enabled (using Nginx + Certbot or Cloudflare).

## 6. Mobile App (Android)
1.  **EAS Build**: Use `eas build -p android` to generate an `.aab` file.
2.  **Play Store**:
    *   Upload `.aab` to Google Play Console.
    *   Provide Privacy Policy URL (`https://your-domain.com/legal/privacy`).
    *   Complete the "Data Safety" section (mention location and contact info collection).

## 7. Production Checklist
- [ ] `NODE_ENV` set to `production`.
- [ ] `APP_URL` matches your live domain.
- [ ] Razorpay Webhook Secret verified.
- [ ] Twilio SMS credits available.
- [ ] Google Maps API restrictions active.
- [ ] Database backups scheduled.
- [ ] SSL certificate active.

---
**Support**: contact@busway.pro
**Version**: 2.0.0-enterprise
