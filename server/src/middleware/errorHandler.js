import { ErrorCode } from '../utils/errorCodes.js';

export const notFoundHandler = (req, res, _next) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.originalUrl} not found`,
      code: ErrorCode.NOT_FOUND,
    },
  });
};

export const errorHandler = (err, _req, res, _next) => {
  // Already sent — nothing to do
  if (res.headersSent) return;

  // JSON parse error (malformed request body)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid JSON in request body', code: ErrorCode.INVALID_JSON },
    });
  }

  // Payload too large
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: { message: 'Request body too large', code: ErrorCode.PAYLOAD_TOO_LARGE },
    });
  }

  // Known AppError — pass through
  if (err.statusCode && err.statusCode < 500) {
    const body = {
      success: false,
      error: { message: err.message, code: err.code || ErrorCode.BAD_REQUEST },
    };
    if (err.details) body.error.details = err.details;
    return res.status(err.statusCode).json(body);
  }

  // PostgreSQL unique-constraint violation
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: { message: 'A record with that value already exists', code: ErrorCode.DUPLICATE },
    });
  }

  // PostgreSQL foreign-key violation
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      error: { message: 'Referenced record does not exist', code: ErrorCode.FK_VIOLATION },
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid token', code: ErrorCode.INVALID_TOKEN },
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: { message: 'Token has expired', code: ErrorCode.TOKEN_EXPIRED },
    });
  }

  // Unexpected error — log and return generic message
  console.error(err.stack || err.message);

  res.status(500).json({
    success: false,
    error: { message: 'Internal server error', code: ErrorCode.INTERNAL_ERROR },
  });
};
