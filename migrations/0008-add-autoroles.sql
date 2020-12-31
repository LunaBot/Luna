-- Create autoRoles table
CREATE TABLE IF NOT EXISTS autoRoles (
    id VARCHAR(256) PRIMARY KEY,
    serverId VARCHAR(256),
    roles VARCHAR(256)[],
    timer BIGINT,
    UNIQUE(id, serverId)
);
