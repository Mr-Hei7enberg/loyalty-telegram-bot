CREATE TABLE IF NOT EXISTS feedback_entries (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(32) NOT NULL,
    contact_preference VARCHAR(32) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback_entries(created_at DESC);
