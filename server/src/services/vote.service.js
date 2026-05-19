import crypto from 'crypto';
import { AppError } from '../utils/AppError.js';
import {
  findPollForVoting,
  findOptionByIdAndPoll,
  findUserVotes,
  findVoteByFingerprint,
  insertVote,
  getVoteCounts,
} from '../db/queries/vote.queries.js';

export const castVote = async (pollId, optionIds, userId, guestToken, deviceHash, ipAddress) => {
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

  // 4. Multi-vote check
  if (!poll.multi_vote && optionIds.length > 1) {
    throw AppError.badRequest('This poll only allows a single choice');
  }

  // 5. All options belong to poll?
  for (const optionId of optionIds) {
    const option = await findOptionByIdAndPoll(optionId, pollId);
    if (!option) {
      throw AppError.notFound('Option not found for this poll');
    }
  }

  // 6. Must have either userId or guestToken
  if (!userId && !guestToken) {
    throw AppError.badRequest('Authentication or guest token required');
  }

  // 7. Already voted? (app-level pre-check: identity)
  const existingVotes = await findUserVotes(pollId, userId, guestToken);
  if (existingVotes.length > 0) {
    throw AppError.conflict('You have already voted on this poll');
  }

  // 8. Fingerprint check (device + IP hash, guests only)
  let fingerprint = null;
  if (!userId && deviceHash && ipAddress) {
    fingerprint = crypto.createHash('sha256').update(`${deviceHash}|${ipAddress}`).digest('hex');
    const fpVote = await findVoteByFingerprint(pollId, fingerprint);
    if (fpVote) {
      throw AppError.conflict('A vote has already been cast from this device');
    }
  }

  // 9. Insert votes — DB unique constraint as safety net for race conditions
  try {
    const votes = [];
    for (const optionId of optionIds) {
      const vote = await insertVote(pollId, optionId, userId, guestToken, fingerprint);
      votes.push(vote);
    }
    const results = await getVoteCounts(pollId);
    return { votes, results };
  } catch (err) {
    if (err.code === '23505') {
      throw AppError.conflict('You have already voted on this poll');
    }
    throw err;
  }
};
