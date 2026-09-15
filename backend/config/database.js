/**
 * Backend Database Connection Configuration
 */
import { config } from "./environment.js";

export const isDbConfigured = Boolean(config.databaseUrl);

export async function getDbConnection() {
  if (!isDbConfigured) {
    console.warn("Notice: DATABASE_URL is not set. Running in local mock mode.");
    return null;
  }
  const pg = await import("pg");
  const pool = new pg.default.Pool({ connectionString: config.databaseUrl });
  return pool;
}
