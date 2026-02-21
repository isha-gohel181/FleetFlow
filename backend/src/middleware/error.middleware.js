/**
 * Global Error Handling Middleware
 * Catches all errors and returns consistent JSON responses
 * Must be registered last in middleware chain
 */
const ApiError = require('../utils/ApiError');

/**
 * Handle Mongoose CastError (invalid ObjectId)
 */
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ApiError(400, message);
};

/**
 * Handle Mongoose Duplicate Key Error
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate value '${value}' for field '${field}'. Please use another value.`;
  return new ApiError(400, message);
};

/**
 * Handle Mongoose Validation Error
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(e => ({
    field: e.path,
    message: e.message
  }));
  const message = 'Validation failed. Please check your input.';
  return new ApiError(400, message, errors);
};

/**
 * Handle JWT Error
 */
const handleJWTError = () => {
  return new ApiError(401, 'Invalid token. Please log in again.');
};

/**
 * Handle JWT Expired Error
 */
const handleJWTExpiredError = () => {
  return new ApiError(401, 'Your token has expired. Please log in again.');
};

/**
 * Send error response in development mode
 * Includes full error details and stack trace
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    errors: err.errors || [],
    stack: err.stack,
    error: err
  });
};

/**
 * Send error response in production mode
 * Only includes essential error information
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      errors: err.errors || []
    });
  } else {
    // Programming or unknown error: don't leak details
    console.error('ERROR 💥:', err);
    
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went wrong. Please try again later.'
    });
  }
};

/**
 * Global error handler middleware
 * Processes all errors and returns appropriate responses
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (err.name === 'CastError') error = handleCastError(err);
    if (err.code === 11000) error = handleDuplicateKeyError(err);
    if (err.name === 'ValidationError') error = handleValidationError(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

/**
 * 404 Not Found handler
 * Catches requests to undefined routes
 */
const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
};

module.exports = { errorHandler, notFound };
