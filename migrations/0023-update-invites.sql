-- Fix expiry column in "invites" table
ALTER TABLE invites
ALTER COLUMN expiry TYPE VARCHAR(256) USING CAST(expiry AS VARCHAR(256));