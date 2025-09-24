CREATE TABLE IF NOT EXISTS user_action_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    phone_number VARCHAR(32),
    action VARCHAR(128) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_action_logs_action ON user_action_logs(action);
CREATE INDEX IF NOT EXISTS idx_user_action_logs_user ON user_action_logs(user_id);
