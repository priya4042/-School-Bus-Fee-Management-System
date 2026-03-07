import express from 'express';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Load environment variables
import dotenv from 'dotenv';
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
  const PORT = process.env.PORT || 3000;

  // Middleware
  app.use(express.json());
  
  // CORS configuration
  app.use(cors({
    origin: '*', // Allow all origins for now to fix connection issues
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
  }));

  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
  });

  // Mount backend routes
  // We use try-catch to avoid crashing if a specific route file has issues
  try {
    const authRoutes = require('./backend/routes/auth');
    app.use('/api/auth', authRoutes);
    
    const otpRoutes = require('./backend/routes/otp');
    app.use('/api/otp', otpRoutes);

    const studentRoutes = require('./backend/routes/students');
    app.use('/api/students', studentRoutes);

    const busRoutes = require('./backend/routes/buses');
    app.use('/api/buses', busRoutes);

    const routeRoutes = require('./backend/routes/routes');
    app.use('/api/routes', routeRoutes);

    const feeRoutes = require('./backend/routes/fees');
    app.use('/api/fees', feeRoutes);

    const paymentRoutes = require('./backend/routes/payments');
    app.use('/api/payments', paymentRoutes);

    // const notificationRoutes = require('./backend/routes/notifications'); 
    // app.use('/api/notifications', notificationRoutes); 

    const attendanceRoutes = require('./backend/routes/attendance');
    app.use('/api/attendance', attendanceRoutes);

    const userRoutes = require('./backend/routes/users');
    app.use('/api/users', userRoutes);

    const receiptRoutes = require('./backend/routes/receipts');
    app.use('/api/receipts', receiptRoutes);

  } catch (error) {
    console.error('Failed to load backend routes:', error);
  }

  // Vite middleware (only in development)
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
    
    // Root route for production (API backend status)
    app.get('/', (req, res) => {
      res.send('School Bus Fee Management System Backend is Running');
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
