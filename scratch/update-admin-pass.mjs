import "dotenv/config";
import pg from "pg";
import crypto from "node:crypto";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const salt = crypto.randomBytes(16).toString("hex");

crypto.scrypt("admin", salt, 64, async (err, key) => {
  if (err) throw err;
  const hash = `scrypt$${salt}$${key.toString("hex")}`;
  const res = await pool.query("UPDATE customers SET password_hash = $1 WHERE email = 'admin@customon.in'", [hash]);
  console.log("Updated rows:", res.rowCount, "New hash:", hash);
  await pool.end();
});
