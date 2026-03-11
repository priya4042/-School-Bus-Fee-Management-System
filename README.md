
# 🚌 BusWay Pro: Deployment Fix

If Vercel is not showing a deployment, check these **Project Settings** in your Vercel Dashboard:

## 🛠️ Vercel Dashboard Checklist
1.  **Framework Preset**: Ensure "Vite" is selected.
2.  **Root Directory**: Should be `./` (the default).
3.  **Build Command**: `npm run build`
4.  **Output Directory**: `dist`
5.  **Environment Variables**:
    *   `VITE_API_BASE_URL` = Your Render Backend URL (e.g., `https://busway-backend-9maw.onrender.com`)
    *   `VITE_APP_URL` = Your deployed frontend URL (e.g., `https://your-project.vercel.app`)
    *   `VITE_AUTH_REDIRECT_URL` = Password reset redirect URL (e.g., `https://your-project.vercel.app/forgot-password`)

## 🚀 To Trigger a New Build
1.  Commit the new `vercel.json` file.
2.  Push to GitHub.
3.  Vercel will automatically detect the new file and start a fresh deployment.

## 🔗 Live URLs (Examples)
- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-api.onrender.com`

## 🔐 Credentials
- **Login**: `admin@school.com`
- **Password**: `admin123`

## ✅ Play Store + Production Release Checklist
1. Set production env values in `.env.production` and your hosting dashboard.
2. Add Supabase Auth redirect URLs (`Site URL` + `Redirect URLs`) to match `VITE_APP_URL` and `VITE_AUTH_REDIRECT_URL`.
3. Keep Render backend on a non-sleeping plan for stable login/payment flows.
4. Set backend CORS envs: `FRONTEND_URL` and `FRONTEND_URLS`.
5. Verify account deletion works from Profile (`Delete Account`) before submission.
6. Ensure Privacy Policy URL and Terms URL are publicly reachable from the app.
7. Complete Play Console Data Safety form accurately (location, contact info, payments, auth data).
8. Build Android app using `npm run android:build` and generate signed release in Android Studio.
