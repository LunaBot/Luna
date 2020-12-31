-- Create verifications table
CREATE TABLE IF NOT EXISTS verifications (
    id VARCHAR(256) PRIMARY KEY,
    serverId VARCHAR(256),
    command VARCHAR(256),
    message VARCHAR(256),
    failedMessage VARCHAR(2000),
    messageRegex VARCHAR(256),
    successRoles VARCHAR(256),
    failedRoles VARCHAR(256),
    announceChannel VARCHAR(256),
    allowedchannels VARCHAR(256),
    enabled BOOLEAN,
    UNIQUE (id, serverId, command)
);