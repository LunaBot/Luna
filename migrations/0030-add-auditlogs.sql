-- Create auditLogs table
CREATE TABLE IF NOT EXISTS auditLogs (
    id VARCHAR(256) PRIMARY KEY,
    serverId VARCHAR(256),
    type VARCHAR(256),
    channelIds VARCHAR(256)[],
    UNIQUE(serverId, type)
)