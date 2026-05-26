import pool from '../../config/db.js';

export const insertPoll = async (client, { creatorId, title, description, isPublic, multiVote, showResults, expiresAt }) => {
  const { rows } = await client.query(
    `INSERT INTO polls (creator_id, title, description, is_public, multi_vote, show_results, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, creator_id, title, description, is_public, multi_vote, show_results, status, expires_at, created_at`,
    [creatorId, title, description, isPublic, multiVote, showResults, expiresAt || null],
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

export const findMyPolls = async (userId, { limit, offset, search }) => {
  const conditions = ['p.creator_id = $1', 'p.deleted_at IS NULL'];
  const params = [userId];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(p.title ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
  }

  const where = conditions.join(' AND ');

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM polls p WHERE ${where}`,
    params,
  );

  params.push(limit, offset);
  const limitIdx = params.length - 1;
  const offsetIdx = params.length;

  const { rows } = await pool.query(
    `SELECT p.id, p.title, p.description, p.is_public, p.status, p.expires_at, p.created_at,
            COUNT(v.id)::int AS vote_count
     FROM polls p
     LEFT JOIN votes v ON v.poll_id = p.id
     WHERE ${where}
     GROUP BY p.id
     ORDER BY p.created_at DESC
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    params,
  );

  return { polls: rows, total: countResult.rows[0].total };
};

export const findPollById = async (pollId) => {
  const { rows } = await pool.query(
    `SELECT p.id, p.creator_id, p.title, p.description, p.is_public, p.multi_vote,
            p.show_results, p.status, p.expires_at, p.created_at,
            u.username AS creator_username
     FROM polls p
     JOIN users u ON u.id = p.creator_id
     WHERE p.id = $1 AND p.deleted_at IS NULL`,
    [pollId],
  );
  return rows[0] || null;
};

export const findOptionsByPollId = async (pollId) => {
  const { rows } = await pool.query(
    `SELECT id, text, position
     FROM options
     WHERE poll_id = $1
     ORDER BY position`,
    [pollId],
  );
  return rows;
};

export const updatePollStatus = async (pollId, status) => {
  const { rows } = await pool.query(
    `UPDATE polls SET status = $1
     WHERE id = $2
     RETURNING id, creator_id, title, description, is_public, multi_vote, show_results, status, expires_at, created_at`,
    [status, pollId],
  );
  return rows[0] || null;
};

export const softDeletePoll = async (pollId) => {
  const { rows } = await pool.query(
    `UPDATE polls SET deleted_at = NOW()
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING id`,
    [pollId],
  );
  return rows[0] || null;
};

const ALLOWED_SORT = {
  newest: 'p.created_at DESC',
  oldest: 'p.created_at ASC',
  most_voted: 'vote_count DESC',
};

export const findPublicPolls = async ({ limit, offset, sort, search }) => {
  const orderBy = ALLOWED_SORT[sort] || ALLOWED_SORT.newest;
  const conditions = ['p.is_public = true', 'p.deleted_at IS NULL'];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(p.title ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
  }

  const where = conditions.join(' AND ');

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM polls p WHERE ${where}`,
    params,
  );

  params.push(limit, offset);
  const limitIdx = params.length - 1;
  const offsetIdx = params.length;

  const { rows } = await pool.query(
    `SELECT p.id, p.title, p.description, p.status, p.expires_at, p.created_at,
            u.username AS creator_username,
            COUNT(v.id)::int AS vote_count
     FROM polls p
     JOIN users u ON u.id = p.creator_id
     LEFT JOIN votes v ON v.poll_id = p.id
     WHERE ${where}
     GROUP BY p.id, u.username
     ORDER BY ${orderBy}
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    params,
  );

  return { polls: rows, total: countResult.rows[0].total };
};

export const getClient = () => pool.connect();
