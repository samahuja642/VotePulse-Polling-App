-- 005_add_deleted_at_to_polls.sql

ALTER TABLE polls ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX idx_polls_deleted_at ON polls (deleted_at);
