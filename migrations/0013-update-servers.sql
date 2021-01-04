-- Add channels to "servers"
ALTER TABLE servers
ADD COLUMN channels VARCHAR(256);
