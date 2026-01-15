import fs from "fs";
import { openConnection } from "./db.js";
import { readNdjsonLines } from "./ndjson.js";
import { insertBatch, clearStaging, processStaging, refreshInventory } from "./staging.js";
import { parseArgs } from "./cli.js";

function requireFileExists(path, flagName) {
  if (!path) throw new Error(`Missing required argument: --${flagName}`);
  if (!fs.existsSync(path)) throw new Error(`File not found: ${path}`);
}

async function ingestFile(conn, type, filePath, batchSize, { truncateStaging }) {
  console.log(`\n[${type}] Ingesting NDJSON: ${filePath}`);
  if (truncateStaging) {
    console.log(`[${type}] TRUNCATE staging table...`);
    await clearStaging(conn, type);
  }

  let batch = [];
  let inserted = 0;
  let lineCount = 0;

  for await (const line of readNdjsonLines(filePath)) {
    lineCount++;
    batch.push(line);

    if (batch.length >= batchSize) {
      const n = await insertBatch(conn, type, batch);
      inserted += n;
      batch = [];
      if (lineCount % (batchSize * 10) === 0) {
        console.log(`[${type}] Loaded ${lineCount} lines into staging...`);
      }
    }
  }

  if (batch.length) {
    const n = await insertBatch(conn, type, batch);
    inserted += n;
  }

  console.log(`[${type}] Staging rows inserted: ${inserted}`);

  console.log(`[${type}] Processing staging -> fact tables (upsert)...`);
  await processStaging(conn, type);
  console.log(`[${type}] Done processing.`);
}

async function main() {
  const args = parseArgs(process.argv);

  const type = args.type || "both";
  const batchSize = Number(process.env.BATCH_SIZE || args["batch-size"] || "1000");
  const truncateStaging = Boolean(args["truncate-staging"]);

  if (!["vehicle", "part", "both"].includes(type)) {
    throw new Error(`--type must be vehicle|part|both (got: ${type})`);
  }

  const vehicleFile = args.file && type === "vehicle" ? args.file : args.vehicles;
  const partFile = args.file && type === "part" ? args.file : args.parts;

  if (type === "vehicle") requireFileExists(vehicleFile, "file");
  if (type === "part") requireFileExists(partFile, "file");
  if (type === "both") {
    requireFileExists(vehicleFile, "vehicles");
    requireFileExists(partFile, "parts");
  }

  const conn = await openConnection();

  try {
    console.log("Connected to MySQL.");

    if (type === "vehicle") {
      await ingestFile(conn, "vehicle", vehicleFile, batchSize, { truncateStaging });
    } else if (type === "part") {
      await ingestFile(conn, "part", partFile, batchSize, { truncateStaging });
    } else {
      await ingestFile(conn, "vehicle", vehicleFile, batchSize, { truncateStaging });
      await ingestFile(conn, "part", partFile, batchSize, { truncateStaging });
    }

    if (args["refresh-inventory"]) {
      console.log("\n[agg] Refreshing inventory_daily...");
      await refreshInventory(conn);
      console.log("[agg] Done.");
    }

    console.log("\nAll done.");
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error("\nERROR:", err.message);
  process.exitCode = 1;
});
