const notImplemented = (_req, res) => {
  res.status(501).json({
    success: false,
    error: { message: 'Not implemented', code: 'NOT_IMPLEMENTED' },
  });
};

export const register = notImplemented;
export const login = notImplemented;
export const getMe = notImplemented;
