USE marketplace_analytics;

DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS sp_upsert_make(IN p_make_name VARCHAR(64), IN p_country VARCHAR(64), OUT o_make_id INT)
BEGIN
  IF p_make_name IS NULL OR p_make_name = '' THEN
    SET o_make_id = NULL;
  ELSE
    INSERT INTO makes (make_name, country)
    VALUES (p_make_name, p_country)
    ON DUPLICATE KEY UPDATE country = COALESCE(VALUES(country), country);
    SELECT make_id INTO o_make_id FROM makes WHERE make_name = p_make_name LIMIT 1;
  END IF;
END$$

CREATE PROCEDURE IF NOT EXISTS sp_upsert_model(IN p_make_id INT, IN p_model_name VARCHAR(128), IN p_model_aliases VARCHAR(512), OUT o_model_id INT)
BEGIN
  IF p_make_id IS NULL OR p_model_name IS NULL OR p_model_name = '' THEN
    SET o_model_id = NULL;
  ELSE
    INSERT INTO models (make_id, model_name, model_aliases)
    VALUES (p_make_id, p_model_name, p_model_aliases)
    ON DUPLICATE KEY UPDATE model_aliases = COALESCE(VALUES(model_aliases), model_aliases);
    SELECT model_id INTO o_model_id
    FROM models
    WHERE make_id = p_make_id AND model_name = p_model_name
    LIMIT 1;
  END IF;
END$$

CREATE PROCEDURE IF NOT EXISTS sp_upsert_location(
  IN p_city VARCHAR(128),
  IN p_state CHAR(2),
  IN p_lat DECIMAL(10,7),
  IN p_lng DECIMAL(10,7),
  IN p_token VARCHAR(64),
  OUT o_location_id INT
)
BEGIN
  -- Prefer token uniqueness when present.
  IF p_token IS NOT NULL AND p_token <> '' THEN
    INSERT INTO locations (city, state, latitude, longitude, fb_location_token)
    VALUES (NULLIF(p_city,''), NULLIF(p_state,''), p_lat, p_lng, p_token)
    ON DUPLICATE KEY UPDATE
      city = COALESCE(VALUES(city), city),
      state = COALESCE(VALUES(state), state),
      latitude = COALESCE(VALUES(latitude), latitude),
      longitude = COALESCE(VALUES(longitude), longitude);
    SELECT location_id INTO o_location_id FROM locations WHERE fb_location_token = p_token LIMIT 1;
  ELSE
    INSERT INTO locations (city, state, latitude, longitude, fb_location_token)
    VALUES (NULLIF(p_city,''), NULLIF(p_state,''), p_lat, p_lng, NULL);
    SET o_location_id = LAST_INSERT_ID();
  END IF;
END$$

-- Parse ISO timestamps with or without milliseconds.
CREATE FUNCTION IF NOT EXISTS fn_parse_iso_datetime(p_iso VARCHAR(64))
RETURNS DATETIME(3)
DETERMINISTIC
BEGIN
  DECLARE v_dt DATETIME(3);
  IF p_iso IS NULL OR p_iso = '' THEN
    RETURN NULL;
  END IF;

  SET v_dt = STR_TO_DATE(p_iso, '%Y-%m-%dT%H:%i:%s.%fZ');
  IF v_dt IS NULL THEN
    SET v_dt = STR_TO_DATE(p_iso, '%Y-%m-%dT%H:%i:%sZ');
  END IF;
  RETURN v_dt;
END$$

CREATE PROCEDURE IF NOT EXISTS sp_process_vehicle_staging()
BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE v_json JSON;

  DECLARE cur CURSOR FOR SELECT json_doc FROM staging_vehicle_ndjson;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO v_json;
    IF done = 1 THEN LEAVE read_loop; END IF;

    SET @listing_hash = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(v_json, '$.listing_hash')), '');
    SET @url         = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(v_json, '$.url')), '');
    SET @make_name   = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(v_json, '$.make')), '');
    SET @model_aliases = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(v_json, '$.model')), '');
    SET @model_name  = NULLIF(SUBSTRING_INDEX(COALESCE(@model_aliases,''), ',', 1), '');

    SET @year        = JSON_EXTRACT(v_json, '$.year');
    SET @model_config= NULLIF(JSON_UNQUOTE(JSON_EXTRACT(v_json, '$.model_config')), '');
    SET @price       = JSON_EXTRACT(v_json, '$.price');
    SET @mileage_text= NULLIF(JSON_UNQUOTE(JSON_EXTRACT(v_json, '$.mileage')), '');

    SET @city        = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(v_json, '$.city')), '');
    SET @state       = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(v_json, '$.state')), '');
    SET @lat         = JSON_EXTRACT(v_json, '$.latitude');
    SET @lng         = JSON_EXTRACT(v_json, '$.longitude');
    SET @is_dealership = COALESCE(JSON_EXTRACT(v_json, '$.is_dealership'), 0);

    SET @scraped_iso = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(v_json, '$.scraped_at')), '');
    SET @scraped_at  = COALESCE(fn_parse_iso_datetime(@scraped_iso), NOW(3));
    SET @snapshot_date = DATE(@scraped_at);

    SET @raw_title = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(v_json, '$.title')), '');

    -- Upsert dimensions.
    CALL sp_upsert_make(@make_name, NULL, @make_id);
    CALL sp_upsert_model(@make_id, @model_name, @model_aliases, @model_id);
    CALL sp_upsert_location(@city, @state, @lat, @lng, NULL, @location_id);

    -- Require hash + url.
    IF @listing_hash IS NOT NULL AND @url IS NOT NULL THEN
      INSERT INTO vehicle_listings
        (listing_hash, url, make_id, model_id, year, model_config, price, mileage_text, location_id, is_dealership, scraped_at, snapshot_date, raw_title)
      VALUES
        (@listing_hash, @url, @make_id, @model_id, @year, @model_config, @price, @mileage_text, @location_id, @is_dealership, @scraped_at, @snapshot_date, @raw_title)
      ON DUPLICATE KEY UPDATE
        price = COALESCE(VALUES(price), price),
        mileage_text = COALESCE(VALUES(mileage_text), mileage_text),
        location_id = COALESCE(VALUES(location_id), location_id),
        is_dealership = COALESCE(VALUES(is_dealership), is_dealership),
        scraped_at = GREATEST(scraped_at, VALUES(scraped_at)),
        snapshot_date = GREATEST(snapshot_date, VALUES(snapshot_date)),
        raw_title = COALESCE(VALUES(raw_title), raw_title);
    END IF;
  END LOOP;

  CLOSE cur;
END$$

CREATE PROCEDURE IF NOT EXISTS sp_process_part_staging()
BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE v_json JSON;

  DECLARE cur CURSOR FOR SELECT json_doc FROM staging_part_ndjson;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO v_json;
    IF done = 1 THEN LEAVE read_loop; END IF;

    SET @listing_hash = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(v_json, '$.listing_hash')), '');
    SET @url         = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(v_json, '$.url')), '');
    SET @make_name   = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(v_json, '$.make')), '');
    SET @model_aliases = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(v_json, '$.model')), '');
    SET @model_name  = NULLIF(SUBSTRING_INDEX(COALESCE(@model_aliases,''), ',', 1), '');

    SET @year        = JSON_EXTRACT(v_json, '$.year');
    SET @title       = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(v_json, '$.title')), '');
    SET @description = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(v_json, '$.description')), '');
    SET @price       = JSON_EXTRACT(v_json, '$.price');

    SET @city        = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(v_json, '$.city')), '');
    SET @state       = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(v_json, '$.state')), '');
    SET @lat         = JSON_EXTRACT(v_json, '$.latitude');
    SET @lng         = JSON_EXTRACT(v_json, '$.longitude');
    SET @is_dealership = COALESCE(JSON_EXTRACT(v_json, '$.is_dealership'), 0);

    SET @scraped_iso = NULLIF(JSON_UNQUOTE(JSON_EXTRACT(v_json, '$.scraped_at')), '');
    SET @scraped_at  = COALESCE(fn_parse_iso_datetime(@scraped_iso), NOW(3));
    SET @snapshot_date = DATE(@scraped_at);

    CALL sp_upsert_make(@make_name, NULL, @make_id);
    CALL sp_upsert_model(@make_id, @model_name, @model_aliases, @model_id);
    CALL sp_upsert_location(@city, @state, @lat, @lng, NULL, @location_id);

    IF @listing_hash IS NOT NULL AND @url IS NOT NULL THEN
      INSERT INTO part_listings
        (listing_hash, url, make_id, model_id, year, title, description, price, location_id, is_dealership, scraped_at, snapshot_date)
      VALUES
        (@listing_hash, @url, @make_id, @model_id, @year, @title, @description, @price, @location_id, @is_dealership, @scraped_at, @snapshot_date)
      ON DUPLICATE KEY UPDATE
        price = COALESCE(VALUES(price), price),
        location_id = COALESCE(VALUES(location_id), location_id),
        is_dealership = COALESCE(VALUES(is_dealership), is_dealership),
        scraped_at = GREATEST(scraped_at, VALUES(scraped_at)),
        snapshot_date = GREATEST(snapshot_date, VALUES(snapshot_date)),
        title = COALESCE(VALUES(title), title),
        description = COALESCE(VALUES(description), description);
    END IF;
  END LOOP;

  CLOSE cur;
END$$

DELIMITER ;
