import { getClient, insertPoll, insertOptions } from '../db/queries/poll.queries.js';

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
