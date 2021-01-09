-- Add column "channel" to "auditLog" table
ALTER TABLE auditLog
ADD COLUMN channel VARCHAR(256);