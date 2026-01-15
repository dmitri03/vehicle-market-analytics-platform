// Bulk insert NDJSON into staging tables (avoids LOAD DATA LOCAL INFILE).

export function stagingTableForType(type) {
  if (type === "vehicle") return "staging_vehicle_ndjson";
  if (type === "part") return "staging_part_ndjson";
  throw new Error(`Unknown type: ${type}`);
}

export async function insertBatch(conn, type, jsonLines) {
  if (!jsonLines.length) return 0;

  const table = stagingTableForType(type);

  const placeholders = jsonLines.map(() => "(?)").join(",");
  const sql = `INSERT INTO ${table} (json_text) VALUES ${placeholders}`;
  const params = jsonLines;

  const [result] = await conn.execute(sql, params);
  return result.affectedRows || 0;
}

export async function clearStaging(conn, type) {
  const table = stagingTableForType(type);
  await conn.execute(`TRUNCATE TABLE ${table}`);
}

export async function processStaging(conn, type) {
  if (type === "vehicle") {
    await conn.execute("CALL sp_process_vehicle_staging();");
    return;
  }
  if (type === "part") {
    await conn.execute("CALL sp_process_part_staging();");
    return;
  }
  throw new Error(`Unknown type: ${type}`);
}

export async function refreshInventory(conn) {
  // Inline refresh to avoid sourcing SQL files.
  const sql = `
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
  `;
  await conn.query(sql);
}
