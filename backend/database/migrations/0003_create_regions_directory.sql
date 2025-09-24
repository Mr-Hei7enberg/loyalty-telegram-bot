CREATE TABLE IF NOT EXISTS regions (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS region_networks (
    id VARCHAR(64) PRIMARY KEY,
    region_id VARCHAR(64) NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS region_locations (
    id VARCHAR(96) PRIMARY KEY,
    network_id VARCHAR(64) NOT NULL REFERENCES region_networks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_region_networks_region ON region_networks(region_id);
CREATE INDEX IF NOT EXISTS idx_region_locations_network ON region_locations(network_id);
