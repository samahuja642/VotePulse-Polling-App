import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { findUserByEmailOrUsername, findUserByEmail, createUser } from '../db/queries/auth.queries.js';

const BCRYPT_ROUNDS = 12;

const generateAccessToken = (userId) =>
  jwt.sign({ sub: userId }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn,
  });

const generateRefreshToken = (userId) =>
  jwt.sign({ sub: userId }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  });

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.created_at,
    },
    accessToken,
    refreshToken,
  };
};

export const registerUser = async ({ username, email, password }) => {
  const existing = await findUserByEmailOrUsername(email, username);
  if (existing) {
    throw AppError.conflict('Email or username already taken');
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await createUser(username, email, hashedPassword);

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.created_at,
    },
    accessToken,
    refreshToken,
  };
};
