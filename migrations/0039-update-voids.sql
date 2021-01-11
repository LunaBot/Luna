-- Update serverId and channelids types to the "voids" table
ALTER TABLE voids
ALTER COLUMN serverId TYPE BIGINT USING CAST(serverId AS BIGINT),
ALTER COLUMN channelids TYPE BIGINT[] USING CAST(channelids AS BIGINT[]);