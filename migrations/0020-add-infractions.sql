-- Create infractions table
CREATE TABLE IF NOT EXISTS infractions (
    id VARCHAR(256) PRIMARY KEY,
    serverId VARCHAR(256),
    type VARCHAR(256),
    silent BOOLEAN,
    moderatorId VARCHAR(256),
    userId VARCHAR(256)
)