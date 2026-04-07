import { AppError } from '../utils/AppError.js';
import {
  findPollForVoting,
  findOptionByIdAndPoll,
  findUserVote,
  insertVote,
  getVoteCounts,
} from '../db/queries/vote.queries.js';

export const castVote = async (pollId, optionId, userId, guestToken) => {
  // 1. Poll exists?
  const poll = await findPollForVoting(pollId);
  if (!poll) {
    throw AppError.notFound('Poll not found');
  }

  // 2. Poll open?
  if (poll.status !== 'open') {
    throw AppError.badRequest('This poll is closed');
  }

  // 3. Poll not expired?
  if (poll.expires_at && new Date(poll.expires_at) <= new Date()) {
    throw AppError.badRequest('This poll has expired');
  }

  // 4. Option belongs to poll?
  const option = await findOptionByIdAndPoll(optionId, pollId);
  if (!option) {
    throw AppError.notFound('Option not found for this poll');
  }

  // 5. Must have either userId or guestToken
  if (!userId && !guestToken) {
    throw AppError.badRequest('Authentication or guest token required');
  }

  // 6. Already voted? (app-level pre-check)
  const existingVote = await findUserVote(pollId, userId, guestToken);
  if (existingVote) {
    throw AppError.conflict('You have already voted on this poll');
  }

  // 7. Insert vote — DB unique constraint as safety net for race conditions
  try {
    const vote = await insertVote(pollId, optionId, userId, guestToken);
    const results = await getVoteCounts(pollId);
    return { vote, results };
  } catch (err) {
    if (err.code === '23505') {
      throw AppError.conflict('You have already voted on this poll');
    }
    throw err;
  }
};
