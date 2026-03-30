class ApiError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message
   * @param {object} [details]
   */
  constructor(statusCode, message, details) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized', details) {
    super(401, message, details);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden', details) {
    super(403, message, details);
    this.name = 'ForbiddenError';
  }
}

class NotFoundError extends ApiError {
  constructor(message = 'Not found', details) {
    super(404, message, details);
    this.name = 'NotFoundError';
  }
}

class BadRequestError extends ApiError {
  constructor(message = 'Bad request', details) {
    super(400, message, details);
    this.name = 'BadRequestError';
  }
}

class ConflictError extends ApiError {
  constructor(message = 'Conflict', details) {
    super(409, message, details);
    this.name = 'ConflictError';
  }
}

/**
 * PUBLIC_INTERFACE
 * Express error handler that maps ApiError instances to JSON responses.
 */
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      details: err.details,
    });
  }

  // Zod validation errors
  if (err && err.name === 'ZodError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation error',
      details: err.issues,
    });
  }

  // Postgres unique violation
  if (err && err.code === '23505') {
    return res.status(409).json({
      status: 'error',
      message: 'Conflict',
      details: {
        constraint: err.constraint,
      },
    });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
}

module.exports = {
  ApiError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  errorHandler,
};
