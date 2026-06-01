import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { makePoll, makeOption, makeUser, uuid } from './helpers/fixtures.js';
import { authHeader } from './helpers/auth.js';

// ─── Mocks ──────────────────────────────────────────────────────────

vi.mock('../db/queries/poll.queries.js', () => ({
  getClient: vi.fn(),
  insertPoll: vi.fn(),
  insertOptions: vi.fn(),
  findMyPolls: vi.fn(),
  findPollById: vi.fn(),
  findOptionsByPollId: vi.fn(),
  updatePollStatus: vi.fn(),
  softDeletePoll: vi.fn(),
  findPublicPolls: vi.fn(),
}));

vi.mock('../db/queries/vote.queries.js', () => ({
  findPollForVoting: vi.fn(),
  findOptionByIdAndPoll: vi.fn(),
  insertVote: vi.fn(),
  findVoteByFingerprint: vi.fn(),
  findUserVotes: vi.fn(),
  getVoteCounts: vi.fn(),
}));

vi.mock('../db/queries/auth.queries.js', () => ({
  findUserByEmailOrUsername: vi.fn(),
  findUserByEmail: vi.fn(),
  findUserById: vi.fn(),
  createUser: vi.fn(),
}));

import {
  getClient,
  insertPoll,
  insertOptions,
  findMyPolls,
  findPollById,
  findOptionsByPollId,
  updatePollStatus,
  softDeletePoll,
  findPublicPolls,
} from '../db/queries/poll.queries.js';

const app = createApp();
// Stub io so castVote controller doesn't crash
app.set('io', { to: () => ({ emit: vi.fn() }) });

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Create Poll ────────────────────────────────────────────────────

describe('POST /api/polls', () => {
  const userId = uuid();
  const validBody = {
    title: 'Favorite color?',
    description: 'Pick one',
    is_public: true,
    multi_vote: false,
    show_results: true,
    options: ['Red', 'Blue', 'Green'],
  };

  it('creates a poll and returns 201', async () => {
    const poll = makePoll({ creator_id: userId });
    const options = validBody.options.map((text, i) =>
      makeOption({ poll_id: poll.id, text, position: i }),
    );

    const mockClient = {
      query: vi.fn(),
      release: vi.fn(),
    };
    getClient.mockResolvedValue(mockClient);
    insertPoll.mockResolvedValue(poll);
    insertOptions.mockResolvedValue(options);

    const res = await request(app)
      .post('/api/polls')
      .set('Authorization', authHeader(userId))
      .send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(poll.title);
    expect(res.body.data.options).toHaveLength(3);

    // Transaction was committed
    expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
    expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    expect(mockClient.release).toHaveBeenCalled();
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app).post('/api/polls').send(validBody);

    expect(res.status).toBe(401);
  });

  it('returns 422 with missing title', async () => {
    const res = await request(app)
      .post('/api/polls')
      .set('Authorization', authHeader(userId))
      .send({ ...validBody, title: '' });

    expect(res.status).toBe(422);
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: 'title' })]),
    );
  });

  it('returns 422 with less than 2 options', async () => {
    const res = await request(app)
      .post('/api/polls')
      .set('Authorization', authHeader(userId))
      .send({ ...validBody, options: ['Only one'] });

    expect(res.status).toBe(422);
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: 'options' })]),
    );
  });

  it('rolls back transaction on insert failure', async () => {
    const mockClient = { query: vi.fn(), release: vi.fn() };
    getClient.mockResolvedValue(mockClient);
    insertPoll.mockRejectedValue(new Error('DB down'));

    const res = await request(app)
      .post('/api/polls')
      .set('Authorization', authHeader(userId))
      .send(validBody);

    expect(res.status).toBe(500);
    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    expect(mockClient.release).toHaveBeenCalled();
  });
});

// ─── Get My Polls ───────────────────────────────────────────────────

describe('GET /api/polls/me', () => {
  const userId = uuid();

  it('returns paginated polls for authenticated user', async () => {
    const polls = [makePoll({ creator_id: userId }), makePoll({ creator_id: userId })];
    findMyPolls.mockResolvedValue({ polls, total: 2 });

    const res = await request(app)
      .get('/api/polls/me')
      .set('Authorization', authHeader(userId));

    expect(res.status).toBe(200);
    expect(res.body.data.polls).toHaveLength(2);
    expect(res.body.data.pagination).toMatchObject({ page: 1, total: 2 });
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/polls/me');

    expect(res.status).toBe(401);
  });

  it('passes search param to query', async () => {
    findMyPolls.mockResolvedValue({ polls: [], total: 0 });

    await request(app)
      .get('/api/polls/me?search=fav')
      .set('Authorization', authHeader(userId));

    expect(findMyPolls).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({ search: 'fav' }),
    );
  });
});

// ─── Get Poll By ID ─────────────────────────────────────────────────

describe('GET /api/polls/:id', () => {
  it('returns poll with options', async () => {
    const poll = makePoll();
    const options = [
      makeOption({ poll_id: poll.id, text: 'A', position: 0 }),
      makeOption({ poll_id: poll.id, text: 'B', position: 1 }),
    ];
    findPollById.mockResolvedValue(poll);
    findOptionsByPollId.mockResolvedValue(options);

    const res = await request(app).get(`/api/polls/${poll.id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe(poll.title);
    expect(res.body.data.options).toHaveLength(2);
  });

  it('returns 404 for non-existent poll', async () => {
    findPollById.mockResolvedValue(null);

    const res = await request(app).get(`/api/polls/${uuid()}`);

    expect(res.status).toBe(404);
  });
});

// ─── Update Poll (Close/Reopen) ─────────────────────────────────────

describe('PATCH /api/polls/:id', () => {
  const userId = uuid();
  const pollId = uuid();

  it('toggles poll status for owner', async () => {
    const poll = makePoll({ id: pollId, creator_id: userId, status: 'open' });
    findPollById.mockResolvedValue(poll);
    updatePollStatus.mockResolvedValue({ ...poll, status: 'closed' });

    const res = await request(app)
      .patch(`/api/polls/${pollId}`)
      .set('Authorization', authHeader(userId))
      .send({ status: 'closed' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('closed');
  });

  it('returns 403 for non-owner', async () => {
    const poll = makePoll({ id: pollId, creator_id: uuid() }); // different owner
    findPollById.mockResolvedValue(poll);

    const res = await request(app)
      .patch(`/api/polls/${pollId}`)
      .set('Authorization', authHeader(userId))
      .send({ status: 'closed' });

    expect(res.status).toBe(403);
  });

  it('returns 400 if already in requested status', async () => {
    const poll = makePoll({ id: pollId, creator_id: userId, status: 'closed' });
    findPollById.mockResolvedValue(poll);

    const res = await request(app)
      .patch(`/api/polls/${pollId}`)
      .set('Authorization', authHeader(userId))
      .send({ status: 'closed' });

    expect(res.status).toBe(400);
  });

  it('returns 422 for invalid status value', async () => {
    const res = await request(app)
      .patch(`/api/polls/${pollId}`)
      .set('Authorization', authHeader(userId))
      .send({ status: 'archived' });

    expect(res.status).toBe(422);
  });
});

// ─── Delete Poll ────────────────────────────────────────────────────

describe('DELETE /api/polls/:id', () => {
  const userId = uuid();
  const pollId = uuid();

  it('soft-deletes poll for owner', async () => {
    const poll = makePoll({ id: pollId, creator_id: userId });
    findPollById.mockResolvedValue(poll);
    softDeletePoll.mockResolvedValue({ id: pollId });

    const res = await request(app)
      .delete(`/api/polls/${pollId}`)
      .set('Authorization', authHeader(userId));

    expect(res.status).toBe(200);
    expect(res.body.data).toBeNull();
    expect(softDeletePoll).toHaveBeenCalledWith(pollId);
  });

  it('returns 403 for non-owner', async () => {
    const poll = makePoll({ id: pollId, creator_id: uuid() });
    findPollById.mockResolvedValue(poll);

    const res = await request(app)
      .delete(`/api/polls/${pollId}`)
      .set('Authorization', authHeader(userId));

    expect(res.status).toBe(403);
  });

  it('returns 404 for non-existent poll', async () => {
    findPollById.mockResolvedValue(null);

    const res = await request(app)
      .delete(`/api/polls/${pollId}`)
      .set('Authorization', authHeader(userId));

    expect(res.status).toBe(404);
  });
});

// ─── Public Polls ───────────────────────────────────────────────────

describe('GET /api/polls/public', () => {
  it('returns public polls with pagination', async () => {
    const polls = [makePoll(), makePoll()];
    findPublicPolls.mockResolvedValue({ polls, total: 2 });

    const res = await request(app).get('/api/polls/public');

    expect(res.status).toBe(200);
    expect(res.body.data.polls).toHaveLength(2);
    expect(res.body.data.pagination).toBeDefined();
  });

  it('passes sort and search params', async () => {
    findPublicPolls.mockResolvedValue({ polls: [], total: 0 });

    await request(app).get('/api/polls/public?sort=most_voted&search=color');

    expect(findPublicPolls).toHaveBeenCalledWith(
      expect.objectContaining({ sort: 'most_voted', search: 'color' }),
    );
  });

  it('defaults invalid sort to newest', async () => {
    findPublicPolls.mockResolvedValue({ polls: [], total: 0 });

    await request(app).get('/api/polls/public?sort=hackme');

    expect(findPublicPolls).toHaveBeenCalledWith(
      expect.objectContaining({ sort: 'newest' }),
    );
  });
});
