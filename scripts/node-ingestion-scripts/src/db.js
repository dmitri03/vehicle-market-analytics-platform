import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export function getDbConfig() {
  const host = process.env.DB_HOST;
  const port = Number(process.env.DB_PORT || "3306");
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_DATABASE;

  if (!host || !user || !password || !database) {
    throw new Error("Missing DB_* env vars. Copy .env.example to .env and fill values.");
  }

  return { host, port, user, password, database };
}

export async function openConnection() {
  const cfg = getDbConfig();
  const conn = await mysql.createConnection({
    ...cfg,
    // Configure TLS here if required by your DB.
    // ssl: { rejectUnauthorized: true }
    multipleStatements: true
  });
  return conn;
}
