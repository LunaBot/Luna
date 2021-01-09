-- Add column "createdAt" to "auditLog" table
ALTER TABLE auditLog
ADD COLUMN createdAt TIMESTAMP DEFAULT current_timestamp;