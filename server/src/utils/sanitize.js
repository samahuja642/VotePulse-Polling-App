import xss from 'xss';

/**
 * Sanitize a string to prevent XSS attacks.
 * Returns the sanitized string, or the original value if not a string.
 */
export const sanitize = (value) => {
  if (typeof value !== 'string') return value;
  return xss(value);
};

/**
 * Sanitize all string values in an array.
 */
export const sanitizeArray = (arr) => {
  if (!Array.isArray(arr)) return arr;
  return arr.map((item) => sanitize(item));
};
