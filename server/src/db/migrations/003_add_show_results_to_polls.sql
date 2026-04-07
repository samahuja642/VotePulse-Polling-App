-- 003_add_show_results_to_polls.sql

ALTER TABLE polls ADD COLUMN show_results BOOLEAN NOT NULL DEFAULT false;
