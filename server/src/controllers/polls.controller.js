import * as pollService from '../services/poll.service.js';

const notImplemented = (_req, res) => {
  res.status(501).json({
    success: false,
    error: { message: 'Not implemented', code: 'NOT_IMPLEMENTED' },
  });
};

export const createPoll = async (req, res, next) => {
  try {
    const poll = await pollService.createPoll(req.user.id, req.validatedBody);
    res.status(201).json({ success: true, data: poll });
  } catch (err) {
    next(err);
  }
};
export const getPublicPolls = notImplemented;
export const getMyPolls = notImplemented;
export const getPollById = notImplemented;
export const updatePoll = notImplemented;
export const deletePoll = notImplemented;
