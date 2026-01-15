USE marketplace_analytics;

-- Vehicle indexes.
CREATE INDEX IF NOT EXISTS idx_vehicle_make_model_year
  ON vehicle_listings (make_id, model_id, year);

CREATE INDEX IF NOT EXISTS idx_vehicle_snapshot_date
  ON vehicle_listings (snapshot_date);

CREATE INDEX IF NOT EXISTS idx_vehicle_location
  ON vehicle_listings (location_id);

CREATE INDEX IF NOT EXISTS idx_vehicle_price
  ON vehicle_listings (price);

CREATE INDEX IF NOT EXISTS idx_vehicle_model_date
  ON vehicle_listings (model_id, snapshot_date);

-- Part indexes.
CREATE INDEX IF NOT EXISTS idx_part_make_model_year
  ON part_listings (make_id, model_id, year);

CREATE INDEX IF NOT EXISTS idx_part_snapshot_date
  ON part_listings (snapshot_date);

CREATE INDEX IF NOT EXISTS idx_part_location
  ON part_listings (location_id);

CREATE INDEX IF NOT EXISTS idx_part_price
  ON part_listings (price);

CREATE INDEX IF NOT EXISTS idx_part_model_date
  ON part_listings (model_id, snapshot_date);
