import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { CacheService } from './services/cache.service';
// Import routes
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import reviewRoutes from './routes/review.routes';

// Load environment variables
dotenv.config();

/**
 * Initialize Express application
 */
const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Configure middlewares for security and functionality
 */
// Enable CORS for frontend requests
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add security headers
app.use(helmet());

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(morgan('dev'));

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'AgroMark API is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * API Routes
 * Register different route modules here
 */
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

/**
 * Error handling middleware
 */
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

/**
 * 404 handler for undefined routes
 */
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

/**
 * Initialize Redis cache service
 */
const initializeCache = async () => {
  try {
    await CacheService.init();
    console.log('✅ Redis cache initialized');
  } catch (error) {
    console.error('⚠️ Failed to initialize Redis cache:', error);
    console.warn('⚠️ Application will continue without caching');
  }
};

/**
 * Start the server
 */
const startServer = async () => {
  // Initialize services
  await initializeCache();
  
  // Start the Express server
  app.listen(PORT, () => {
    console.log(`⚡️ Server is running at http://localhost:${PORT}`);
    console.log(`🔋 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await CacheService.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await CacheService.close();
  process.exit(0);
});

// Start the server
startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app; 