-- Create memberships table
CREATE TABLE IF NOT EXISTS memberships (
    id VARCHAR(256),
    type VARCHAR(256),
    method VARCHAR(256),
    startTimestamp TIMESTAMP,
    endTimestamp TIMESTAMP,
    PRIMARY KEY (id, type)
);
