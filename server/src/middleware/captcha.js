import { env } from '../config/env.js';
import { ErrorCode } from '../utils/errorCodes.js';

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export const verifyCaptcha = async (req, res, next) => {
  if (!env.turnstileSecretKey) {
    return next();
  }

  const token = req.body?.captchaToken || req.headers['x-captcha-token'];
  if (!token) {
    return res.status(400).json({
      success: false,
      error: { message: 'CAPTCHA token is required', code: ErrorCode.CAPTCHA_MISSING },
    });
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: env.turnstileSecretKey,
        response: token,
        remoteip: req.ip,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      return res.status(403).json({
        success: false,
        error: { message: 'CAPTCHA verification failed', code: ErrorCode.CAPTCHA_FAILED },
      });
    }

    next();
  } catch {
    return res.status(500).json({
      success: false,
      error: { message: 'CAPTCHA verification error', code: ErrorCode.CAPTCHA_ERROR },
    });
  }
};
