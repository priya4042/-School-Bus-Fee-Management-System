
# 🚌 BusWay Pro: Deployment Fix

If Vercel is not showing a deployment, check these **Project Settings** in your Vercel Dashboard:

## 🛠️ Vercel Dashboard Checklist
1.  **Framework Preset**: Ensure "Vite" is selected.
2.  **Root Directory**: Should be `./` (the default).
3.  **Build Command**: `npm run build`
4.  **Output Directory**: `dist`
5.  **Environment Variables**:
    *   `VITE_API_URL` = Your Render Backend URL (e.g., `https://busway-api.onrender.com/api/v1`)

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
