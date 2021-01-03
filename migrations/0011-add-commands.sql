-- Create commands table
CREATE TABLE IF NOT EXISTS commands (
    id VARCHAR(256),
    serverId VARCHAR(256),
    command VARCHAR(256),
    alias VARCHAR(256),
    enabled BOOLEAN,
    allowedRoles VARCHAR(256)[],
    disallowedRoles VARCHAR(256)[],
    PRIMARY KEY (id, serverId, command)
)