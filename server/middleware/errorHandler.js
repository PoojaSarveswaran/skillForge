const { ValidationError } = require('../utils/validators');

class NotFoundError extends Error {
  constructor(message = 'Resource not found.') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class ConflictError extends Error {
  constructor(message = 'Request conflicts with current state.') {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: `No route matches ${req.method} ${req.originalUrl}` });
}

// Centralized error handler — never leaks stack traces, SQL text, or
// credentials to the client.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({ error: err.message, fields: err.fields });
  }
  if (err.statusCode && err.statusCode < 500) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'A record with that value already exists.' });
  }
  if (err.code && String(err.code).startsWith('ER_')) {
    console.error('Database error:', err.message);
    return res.status(500).json({ error: 'A database error occurred. Please try again.' });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({ error: 'An unexpected server error occurred.' });
}

module.exports = { notFoundHandler, errorHandler, NotFoundError, ConflictError };
