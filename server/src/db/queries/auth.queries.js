import pool from '../../config/db.js';

export const findUserByEmailOrUsername = async (email, username) => {
  const { rows } = await pool.query(
    'SELECT id FROM users WHERE email = $1 OR username = $2 LIMIT 1',
    [email, username]
  );
  return rows[0] || null;
};

export const findUserByEmail = async (email) => {
  const { rows } = await pool.query(
    'SELECT id, username, email, password, created_at FROM users WHERE email = $1',
    [email]
  );
  return rows[0] || null;
};

export const findUserById = async (id) => {
  const { rows } = await pool.query(
    'SELECT id, username, email, created_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};

export const createUser = async (username, email, hashedPassword) => {
  const { rows } = await pool.query(
    `INSERT INTO users (username, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, username, email, created_at`,
    [username, email, hashedPassword]
  );
  return rows[0];
};
