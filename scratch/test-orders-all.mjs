import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const ordersRes = await pool.query(`
  SELECT 
    o.id, 
    o.customer_name, 
    o.shipping_name, 
    o.total_price, 
    o.status, 
    o.date, 
    oi.product_name, 
    oi.size 
  FROM orders o 
  LEFT JOIN order_items oi ON oi.order_id = o.id
`);
console.log("ALL REAL ORDERS IN DB:", ordersRes.rows);
await pool.end();
