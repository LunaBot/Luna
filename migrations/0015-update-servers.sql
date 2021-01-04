-- Add adminRoles, modRoles, muteRoles, setup to "servers"
ALTER TABLE servers
ADD COLUMN adminRoles VARCHAR(256),
ADD COLUMN modRoles VARCHAR(256),
ADD COLUMN muteRole VARCHAR(256),
ADD COLUMN setup BOOLEAN;
