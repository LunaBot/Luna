-- Add channels and aliases to "users"
ALTER TABLE users
ADD COLUMN channels VARCHAR(256),
ADD COLUMN aliases VARCHAR(256);
