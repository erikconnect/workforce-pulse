import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/database.js';
import { seedDatabase } from './utils/seeder.js';
import { scheduleDataPopulation } from './services/dataPopulationOrchestrator.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import routes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendEnvPath = path.resolve(__dirname, '..', '.env');
const rootEnvLocalPath = path.resolve(__dirname, '..', '..', '.env.local');

// Load backend .env first, then root .env.local overriding values when present.
dotenv.config({ path: backendEnvPath });
dotenv.config({ path: rootEnvLocalPath, override: true });

const app = express();
const PORT = process.env.PORT || 5000;
const API_VERSION = process.env.API_VERSION || 'v1';
const DATA_SYNC_INTERVAL_MINUTES = parseInt(process.env.DATA_SYNC_INTERVAL_MINUTES) || 60;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use(`/api/${API_VERSION}`, routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

async function startServer() {
  try {
    await connectDB();
    await seedDatabase();

    // Start data population scheduler
    scheduleDataPopulation(DATA_SYNC_INTERVAL_MINUTES);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      console.log(`📡 API available at http://localhost:${PORT}/api/${API_VERSION}`);
      console.log(`📊 Admin endpoints available at http://localhost:${PORT}/api/${API_VERSION}/admin`);
    });
  } catch (err) {
    console.error('❌ Server startup failed:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

startServer();

export default app;
