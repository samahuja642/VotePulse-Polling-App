import pool from '../../config/db.js';

export const insertPoll = async (client, { creatorId, title, description, isPublic, multiVote, expiresAt }) => {
  const { rows } = await client.query(
    `INSERT INTO polls (creator_id, title, description, is_public, multi_vote, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, creator_id, title, description, is_public, multi_vote, status, expires_at, created_at`,
    [creatorId, title, description, isPublic, multiVote, expiresAt || null],
  );
  return rows[0];
};

export const insertOptions = async (client, pollId, options) => {
  const values = [];
  const params = [];
  options.forEach((text, i) => {
    const offset = i * 3;
    values.push(`($${offset + 1}, $${offset + 2}, $${offset + 3})`);
    params.push(pollId, text, i);
  });

  const { rows } = await client.query(
    `INSERT INTO options (poll_id, text, position)
     VALUES ${values.join(', ')}
     RETURNING id, poll_id, text, position`,
    params,
  );
  return rows;
};

export const getClient = () => pool.connect();
