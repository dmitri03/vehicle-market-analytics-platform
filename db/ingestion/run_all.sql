-- Run in order.
SOURCE schema.sql;
SOURCE indexes.sql;
SOURCE seed.sql;
SOURCE ingestion/staging.sql;
SOURCE ingestion/upsert_listings.sql;
-- Load NDJSON into staging (load_ndjson.sql), then:
CALL sp_process_vehicle_staging();
CALL sp_process_part_staging();
SOURCE ingestion/refresh_inventory.sql;
