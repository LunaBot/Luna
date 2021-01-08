-- Rename column "disallowedRoles" in "commands" to "deniedRoles" table
ALTER TABLE commands
RENAME COLUMN disallowedRoles TO deniedRoles;