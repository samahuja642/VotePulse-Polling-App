import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { makeUser, uuid } from './helpers/fixtures.js';

// Mock DB queries
vi.mock('../db/queries/auth.queries.js', () => ({
  findUserByEmailOrUsername: vi.fn(),
  findUserByEmail: vi.fn(),
  findUserById: vi.fn(),
  createUser: vi.fn(),
}));

// Import mocks after vi.mock
import {
  findUserByEmailOrUsername,
  findUserByEmail,
  findUserById,
  createUser,
} from '../db/queries/auth.queries.js';

import { registerUser, loginUser, refreshAccessToken, getUserById } from '../services/auth.service.js';
import { createRequire } from 'module';

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Register ───────────────────────────────────────────────────────

describe('registerUser', () => {
  it('creates user and returns tokens', async () => {
    const user = makeUser();
    findUserByEmailOrUsername.mockResolvedValue(null);
    createUser.mockResolvedValue(user);

    const result = await registerUser({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result.user).toEqual({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.created_at,
    });
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();

    // Verify tokens are valid JWTs
    const accessPayload = jwt.verify(result.accessToken, 'test-access-secret');
    expect(accessPayload.sub).toBe(user.id);

    const refreshPayload = jwt.verify(result.refreshToken, 'test-refresh-secret');
    expect(refreshPayload.sub).toBe(user.id);
  });

  it('hashes password with bcrypt before storing', async () => {
    const user = makeUser();
    findUserByEmailOrUsername.mockResolvedValue(null);
    createUser.mockResolvedValue(user);

    await registerUser({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });

    // createUser receives hashed password, not plaintext
    const hashedPassword = createUser.mock.calls[0][2];
    expect(hashedPassword).not.toBe('password123');
    expect(await bcrypt.compare('password123', hashedPassword)).toBe(true);
  });

  it('throws 409 if email or username already taken', async () => {
    findUserByEmailOrUsername.mockResolvedValue({ id: uuid() });

    await expect(
      registerUser({ username: 'taken', email: 'taken@example.com', password: 'password123' }),
    ).rejects.toMatchObject({ statusCode: 409, message: 'Email or username already taken' });
  });

  it('sanitizes username via xss', async () => {
    const user = makeUser({ username: 'cleanuser' });
    findUserByEmailOrUsername.mockResolvedValue(null);
    createUser.mockResolvedValue(user);

    await registerUser({
      username: '<script>alert(1)</script>',
      email: 'xss@example.com',
      password: 'password123',
    });

    // xss library strips script tags
    const savedUsername = createUser.mock.calls[0][0];
    expect(savedUsername).not.toContain('<script>');
  });
});

// ─── Login ──────────────────────────────────────────────────────────

describe('loginUser', () => {
  it('returns user + tokens on valid credentials', async () => {
    const hashed = await bcrypt.hash('correctPassword', 4); // low rounds for speed
    const user = makeUser({ password: hashed });
    findUserByEmail.mockResolvedValue(user);

    const result = await loginUser({ email: user.email, password: 'correctPassword' });

    expect(result.user.id).toBe(user.id);
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('throws 401 if email not found', async () => {
    findUserByEmail.mockResolvedValue(null);

    await expect(
      loginUser({ email: 'no@one.com', password: 'password123' }),
    ).rejects.toMatchObject({ statusCode: 401, message: 'Invalid email or password' });
  });

  it('throws 401 if password is wrong', async () => {
    const hashed = await bcrypt.hash('correctPassword', 4);
    const user = makeUser({ password: hashed });
    findUserByEmail.mockResolvedValue(user);

    await expect(
      loginUser({ email: user.email, password: 'wrongPassword' }),
    ).rejects.toMatchObject({ statusCode: 401, message: 'Invalid email or password' });
  });

  it('does not leak whether email exists (same error message)', async () => {
    findUserByEmail.mockResolvedValue(null);

    try {
      await loginUser({ email: 'no@one.com', password: 'x' });
    } catch (errNoUser) {
      const hashed = await bcrypt.hash('correct', 4);
      findUserByEmail.mockResolvedValue(makeUser({ password: hashed }));

      try {
        await loginUser({ email: 'test@example.com', password: 'wrong' });
      } catch (errWrongPw) {
        expect(errNoUser.message).toBe(errWrongPw.message);
        return;
      }
    }
    throw new Error('Expected both paths to throw');
  });
});

// ─── Refresh ────────────────────────────────────────────────────────

describe('refreshAccessToken', () => {
  it('returns new tokens for a valid refresh token', async () => {
    const user = makeUser();
    const refreshToken = jwt.sign({ sub: user.id }, 'test-refresh-secret', { expiresIn: '7d' });
    findUserById.mockResolvedValue(user);

    const result = await refreshAccessToken(refreshToken);

    expect(result.user.id).toBe(user.id);
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    // New refresh token should differ (rotation)
    expect(result.refreshToken).not.toBe(refreshToken);
  });

  it('throws 401 if no refresh token provided', async () => {
    await expect(refreshAccessToken(null)).rejects.toMatchObject({
      statusCode: 401,
      message: 'No refresh token',
    });
  });

  it('throws 401 if refresh token is invalid', async () => {
    await expect(refreshAccessToken('garbage')).rejects.toMatchObject({
      statusCode: 401,
      message: 'Invalid refresh token',
    });
  });

  it('throws 401 if user no longer exists', async () => {
    const token = jwt.sign({ sub: uuid() }, 'test-refresh-secret', { expiresIn: '7d' });
    findUserById.mockResolvedValue(null);

    await expect(refreshAccessToken(token)).rejects.toMatchObject({
      statusCode: 401,
      message: 'User not found',
    });
  });
});

// ─── getUserById ────────────────────────────────────────────────────

describe('getUserById', () => {
  it('returns user without password', async () => {
    const user = makeUser();
    findUserById.mockResolvedValue(user);

    const result = await getUserById(user.id);

    expect(result).toEqual({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.created_at,
    });
    expect(result).not.toHaveProperty('password');
  });

  it('throws 404 if user not found', async () => {
    findUserById.mockResolvedValue(null);

    await expect(getUserById(uuid())).rejects.toMatchObject({
      statusCode: 404,
      message: 'User not found',
    });
  });
});
