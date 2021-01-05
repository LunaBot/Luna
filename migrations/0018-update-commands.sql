-- Fix "commands" primary key
ALTER TABLE commands
DROP CONSTRAINT commands_pkey;

-- Add unique index to "commands"
ALTER TABLE commands
ADD PRIMARY KEY (id),
ADD UNIQUE (serverId, command);