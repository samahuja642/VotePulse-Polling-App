import { env } from '../config/env.js';
import { registerUser, loginUser, refreshAccessToken, getUserById } from '../services/auth.service.js';

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: !env.isDev,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: !env.isDev,
    sameSite: 'strict',
    path: '/',
  });
};

export const register = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await registerUser(req.validatedBody);
    setRefreshCookie(res, refreshToken);
    res.status(201).json({ success: true, data: { user, accessToken } });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await loginUser(req.validatedBody);
    setRefreshCookie(res, refreshToken);
    res.status(200).json({ success: true, data: { user, accessToken } });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    const { user, accessToken, refreshToken } = await refreshAccessToken(token);
    setRefreshCookie(res, refreshToken);
    res.status(200).json({ success: true, data: { user, accessToken } });
  } catch (err) {
    clearRefreshCookie(res);
    next(err);
  }
};

export const logout = (_req, res) => {
  clearRefreshCookie(res);
  res.status(200).json({ success: true, data: { message: 'Logged out' } });
};

export const getMe = async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id);
    res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};
