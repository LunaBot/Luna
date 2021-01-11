-- Update timeout to the "voids" table
ALTER TABLE voids
DROP COLUMN timeout,
ADD COLUMN timeout BIGINT;