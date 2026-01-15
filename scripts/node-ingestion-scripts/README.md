# NDJSON Ingestion (Node.js -> MySQL)

Ingest scraper NDJSON into MySQL staging tables and run stored procedures.

## Requirements
- Node 18+
- MySQL schema and procedures applied from `db/`

## Setup
```bash
npm install
cp .env.example .env
```

## Run
```bash
# Vehicles
node src/ingest.js --type vehicle --file /path/to/vehicles.ndjson

# Parts
node src/ingest.js --type part --file /path/to/parts.ndjson

# Both
node src/ingest.js --type both --vehicles /path/to/vehicles.ndjson --parts /path/to/parts.ndjson

# Optional: refresh inventory after ingestion
node src/ingest.js --type both --vehicles ... --parts ... --refresh-inventory
```

## Notes
- Inserts raw NDJSON into staging; procedures handle validation and upserts.
- Upserts are keyed by `listing_hash`.
