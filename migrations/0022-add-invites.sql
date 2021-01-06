-- Create invites table
CREATE TABLE IF NOT EXISTS invites (
    id VARCHAR(256) PRIMARY KEY,
    serverId VARCHAR(256),
    code VARCHAR(256),
    inviter VARCHAR(256),
    channelId VARCHAR(256),
    expiry TIMESTAMP,
    createdTimestamp TIMESTAMP
)