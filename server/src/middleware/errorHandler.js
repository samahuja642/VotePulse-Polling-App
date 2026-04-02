export const notFoundHandler = (req, res, _next) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.originalUrl} not found`,
      code: 'NOT_FOUND',
    },
  });
};

export const errorHandler = (err, _req, res, _next) => {
  console.error(err.stack || err.message);

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: err.code || 'INTERNAL_ERROR',
    },
  });
};
