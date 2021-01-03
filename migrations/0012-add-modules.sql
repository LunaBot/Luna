-- Create modules table
CREATE TABLE IF NOT EXISTS modules (
    id VARCHAR(256),
    serverId VARCHAR(256),
    name VARCHAR(256),
    enabled BOOLEAN,
    PRIMARY KEY (id, serverId, name)
)