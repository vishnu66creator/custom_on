import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
await pool.query("DELETE FROM customers WHERE id LIKE '%demo%' OR username LIKE '%demo%'");
const res = await pool.query("SELECT id, name, email, role FROM customers");
console.log("REMAINING CUSTOMERS IN DB:", res.rows);
await pool.end();
