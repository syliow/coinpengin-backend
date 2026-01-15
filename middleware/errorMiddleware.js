/**
 * Centralized error handling middleware
 */

/**
 * Error handler middleware
 * Catches all errors and returns a consistent JSON response
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  // Default to 500 server error
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err.message,
    // Only provide stack trace in development
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

/**
 * 404 Not Found handler
 * Must be placed after all routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = {
  errorHandler,
  notFound
};
