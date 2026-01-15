const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGO_URL', 'JWT_SECRET'];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} is not defined in environment variables`);
    process.exit(1);
  }
});

const app = express();
const port = process.env.PORT || 5000;

// Database connection
const connectDB = require('./config/db');
connectDB();

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// CORS middleware
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Apply general rate limiter to all routes
app.use('/api/', apiLimiter);

// Routes
app.get('/welcome', (req, res) => {
  res.status(200).json({
    message: 'Welcome to CoinPengin Backend Server',
    version: '2.0.0',
    status: 'running'
  });
});

// User routes
app.use('/api/users', require('./routes/userRoutes'));

// Coin routes (Proxy to CoinGecko)
app.use('/api/coins', require('./routes/coinRoutes'));

// 404 handler - must be after all routes
app.use(notFound);

// Error handler - must be last
app.use(errorHandler);

// Start server
const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
