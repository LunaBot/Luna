-- Add column "removedRoles" to "auditLog" table
ALTER TABLE auditLog
ADD COLUMN removedRoles VARCHAR(256)[];