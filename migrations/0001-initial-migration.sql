-- Create servers table
CREATE TABLE IF NOT EXISTS servers (
   id VARCHAR(256) PRIMARY KEY,
   prefix VARCHAR(256)
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
   id VARCHAR(256),
   serverId VARCHAR(256),
   experience decimal,
   PRIMARY KEY (id, serverId)
);