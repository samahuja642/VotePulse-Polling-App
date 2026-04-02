const notImplemented = (_req, res) => {
  res.status(501).json({
    success: false,
    error: { message: 'Not implemented', code: 'NOT_IMPLEMENTED' },
  });
};

export const createPoll = notImplemented;
export const getPublicPolls = notImplemented;
export const getMyPolls = notImplemented;
export const getPollById = notImplemented;
export const updatePoll = notImplemented;
export const deletePoll = notImplemented;
