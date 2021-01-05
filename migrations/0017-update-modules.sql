-- Fix "modules" primary key
ALTER TABLE modules
DROP CONSTRAINT modules_pkey,
ADD PRIMARY KEY (id);