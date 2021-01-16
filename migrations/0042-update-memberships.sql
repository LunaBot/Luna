-- Fix primary key in "memberships" table
ALTER TABLE memberships
DROP CONSTRAINT memberships_pkey,
ADD PRIMARY KEY (id),
ADD UNIQUE(serverId);