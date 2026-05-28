import { ErrorCode } from './errorCodes.js';

export class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }

  static badRequest(message = 'Bad request') {
    return new AppError(message, 400, ErrorCode.BAD_REQUEST);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 401, ErrorCode.UNAUTHORIZED);
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403, ErrorCode.FORBIDDEN);
  }

  static notFound(message = 'Not found') {
    return new AppError(message, 404, ErrorCode.NOT_FOUND);
  }

  static conflict(message = 'Conflict') {
    return new AppError(message, 409, ErrorCode.CONFLICT);
  }
}
