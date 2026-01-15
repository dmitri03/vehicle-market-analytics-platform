# Database (MySQL 8.0 / AWS RDS)

Schema and ingestion SQL targeting MySQL 8.0 on RDS with daily aggregates.

## Files
- `schema.sql` tables and constraints
- `indexes.sql` query indexes
- `seed.sql` roles + placeholder admin
- `ingestion/staging.sql` NDJSON staging tables
- `ingestion/load_ndjson.sql` example `LOAD DATA LOCAL INFILE`
- `ingestion/upsert_listings.sql` procedures to upsert from staging
- `ingestion/refresh_inventory.sql` rebuilds `inventory_daily`
- `ingestion/event_refresh_inventory.sql` optional daily refresh event

## Notes
- `LOAD DATA LOCAL INFILE` requires `local_infile=1` on server and client.
- If LOCAL INFILE is blocked, use `scripts/node-ingestion-scripts`.
