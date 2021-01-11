-- Create voids table
CREATE TABLE IF NOT EXISTS voids (
    id TEXT PRIMARY KEY,
    serverId TEXT,
    type TEXT,
    channelIds TEXT[]
)