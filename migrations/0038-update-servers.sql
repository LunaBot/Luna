-- Update adminRoles and modRoles types to the "servers" table
ALTER TABLE servers
ALTER COLUMN adminRoles TYPE BIGINT[] USING CAST(adminRoles AS BIGINT[]),
ALTER COLUMN modRoles TYPE BIGINT[] USING CAST(adminRoles AS BIGINT[]);