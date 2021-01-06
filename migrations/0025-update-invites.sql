-- Add column expired to "invites" table
ALTER TABLE invites
ADD COLUMN expired BOOLEAN;