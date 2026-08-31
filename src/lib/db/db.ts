import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Never hardcode credentials. Without DATABASE_URL the app falls back to
// local/sample data in the UI layer instead of attempting a connection.
const connectionString = process.env["DATABASE_URL"];

export const hasDatabase = Boolean(connectionString);

const pool = connectionString ? new Pool({ connectionString }) : null;

export const db = pool ? drizzle(pool, { schema }) : null;
