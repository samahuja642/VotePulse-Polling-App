import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { makePoll, makeOption, makeVote, uuid } from './helpers/fixtures.js';
import { authHeader } from './helpers/auth.js';

// ─── Mocks ──────────────────────────────────────────────────────────

vi.mock('../db/queries/vote.queries.js', () => ({
  findPollForVoting: vi.fn(),
  findOptionByIdAndPoll: vi.fn(),
  insertVote: vi.fn(),
  findVoteByFingerprint: vi.fn(),
  findUserVotes: vi.fn(),
  getVoteCounts: vi.fn(),
}));

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

vi.mock('../db/queries/auth.queries.js', () => ({
  findUserByEmailOrUsername: vi.fn(),
  findUserByEmail: vi.fn(),
  findUserById: vi.fn(),
  createUser: vi.fn(),
}));

import {
  findPollForVoting,
  findOptionByIdAndPoll,
  insertVote,
  findVoteByFingerprint,
  findUserVotes,
  getVoteCounts,
} from '../db/queries/vote.queries.js';

import { findPollById } from '../db/queries/poll.queries.js';

const app = createApp();
app.set('io', { to: () => ({ emit: vi.fn() }) });

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Helpers ────────────────────────────────────────────────────────

const pollId = uuid();
const optionId = uuid();
const userId = uuid();
const guestToken = uuid();

const setupOpenPoll = (overrides = {}) => {
  const poll = {
    id: pollId,
    status: 'open',
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    multi_vote: false,
    ...overrides,
  };
  findPollForVoting.mockResolvedValue(poll);
  return poll;
};

const setupOption = (oId = optionId) => {
  findOptionByIdAndPoll.mockResolvedValue({ id: oId, poll_id: pollId });
};

const setupNoExistingVotes = () => {
  findUserVotes.mockResolvedValue([]);
  findVoteByFingerprint.mockResolvedValue(null);
};

const setupInsertVote = () => {
  insertVote.mockResolvedValue(makeVote({ poll_id: pollId, option_id: optionId, user_id: userId }));
  getVoteCounts.mockResolvedValue([
    { option_id: optionId, text: 'Option A', position: 0, count: 1 },
  ]);
};

// ─── Cast Vote (Authenticated) ─────────────────────────────────────

describe('POST /api/polls/:id/vote', () => {
  describe('authenticated user voting', () => {
    it('casts a vote successfully', async () => {
      setupOpenPoll();
      setupOption();
      setupNoExistingVotes();
      setupInsertVote();

      const res = await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', authHeader(userId))
        .send({ option_ids: [optionId] });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.votes).toHaveLength(1);
      expect(res.body.data.results).toHaveLength(1);
    });

    it('rejects vote on closed poll', async () => {
      setupOpenPoll({ status: 'closed' });

      const res = await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', authHeader(userId))
        .send({ option_ids: [optionId] });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/closed/i);
    });

    it('rejects vote on expired poll', async () => {
      setupOpenPoll({ expires_at: new Date(Date.now() - 1000).toISOString() });

      const res = await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', authHeader(userId))
        .send({ option_ids: [optionId] });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/expired/i);
    });

    it('rejects duplicate vote (already voted)', async () => {
      setupOpenPoll();
      setupOption();
      findUserVotes.mockResolvedValue([makeVote()]);

      const res = await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', authHeader(userId))
        .send({ option_ids: [optionId] });

      expect(res.status).toBe(409);
      expect(res.body.error.message).toMatch(/already voted/i);
    });

    it('rejects vote with option from different poll', async () => {
      setupOpenPoll();
      findOptionByIdAndPoll.mockResolvedValue(null); // option doesn't belong to this poll

      const res = await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', authHeader(userId))
        .send({ option_ids: [uuid()] });

      expect(res.status).toBe(404);
      expect(res.body.error.message).toMatch(/option not found/i);
    });

    it('rejects non-existent poll', async () => {
      findPollForVoting.mockResolvedValue(null);

      const res = await request(app)
        .post(`/api/polls/${uuid()}/vote`)
        .set('Authorization', authHeader(userId))
        .send({ option_ids: [optionId] });

      expect(res.status).toBe(404);
      expect(res.body.error.message).toMatch(/poll not found/i);
    });
  });

  // ─── Guest Voting ──────────────────────────────────────────────

  describe('guest voting', () => {
    it('allows guest vote with guest_token', async () => {
      setupOpenPoll();
      setupOption();
      setupNoExistingVotes();
      insertVote.mockResolvedValue(
        makeVote({ poll_id: pollId, option_id: optionId, user_id: null, guest_token: guestToken }),
      );
      getVoteCounts.mockResolvedValue([
        { option_id: optionId, text: 'Option A', position: 0, count: 1 },
      ]);

      const res = await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .send({ option_ids: [optionId], guest_token: guestToken });

      expect(res.status).toBe(201);
    });

    it('rejects guest vote without guest_token and no auth', async () => {
      setupOpenPoll();
      setupOption();

      const res = await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .send({ option_ids: [optionId] });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/authentication or guest token/i);
    });

    it('rejects guest duplicate via fingerprint', async () => {
      setupOpenPoll();
      setupOption();
      findUserVotes.mockResolvedValue([]); // no cookie-based dup
      findVoteByFingerprint.mockResolvedValue({ id: uuid() }); // but fingerprint matches

      const deviceHash = 'a'.repeat(64);
      const res = await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .send({ option_ids: [optionId], guest_token: guestToken, device_hash: deviceHash });

      expect(res.status).toBe(409);
      expect(res.body.error.message).toMatch(/already been cast from this device/i);
    });
  });

  // ─── Multi-Vote ────────────────────────────────────────────────

  describe('multi-vote behavior', () => {
    it('allows multiple options when multi_vote is true', async () => {
      const opt1 = uuid();
      const opt2 = uuid();
      setupOpenPoll({ multi_vote: true });
      findOptionByIdAndPoll.mockResolvedValue({ id: opt1, poll_id: pollId });
      setupNoExistingVotes();
      insertVote.mockResolvedValue(makeVote());
      getVoteCounts.mockResolvedValue([
        { option_id: opt1, text: 'A', position: 0, count: 1 },
        { option_id: opt2, text: 'B', position: 1, count: 1 },
      ]);

      const res = await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', authHeader(userId))
        .send({ option_ids: [opt1, opt2] });

      expect(res.status).toBe(201);
    });

    it('rejects multiple options when multi_vote is false', async () => {
      setupOpenPoll({ multi_vote: false });

      const res = await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', authHeader(userId))
        .send({ option_ids: [uuid(), uuid()] });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toMatch(/single choice/i);
    });
  });

  // ─── DB Race Condition ─────────────────────────────────────────

  describe('race condition handling', () => {
    it('catches unique constraint violation (23505) as 409', async () => {
      setupOpenPoll();
      setupOption();
      setupNoExistingVotes();
      const pgError = new Error('duplicate key');
      pgError.code = '23505';
      insertVote.mockRejectedValue(pgError);

      const res = await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', authHeader(userId))
        .send({ option_ids: [optionId] });

      expect(res.status).toBe(409);
    });
  });

  // ─── Validation ────────────────────────────────────────────────

  describe('request validation', () => {
    it('rejects empty option_ids array', async () => {
      const res = await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', authHeader(userId))
        .send({ option_ids: [] });

      expect(res.status).toBe(422);
    });

    it('rejects non-UUID option_ids', async () => {
      const res = await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .set('Authorization', authHeader(userId))
        .send({ option_ids: ['not-a-uuid'] });

      expect(res.status).toBe(422);
    });

    it('rejects invalid device_hash length', async () => {
      const res = await request(app)
        .post(`/api/polls/${pollId}/vote`)
        .send({ option_ids: [uuid()], guest_token: uuid(), device_hash: 'tooshort' });

      expect(res.status).toBe(422);
    });
  });
});

// ─── Check Vote ─────────────────────────────────────────────────────

describe('GET /api/polls/:id/vote', () => {
  it('returns voted=true when user has voted', async () => {
    findUserVotes.mockResolvedValue([makeVote()]);

    const res = await request(app)
      .get(`/api/polls/${pollId}/vote`)
      .set('Authorization', authHeader(userId));

    expect(res.status).toBe(200);
    expect(res.body.data.voted).toBe(true);
    expect(res.body.data.votes).toHaveLength(1);
  });

  it('returns voted=false when user has not voted', async () => {
    findUserVotes.mockResolvedValue([]);

    const res = await request(app)
      .get(`/api/polls/${pollId}/vote`)
      .set('Authorization', authHeader(userId));

    expect(res.status).toBe(200);
    expect(res.body.data.voted).toBe(false);
  });

  it('checks guest vote via guest_token query param', async () => {
    findUserVotes.mockResolvedValue([makeVote({ user_id: null, guest_token: guestToken })]);

    const res = await request(app)
      .get(`/api/polls/${pollId}/vote?guest_token=${guestToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.voted).toBe(true);
  });

  it('returns 400 without auth or guest_token', async () => {
    const res = await request(app).get(`/api/polls/${pollId}/vote`);

    expect(res.status).toBe(400);
  });
});

// ─── Results ────────────────────────────────────────────────────────

describe('GET /api/polls/:id/results', () => {
  it('returns results with percentages for owner', async () => {
    const poll = makePoll({ show_results: false });
    findPollById.mockResolvedValue(poll);
    getVoteCounts.mockResolvedValue([
      { option_id: uuid(), text: 'A', position: 0, count: 3 },
      { option_id: uuid(), text: 'B', position: 1, count: 7 },
    ]);

    const res = await request(app)
      .get(`/api/polls/${poll.id}/results`)
      .set('Authorization', authHeader(poll.creator_id));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].percentage).toBe(30);
    expect(res.body.data[1].percentage).toBe(70);
  });

  it('returns results when show_results is true (any user)', async () => {
    const poll = makePoll({ show_results: true });
    findPollById.mockResolvedValue(poll);
    getVoteCounts.mockResolvedValue([]);

    const res = await request(app).get(`/api/polls/${poll.id}/results`);

    expect(res.status).toBe(200);
  });

  it('returns 403 for non-owner when show_results is false', async () => {
    const poll = makePoll({ show_results: false });
    findPollById.mockResolvedValue(poll);

    const res = await request(app)
      .get(`/api/polls/${poll.id}/results`)
      .set('Authorization', authHeader(uuid())); // different user

    expect(res.status).toBe(403);
  });

  it('handles zero votes without division error', async () => {
    const poll = makePoll({ show_results: true });
    findPollById.mockResolvedValue(poll);
    getVoteCounts.mockResolvedValue([
      { option_id: uuid(), text: 'A', position: 0, count: 0 },
    ]);

    const res = await request(app).get(`/api/polls/${poll.id}/results`);

    expect(res.status).toBe(200);
    expect(res.body.data[0].percentage).toBe(0);
  });
});
