CREATE TABLE IF NOT EXISTS discount_groups (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS discount_items (
    id VARCHAR(96) PRIMARY KEY,
    group_id VARCHAR(64) NOT NULL REFERENCES discount_groups(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_discount_items_group ON discount_items(group_id);
