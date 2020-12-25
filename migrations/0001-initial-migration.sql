DROP TABLE users;

CREATE TABLE IF NOT EXISTS users (
   id varchar(256),
   serverId varchar(256),
   experience decimal,
   PRIMARY KEY (id, serverId)
);