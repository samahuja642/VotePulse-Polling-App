import jwt from 'jsonwebtoken';

const ACCESS_SECRET = 'test-access-secret';
const REFRESH_SECRET = 'test-refresh-secret';

export const generateTestAccessToken = (userId) =>
  jwt.sign({ sub: userId }, ACCESS_SECRET, { expiresIn: '15m' });

export const generateTestRefreshToken = (userId) =>
  jwt.sign({ sub: userId }, REFRESH_SECRET, { expiresIn: '7d' });

export const generateExpiredToken = (userId) =>
  jwt.sign({ sub: userId }, ACCESS_SECRET, { expiresIn: '0s' });

export const authHeader = (userId) => `Bearer ${generateTestAccessToken(userId)}`;
