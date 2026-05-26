import * as pollService from '../services/poll.service.js';

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
    const { page, limit, search } = req.query;
    const data = await pollService.getMyPolls(req.user.id, { page, limit, search });
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

export const updatePoll = async (req, res, next) => {
  try {
    const poll = await pollService.togglePollStatus(req.params.id, req.user.id, req.validatedBody.status);
    res.status(200).json({ success: true, data: poll });
  } catch (err) {
    next(err);
  }
};
export const getPublicPolls = async (req, res, next) => {
  try {
    const { page, limit, sort, search } = req.query;
    const data = await pollService.getPublicPolls({ page, limit, sort, search });
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const deletePoll = async (req, res, next) => {
  try {
    await pollService.deletePoll(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};
