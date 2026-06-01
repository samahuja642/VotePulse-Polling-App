import crypto from 'crypto';

export const uuid = () => crypto.randomUUID();

export const makeUser = (overrides = {}) => ({
  id: uuid(),
  username: 'testuser',
  email: 'test@example.com',
  password: '$2a$12$hashedpasswordplaceholder1234567890',
  created_at: new Date().toISOString(),
  ...overrides,
});

export const makePoll = (overrides = {}) => ({
  id: uuid(),
  creator_id: uuid(),
  title: 'Test Poll',
  description: 'A test poll',
  is_public: true,
  multi_vote: false,
  show_results: true,
  status: 'open',
  expires_at: new Date(Date.now() + 86400000).toISOString(), // +1 day
  created_at: new Date().toISOString(),
  creator_username: 'testuser',
  ...overrides,
});

export const makeOption = (overrides = {}) => ({
  id: uuid(),
  poll_id: uuid(),
  text: 'Option A',
  position: 0,
  ...overrides,
});

export const makeVote = (overrides = {}) => ({
  id: uuid(),
  poll_id: uuid(),
  option_id: uuid(),
  user_id: uuid(),
  guest_token: null,
  created_at: new Date().toISOString(),
  ...overrides,
});
