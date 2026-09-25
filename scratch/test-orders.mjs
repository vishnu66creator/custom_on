import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const res = await pool.query("SELECT o.id, o.customer_name, o.total_price, o.status, o.date, oi.product_name FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id");
console.log("ORDERS AND ITEMS:", res.rows);
await pool.end();
