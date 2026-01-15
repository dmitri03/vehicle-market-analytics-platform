CREATE DATABASE IF NOT EXISTS marketplace_analytics;
USE marketplace_analytics;

-- Reference tables.
CREATE TABLE IF NOT EXISTS makes (
  make_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  make_name VARCHAR(64) NOT NULL,
  country VARCHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (make_id),
  UNIQUE KEY uq_makes_make_name (make_name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS models (
  model_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  make_id INT UNSIGNED NOT NULL,
  model_name VARCHAR(128) NOT NULL,
  model_aliases VARCHAR(512) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (model_id),
  UNIQUE KEY uq_models_make_model (make_id, model_name),
  CONSTRAINT fk_models_make
    FOREIGN KEY (make_id) REFERENCES makes(make_id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS locations (
  location_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  city VARCHAR(128) NULL,
  state CHAR(2) NULL,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  fb_location_token VARCHAR(64) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (location_id),
  UNIQUE KEY uq_locations_token (fb_location_token),
  KEY idx_locations_state_city (state, city)
) ENGINE=InnoDB;

-- Auth/roles.
CREATE TABLE IF NOT EXISTS roles (
  role_id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  role_name VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id),
  UNIQUE KEY uq_roles_role_name (role_name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  user_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_roles (
  user_id INT UNSIGNED NOT NULL,
  role_id TINYINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_user_roles_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_user_roles_role
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Fact tables.
CREATE TABLE IF NOT EXISTS vehicle_listings (
  vehicle_listing_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  listing_hash CHAR(64) NOT NULL,      -- sha256 hex(url)
  url VARCHAR(1024) NOT NULL,

  make_id INT UNSIGNED NULL,
  model_id INT UNSIGNED NULL,

  year SMALLINT UNSIGNED NULL,
  model_config VARCHAR(255) NULL,

  price INT UNSIGNED NULL,
  mileage_text VARCHAR(64) NULL,

  location_id INT UNSIGNED NULL,
  is_dealership TINYINT(1) NOT NULL DEFAULT 0,

  -- Ingestion defaults scraped_at to NOW(3) if missing.
  scraped_at DATETIME(3) NOT NULL,
  snapshot_date DATE NOT NULL,         -- derived from scraped_at (for daily aggregations)

  raw_title VARCHAR(255) NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (vehicle_listing_id),
  UNIQUE KEY uq_vehicle_listing_hash (listing_hash),

  CONSTRAINT fk_vehicle_make FOREIGN KEY (make_id) REFERENCES makes(make_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_vehicle_model FOREIGN KEY (model_id) REFERENCES models(model_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_vehicle_location FOREIGN KEY (location_id) REFERENCES locations(location_id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS part_listings (
  part_listing_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  listing_hash CHAR(64) NOT NULL,
  url VARCHAR(1024) NOT NULL,

  make_id INT UNSIGNED NULL,
  model_id INT UNSIGNED NULL,

  year SMALLINT UNSIGNED NULL,
  title VARCHAR(255) NULL,
  description TEXT NULL,

  price INT UNSIGNED NULL,

  location_id INT UNSIGNED NULL,
  is_dealership TINYINT(1) NOT NULL DEFAULT 0,

  scraped_at DATETIME(3) NOT NULL,
  snapshot_date DATE NOT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (part_listing_id),
  UNIQUE KEY uq_part_listing_hash (listing_hash),

  CONSTRAINT fk_part_make FOREIGN KEY (make_id) REFERENCES makes(make_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_part_model FOREIGN KEY (model_id) REFERENCES models(model_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_part_location FOREIGN KEY (location_id) REFERENCES locations(location_id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Daily aggregates.
CREATE TABLE IF NOT EXISTS inventory_daily (
  snapshot_date DATE NOT NULL,
  make_id INT UNSIGNED NULL,
  model_id INT UNSIGNED NULL,
  state CHAR(2) NULL,
  listing_type ENUM('vehicle','part') NOT NULL,
  listing_count INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (snapshot_date, model_id, state, listing_type),
  KEY idx_inventory_daily_make (make_id),
  CONSTRAINT fk_inventory_make FOREIGN KEY (make_id) REFERENCES makes(make_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_inventory_model FOREIGN KEY (model_id) REFERENCES models(model_id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;
