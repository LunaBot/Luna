-- Add unique constraint to "modules"
ALTER TABLE modules
ADD UNIQUE (serverId, name);
