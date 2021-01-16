-- Add "serverId" to "memberships" table
ALTER TABLE memberships
ADD COLUMN serverId BIGINT;