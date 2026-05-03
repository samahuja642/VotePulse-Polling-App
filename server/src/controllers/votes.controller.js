import * as voteService from '../services/vote.service.js';
import { getVoteCounts, findUserVote } from '../db/queries/vote.queries.js';
import { findPollById } from '../db/queries/poll.queries.js';
import { AppError } from '../utils/AppError.js';

export const castVote = async (req, res, next) => {
  try {
    const pollId = req.params.id;
    const { option_id, guest_token, device_hash } = req.validatedBody;
    const userId = req.user?.id || null;
    const guestToken = guest_token || null;
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0].trim() ?? req.ip ?? null;

    const { vote, results } = await voteService.castVote(
      pollId,
      option_id,
      userId,
      guestToken,
      device_hash || null,
      ipAddress,
    );

    req.app.get('io').to(`poll:${pollId}`).emit('vote:new', { results });

    res.status(201).json({ success: true, data: { vote, results } });
  } catch (err) {
    next(err);
  }
};

export const checkVote = async (req, res, next) => {
  try {
    const pollId = req.params.id;
    const userId = req.user?.id || null;
    const guestToken = req.query.guest_token || null;

    if (!userId && !guestToken) {
      throw AppError.badRequest('Authentication or guest token required');
    }

    const vote = await findUserVote(pollId, userId, guestToken);

    res.status(200).json({
      success: true,
      data: { voted: !!vote, vote: vote || null },
    });
  } catch (err) {
    next(err);
  }
};

export const getResults = async (req, res, next) => {
  try {
    const pollId = req.params.id;

    const poll = await findPollById(pollId);
    if (!poll) {
      throw AppError.notFound('Poll not found');
    }
    const isOwner = req.user?.id === poll.creator_id;
    if (!isOwner && !poll.show_results) {
      throw AppError.forbidden('Only the poll owner can view results');
    }

    const results = await getVoteCounts(pollId);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
};
