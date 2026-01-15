# Marketplace Scraper

Puppeteer scraper for Facebook Marketplace that outputs NDJSON for ingestion.

Key behavior:
- Search by make, model, and location
- Parse listing text and normalize fields
- Filter by model aliases
- Deduplicate by listing hash

## Setup
```bash
npm install
cp .env.example .env
```

## Run
Scrape all makes/models/locations (vehicles):
```bash
node src/index.js
```

Scrape a subset:
```bash
node src/index.js --make=bmw --model="series 3" --location=chicago --mode=vehicles
```

Scrape vehicles and parts:
```bash
node src/index.js --make=audi --model=q5 --location=seattle --mode=both
```

Runtime overrides:
```bash
node src/index.js --headless=false --maxScrolls=12 --scrollDelay=2500
```

## Output
- `./output/vehicles.ndjson`
- `./output/parts.ndjson`
