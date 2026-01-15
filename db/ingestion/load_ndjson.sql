USE marketplace_analytics;

-- Prereqs: local_infile enabled on server and client. Update file paths.

LOAD DATA LOCAL INFILE '/path/to/output/vehicles.ndjson'
INTO TABLE staging_vehicle_ndjson
CHARACTER SET utf8mb4
LINES TERMINATED BY '\n'
(@line)
SET json_text = @line;

LOAD DATA LOCAL INFILE '/path/to/output/parts.ndjson'
INTO TABLE staging_part_ndjson
CHARACTER SET utf8mb4
LINES TERMINATED BY '\n'
(@line)
SET json_text = @line;
