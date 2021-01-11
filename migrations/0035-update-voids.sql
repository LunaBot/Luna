-- Add timeout to the "voids" table
ALTER TABLE voids
ADD COLUMN timeout BOOLEAN;