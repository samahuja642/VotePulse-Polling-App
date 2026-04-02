import pg from 'pg';
import { env } from './env.js';

const pool = new pg.Pool({
  connectionString: env.databaseUrl,
});

export const connectDB = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT NOW()');
    console.log(`PostgreSQL connected successfully at ${result.rows[0].now}`);
  } finally {
    client.release();
  }
};

export default pool;
