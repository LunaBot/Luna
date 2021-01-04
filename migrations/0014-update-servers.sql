-- Add aliases to "servers"
ALTER TABLE servers
ADD COLUMN aliases VARCHAR(256);
