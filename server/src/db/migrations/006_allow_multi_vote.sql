-- 006_allow_multi_vote.sql
-- Drop unique constraints on (poll_id, user_id) and (poll_id, guest_token)
-- to allow multiple vote rows per user in multi-vote polls.
-- Deduplication is now enforced at the application level (per option, not per poll).

ALTER TABLE votes DROP CONSTRAINT IF EXISTS uq_vote_user;
ALTER TABLE votes DROP CONSTRAINT IF EXISTS uq_vote_guest;

-- Replace with unique constraint per option to prevent voting for the same option twice
ALTER TABLE votes ADD CONSTRAINT uq_vote_user_option UNIQUE (poll_id, option_id, user_id);
ALTER TABLE votes ADD CONSTRAINT uq_vote_guest_option UNIQUE (poll_id, option_id, guest_token);
