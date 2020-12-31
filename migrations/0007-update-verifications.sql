-- Change allowChannels in "verifications" to an array of VARCHARs instead of a single VARCHAR
ALTER TABLE verifications
ALTER COLUMN allowedchannels TYPE VARCHAR(256)[] USING CAST(allowedchannels AS VARCHAR(256)[]);