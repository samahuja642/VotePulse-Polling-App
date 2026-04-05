-- 002_create_polls.sql

CREATE TABLE polls (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id  UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  is_public   BOOLEAN      NOT NULL DEFAULT true,
  multi_vote  BOOLEAN      NOT NULL DEFAULT false,
  status      VARCHAR(10)  NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE options (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id  UUID         NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  text     VARCHAR(200) NOT NULL,
  position INT          NOT NULL DEFAULT 0
);

CREATE TABLE votes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id     UUID        NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id   UUID        NOT NULL REFERENCES options(id) ON DELETE CASCADE,
  user_id     UUID        REFERENCES users(id) ON DELETE SET NULL,
  guest_token UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_vote_user  UNIQUE (poll_id, user_id),
  CONSTRAINT uq_vote_guest UNIQUE (poll_id, guest_token)
);

CREATE INDEX idx_polls_creator   ON polls (creator_id);
CREATE INDEX idx_polls_status    ON polls (status);
CREATE INDEX idx_polls_public    ON polls (is_public, status);
CREATE INDEX idx_options_poll    ON options (poll_id);
CREATE INDEX idx_votes_poll      ON votes (poll_id);
CREATE INDEX idx_votes_option    ON votes (option_id);
