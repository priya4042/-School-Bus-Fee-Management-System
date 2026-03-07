import express from 'express';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Load environment variables from .env first
dotenv.config();

// Also try loading .env.production if .env is missing or empty
if (!process.env.VITE_SUPABASE_URL) {
  dotenv.config({ path: '.env.production' });
}

// Map VITE_ variables to backend variables if missing
if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL) {
  process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL;
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Using VITE_SUPABASE_ANON_KEY as fallback for SUPABASE_SERVICE_ROLE_KEY');
  process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
}
if (!process.env.TWILIO_ACCOUNT_SID && process.env.VITE_TWILIO_ACCOUNT_SID) {
  process.env.TWILIO_ACCOUNT_SID = process.env.VITE_TWILIO_ACCOUNT_SID;
}
if (!process.env.TWILIO_AUTH_TOKEN && process.env.VITE_TWILIO_AUTH_TOKEN) {
  process.env.TWILIO_AUTH_TOKEN = process.env.VITE_TWILIO_AUTH_TOKEN;
}
if (!process.env.TWILIO_PHONE_NUMBER && process.env.VITE_TWILIO_PHONE_NUMBER) {
  process.env.TWILIO_PHONE_NUMBER = process.env.VITE_TWILIO_PHONE_NUMBER;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000; // Convert to number

  // Middleware
  app.use(express.json());

  // CORS configuration
  app.use(
    cors({
      origin: '*', // Allow all origins
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    })
  );

  // Health check route
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
  });

  // Mount backend routes safely
  const routeFiles: { path: string; prefix: string }[] = [
    { path: './backend/routes/auth', prefix: '/api/auth' },
    { path: './backend/routes/otp', prefix: '/api/otp' },
    { path: './backend/routes/students', prefix: '/api/students' },
    { path: './backend/routes/buses', prefix: '/api/buses' },
    { path: './backend/routes/routes', prefix: '/api/routes' },
    { path: './backend/routes/fees', prefix: '/api/fees' },
    { path: './backend/routes/payments', prefix: '/api/payments' },
    { path: './backend/routes/notifications', prefix: '/api/notifications' },
    { path: './backend/routes/attendance', prefix: '/api/attendance' },
    { path: './backend/routes/users', prefix: '/api/users' },
    { path: './backend/routes/receipts', prefix: '/api/receipts' },
  ];

  for (const route of routeFiles) {
    try {
      const router = require(route.path);
      app.use(route.prefix, router);
    } catch (err) {
      console.warn(`Warning: Could not load route ${route.path}. Skipping.`, err);
    }
  }

  // Vite middleware (development only)
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('Vite middleware enabled for development');
    } catch (err) {
      console.warn('Vite not found or failed to load. Skipping Vite middleware.');
    }
  } else {
    console.log('Running in production mode. Vite middleware disabled.');

    // Root route for production
    app.get('/', (_req, res) => {
      res.send('School Bus Fee Management System Backend is Running');
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});