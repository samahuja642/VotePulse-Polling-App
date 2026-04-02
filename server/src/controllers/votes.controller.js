const notImplemented = (_req, res) => {
  res.status(501).json({
    success: false,
    error: { message: 'Not implemented', code: 'NOT_IMPLEMENTED' },
  });
};

export const castVote = notImplemented;
export const getResults = notImplemented;
