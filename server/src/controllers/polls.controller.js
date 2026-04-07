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

export const getMyPolls = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const data = await pollService.getMyPolls(req.user.id, { page, limit });
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getPollById = async (req, res, next) => {
  try {
    const poll = await pollService.getPollById(req.params.id);
    res.status(200).json({ success: true, data: poll });
  } catch (err) {
    next(err);
  }
};

export const updatePoll = notImplemented;
export const deletePoll = notImplemented;
