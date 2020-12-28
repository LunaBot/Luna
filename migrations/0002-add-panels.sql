DROP TABLE panels;

-- Create panels table
CREATE TABLE IF NOT EXISTS panels (
    id VARCHAR(256) PRIMARY KEY,
    channel VARCHAR(256),
    author VARCHAR(256),
    authorImage VARCHAR(256),
    authorLink VARCHAR(256),
    title VARCHAR(256),
    titleLink VARCHAR(256),
    thumbnailLink VARCHAR(256),
    body VARCHAR(2000),
    footer VARCHAR(256),
    colour VARCHAR(256)
);