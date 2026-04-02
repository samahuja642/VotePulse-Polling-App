export const requireAuth = (req, res, next) => {
  // TODO: Implement JWT verification in Step 2
  res.status(501).json({
    success: false,
    error: { message: 'Not implemented', code: 'NOT_IMPLEMENTED' },
  });
};
