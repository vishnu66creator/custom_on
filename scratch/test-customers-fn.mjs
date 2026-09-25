import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const rows = await pool.query("SELECT id, name, email, phone, role, email_verified, created_at FROM customers WHERE role = 'customer'");
console.log("REGISTERED CUSTOMERS DIRECT FROM DB:", rows.rows);
await pool.end();
