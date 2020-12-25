-- Clear old tables
DROP TABLE servers;
DROP TABLE users;

-- Create servers table
CREATE TABLE IF NOT EXISTS servers (
   id varchar(256) PRIMARY KEY,
   prefix varchar(256)
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
   id varchar(256),
   serverId varchar(256),
   experience decimal,
   PRIMARY KEY (id, serverId)
);