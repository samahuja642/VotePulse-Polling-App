// Set test environment variables before anything imports env.js
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/votepulse_test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.COOKIE_SECRET = 'test-cookie-secret';
process.env.CLIENT_ORIGIN = 'http://localhost:5173';
process.env.TURNSTILE_SECRET_KEY = '';
