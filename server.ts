import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// 1. Load environment variables BEFORE anything else
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try loading from root .env
const envPath = path.resolve(__dirname, ".env");
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn(`[BusWay Pro] Warning: Could not find .env at ${envPath}. Falling back to system environment variables.`);
} else {
  console.log(`[BusWay Pro] Successfully loaded environment from ${envPath}`);
}

// 2. Startup Validation
const REQUIRED_ENV_VARS = ["MASTER_ADMIN_SECRET", "SUPABASE_URL"];
const missingVars = REQUIRED_ENV_VARS.filter(v => !process.env[v]);

// Check for at least one supabase key
if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_ANON_KEY) {
  missingVars.push("SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY");
}

if (missingVars.length > 0) {
  console.error("\x1b[31m%s\x1b[0m", "CRITICAL ERROR: Missing required environment variables:");
  missingVars.forEach(v => console.error(` - ${v}`));
  console.error("\x1b[31m%s\x1b[0m", "Please check your .env file or platform settings.");
  console.error("\x1b[31m%s\x1b[0m", "Server stopping...");
  process.exit(1);
}

const MASTER_ADMIN_SECRET = process.env.MASTER_ADMIN_SECRET!;
console.log(`[BusWay Pro] Environment validated.`);
console.log(`[BusWay Pro] Master Secret starts with: ${MASTER_ADMIN_SECRET.substring(0, 3)}... (Length: ${MASTER_ADMIN_SECRET.length})`);

import express from "express";
import { createServer as createViteServer } from "vite";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./src/routes/auth.js";
import paymentRouter from "./src/routes/payments.js";
import adminRouter from "./src/routes/admin.js";
import trackingRouter from "./src/routes/tracking.js";
import parentRouter from "./src/routes/parent.js";
import legalRouter from "./src/routes/legal.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security Middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for Vite dev
  }));
  app.use(cors({
    origin: process.env.APP_URL || true,
    credentials: true
  }));

  // Razorpay webhook needs raw body BEFORE json middleware
  app.use("/api/payments/webhook", express.raw({ type: 'application/json' }));
  app.use(express.json());
  app.use(cookieParser());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/payments", paymentRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/tracking", trackingRouter);
  app.use("/api/parent", parentRouter);
  app.use("/legal", legalRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("[BusWay Pro] Starting in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false, // Platform disables HMR
        watch: {
          usePolling: true,
          interval: 100
        }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    console.log("[BusWay Pro] Starting in production mode...");
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  // 5. Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("\x1b[31m%s\x1b[0m", "[Global Error Handler]");
    console.error(err.stack);
    
    const statusCode = err.status || 500;
    res.status(statusCode).json({
      success: false,
      error: err.message || "Internal Server Error",
      message: err.message || "Internal Server Error",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[BusWay Pro] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("\x1b[31m%s\x1b[0m", "CRITICAL: Failed to start server:");
  console.error(err);
  process.exit(1);
});
