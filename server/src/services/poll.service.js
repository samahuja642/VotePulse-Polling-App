import { AppError } from '../utils/AppError.js';
import { parsePagination, buildPagination } from '../utils/pagination.js';
import {
  getClient,
  insertPoll,
  insertOptions,
  findMyPolls,
  findPollById,
  findOptionsByPollId,
} from '../db/queries/poll.queries.js';

export const createPoll = async (creatorId, data) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const poll = await insertPoll(client, {
      creatorId,
      title: data.title,
      description: data.description,
      isPublic: data.is_public,
      multiVote: data.multi_vote,
      showResults: data.show_results,
      expiresAt: data.expires_at,
    });

    const options = await insertOptions(client, poll.id, data.options);

    await client.query('COMMIT');

    return { ...poll, options };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const getMyPolls = async (userId, query) => {
  const { page, limit, offset } = parsePagination(query);
  const { polls, total } = await findMyPolls(userId, { limit, offset });

  return { polls, pagination: buildPagination({ page, limit, total }) };
};

export const getPollById = async (pollId) => {
  const poll = await findPollById(pollId);
  if (!poll) {
    throw AppError.notFound('Poll not found');
  }

  const options = await findOptionsByPollId(pollId);
  return { ...poll, options };
};
