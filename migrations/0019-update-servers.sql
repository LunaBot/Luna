-- Add enabled column to "servers" table
ALTER TABLE servers
ADD COLUMN enabled BOOLEAN;