import * as voteService from '../services/vote.service.js';
import { getVoteCounts, findUserVotes } from '../db/queries/vote.queries.js';
import { findPollById } from '../db/queries/poll.queries.js';
import { AppError } from '../utils/AppError.js';

export const castVote = async (req, res, next) => {
  try {
    const pollId = req.params.id;
    const { option_ids, guest_token, device_hash } = req.validatedBody;
    const userId = req.user?.id || null;
    const guestToken = guest_token || null;
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0].trim() ?? req.ip ?? null;

    const { votes, results } = await voteService.castVote(
      pollId,
      option_ids,
      userId,
      guestToken,
      device_hash || null,
      ipAddress,
    );

    req.app.get('io').to(`poll:${pollId}`).emit('vote:new', { results });

    res.status(201).json({ success: true, data: { votes, results } });
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

    const votes = await findUserVotes(pollId, userId, guestToken);

    res.status(200).json({
      success: true,
      data: { voted: votes.length > 0, votes },
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
    const totalVotes = results.reduce((sum, r) => sum + r.count, 0);
    const resultsWithPercentages = results.map((r) => ({
      ...r,
      percentage: totalVotes > 0 ? parseFloat((r.count / totalVotes * 100).toFixed(1)) : 0,
    }));
    res.status(200).json({ success: true, data: resultsWithPercentages });
  } catch (err) {
    next(err);
  }
};
