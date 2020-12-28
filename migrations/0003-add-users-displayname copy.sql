-- Add displayName to "users"
ALTER TABLE users
ADD COLUMN displayName VARCHAR(256);
