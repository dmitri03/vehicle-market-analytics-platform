USE marketplace_analytics;

-- Optional event to refresh inventory_daily at 02:15 server time.
-- Requires event_scheduler=ON.

DELIMITER $$

CREATE EVENT IF NOT EXISTS ev_refresh_inventory_daily
ON SCHEDULE EVERY 1 DAY
STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 2 HOUR + INTERVAL 15 MINUTE)
DO
BEGIN
  -- Vehicles.
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

  -- Parts.
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
END$$

DELIMITER ;
