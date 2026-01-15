USE marketplace_analytics;

-- Rebuild daily aggregates; for large datasets, run by date range.

INSERT INTO inventory_daily (snapshot_date, make_id, model_id, state, listing_type, listing_count)
SELECT
  v.snapshot_date,
  v.make_id,
  v.model_id,
  l.state,
  'vehicle' AS listing_type,
  COUNT(*) AS listing_count
FROM vehicle_listings v
LEFT JOIN locations l ON l.location_id = v.location_id
GROUP BY v.snapshot_date, v.make_id, v.model_id, l.state
ON DUPLICATE KEY UPDATE listing_count = VALUES(listing_count);

INSERT INTO inventory_daily (snapshot_date, make_id, model_id, state, listing_type, listing_count)
SELECT
  p.snapshot_date,
  p.make_id,
  p.model_id,
  l.state,
  'part' AS listing_type,
  COUNT(*) AS listing_count
FROM part_listings p
LEFT JOIN locations l ON l.location_id = p.location_id
GROUP BY p.snapshot_date, p.make_id, p.model_id, l.state
ON DUPLICATE KEY UPDATE listing_count = VALUES(listing_count);
