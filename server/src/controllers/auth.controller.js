import { env } from '../config/env.js';
import { registerUser, loginUser } from '../services/auth.service.js';

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: !env.isDev,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

export const register = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await registerUser(req.validatedBody);

    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      data: { user, accessToken },
    });
  } catch (err) {
    next(err);
  }
};

const notImplemented = (_req, res) => {
  res.status(501).json({
    success: false,
    error: { message: 'Not implemented', code: 'NOT_IMPLEMENTED' },
  });
};

export const login = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await loginUser(req.validatedBody);

    setRefreshCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      data: { user, accessToken },
    });
  } catch (err) {
    next(err);
  }
};
export const getMe = notImplemented;
