import pool from '../../config/db.js';

export const findPollForVoting = async (pollId) => {
  const { rows } = await pool.query(
    `SELECT id, status, expires_at, multi_vote
     FROM polls
     WHERE id = $1`,
    [pollId],
  );
  return rows[0] || null;
};

export const findOptionByIdAndPoll = async (optionId, pollId) => {
  const { rows } = await pool.query(
    `SELECT id, poll_id
     FROM options
     WHERE id = $1 AND poll_id = $2`,
    [optionId, pollId],
  );
  return rows[0] || null;
};

export const insertVote = async (pollId, optionId, userId, guestToken, fingerprint) => {
  const { rows } = await pool.query(
    `INSERT INTO votes (poll_id, option_id, user_id, guest_token, fingerprint)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, poll_id, option_id, user_id, guest_token, created_at`,
    [pollId, optionId, userId || null, guestToken || null, fingerprint || null],
  );
  return rows[0];
};

export const findVoteByFingerprint = async (pollId, fingerprint) => {
  if (!fingerprint) return null;
  const { rows } = await pool.query(
    `SELECT id FROM votes WHERE poll_id = $1 AND fingerprint = $2 LIMIT 1`,
    [pollId, fingerprint],
  );
  return rows[0] || null;
};

export const findUserVote = async (pollId, userId, guestToken) => {
  if (userId) {
    const { rows } = await pool.query(
      `SELECT id, option_id, created_at
       FROM votes
       WHERE poll_id = $1 AND user_id = $2`,
      [pollId, userId],
    );
    return rows[0] || null;
  }

  if (guestToken) {
    const { rows } = await pool.query(
      `SELECT id, option_id, created_at
       FROM votes
       WHERE poll_id = $1 AND guest_token = $2`,
      [pollId, guestToken],
    );
    return rows[0] || null;
  }

  return null;
};

export const getVoteCounts = async (pollId) => {
  const { rows } = await pool.query(
    `SELECT o.id AS option_id, o.text, o.position, COUNT(v.id)::int AS count
     FROM options o
     LEFT JOIN votes v ON v.option_id = o.id
     WHERE o.poll_id = $1
     GROUP BY o.id, o.text, o.position
     ORDER BY o.position`,
    [pollId],
  );
  return rows;
};
