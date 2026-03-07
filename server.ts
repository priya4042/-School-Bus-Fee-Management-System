import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Remove dummy env vars to allow backend/config/supabase.js to detect missing keys
// if (!process.env.SUPABASE_URL) process.env.SUPABASE_URL = 'https://placeholder.supabase.co';
// if (!process.env.SUPABASE_SERVICE_ROLE_KEY) process.env.SUPABASE_SERVICE_ROLE_KEY = 'placeholder-key';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());
  
  // CORS (simplified for dev)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
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

    const notificationRoutes = require('./backend/routes/notifications'); // Note: File might not exist, check first
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

  // Vite middleware
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
