import { ErrorCode } from './errorCodes.js';

/**
 * User-friendly messages keyed by ErrorCode.
 */
const FRIENDLY_MESSAGES = {
  [ErrorCode.RATE_LIMITED]: 'Too many requests — please wait a moment and try again',
  [ErrorCode.INVALID_JSON]: 'Something went wrong with your request',
  [ErrorCode.PAYLOAD_TOO_LARGE]: 'Your request is too large',
  [ErrorCode.DUPLICATE]: 'That already exists',
  [ErrorCode.CAPTCHA_MISSING]: 'Please complete the CAPTCHA verification',
  [ErrorCode.CAPTCHA_FAILED]: 'CAPTCHA verification failed — please try again',
  [ErrorCode.CAPTCHA_ERROR]: 'CAPTCHA verification error — please try again',
  [ErrorCode.UNAUTHORIZED]: 'Please log in to continue',
  [ErrorCode.FORBIDDEN]: 'You don\'t have permission to do that',
  [ErrorCode.TOKEN_EXPIRED]: 'Your session has expired — please log in again',
  [ErrorCode.INTERNAL_ERROR]: 'Something went wrong on our end — please try again later',
  [ErrorCode.NETWORK_ERROR]: 'Unable to connect to the server — please check your internet',
  [ErrorCode.TIMEOUT]: 'Request timed out — please check your connection',
};

/**
 * Extract a structured error from an axios error.
 * Returns { message, code, status, details }.
 */
export function extractApiError(err) {
  // Network / timeout — no response at all
  if (!err.response) {
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      return {
        message: FRIENDLY_MESSAGES[ErrorCode.TIMEOUT],
        code: ErrorCode.TIMEOUT,
        status: 0,
        details: null,
      };
    }
    return {
      message: FRIENDLY_MESSAGES[ErrorCode.NETWORK_ERROR],
      code: ErrorCode.NETWORK_ERROR,
      status: 0,
      details: null,
    };
  }

  const { status, data } = err.response;
  const serverError = data?.error;
  const code = serverError?.code || ErrorCode.UNKNOWN;
  const details = serverError?.details || null;

  // Use friendly message if available, fall back to server message, then generic
  const message =
    FRIENDLY_MESSAGES[code] ||
    serverError?.message ||
    `Something went wrong (${status})`;

  return { message, code, status, details };
}
