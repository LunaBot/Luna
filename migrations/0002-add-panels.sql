DROP TABLE panels;

-- Create panels table
CREATE TABLE IF NOT EXISTS panels (
    id varchar(256) PRIMARY KEY,
    channel varchar(256),
    author varchar(256),
    authorImage varchar(256),
    authorLink varchar(256),
    title varchar(256),
    titleLink varchar(256),
    thumbnailLink varchar(256),
    body varchar(2000),
    footer varchar(256),
    colour varchar(256)
);