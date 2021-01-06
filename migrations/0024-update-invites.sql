-- Fix createdTimestamp column in "invites" table
ALTER TABLE invites
ALTER COLUMN createdTimestamp TYPE VARCHAR(256) USING CAST(createdTimestamp AS VARCHAR(256));