const { Pool } = require("pg");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is not set. Create a .env file with DATABASE_URL=postgres://... before running the seed script.",
  );
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const APPAREL_COLORS = [
  "#0A0A0A", // Black
  "#FFFFFF", // White
  "#1F2A44", // Navy
  "#9CA3AF", // Heather Gray
  "#374151", // Charcoal
  "#FF5F1F", // Brand Orange
  "#F5EFE0", // Cream
  "#7F1D1D", // Maroon
  "#2D4A3E", // Forest Green
  "#1D4ED8", // Royal Blue
  "#38BDF8", // Sky Blue
  "#EAB308", // Mustard
  "#DC2626", // Red
  "#EC4899", // Pink
  "#8B5CF6", // Purple
];

const STANDARD_SIZES = ["S", "M", "L"];

const passwordHash = (password) =>
  require("node:crypto").createHash("sha256").update(password).digest("hex");

const customers = [
  {
    id: "customer-demo-7090637746",
    username: "7090637746",
    role: "customer",
    name: "Demo Customer",
    phone: "7090637746",
    passwordHash: passwordHash("password"),
  },
  {
    id: "owner-demo-jdoe",
    username: "owner_jdoe",
    role: "shop-owner",
    name: "John Doe",
    phone: null,
    passwordHash: passwordHash("password"),
  },
];

const products = [
  {
    id: "regular-tee",
    name: "Regular Fit T-Shirt",
    category: "T-Shirts",
    price: 25,
    colors: APPAREL_COLORS,
    sizes: STANDARD_SIZES,
    image: "product-tee.jpg",
    blurb: "Classic everyday wear. 100% combed cotton blank built for custom prints.",
  },
  {
    id: "oversized-tee",
    name: "Oversized T-Shirt",
    category: "T-Shirts",
    price: 32,
    colors: APPAREL_COLORS,
    sizes: STANDARD_SIZES,
    image: "product-oversized.jpg",
    blurb: "Modern streetwear cut with relaxed drop-shoulder drape and premium heavyweight finish.",
  },

  {
    id: "polo-tee",
    name: "Polo T-Shirt",
    category: "T-Shirts",
    price: 34,
    colors: APPAREL_COLORS,
    sizes: STANDARD_SIZES,
    image: "product-polo.jpg",
    blurb: "Smart casual piqué knit featuring ribbed collar, button placket, and tailored fit.",
  },
  {
    id: "full-sleeve-tee",
    name: "Full-Sleeve T-Shirt",
    category: "T-Shirts",
    price: 30,
    colors: APPAREL_COLORS,
    sizes: STANDARD_SIZES,
    image: "full-sleeve-tee-front",
    blurb:
      "Versatile long-sleeve T-shirt with ribbed cuffs, ideal for year-round layering and prints.",
  },
  {
    id: "pullover-hoodie",
    name: "Pullover Hoodie",
    category: "Hoodies",
    price: 45,
    colors: APPAREL_COLORS,
    sizes: STANDARD_SIZES,
    image: "product-hoodie.jpg",
    blurb:
      "Heavyweight 400 GSM brushed fleece with double-lined hood and spacious kangaroo pocket.",
  },
  {
    id: "zip-up-hoodie",
    name: "Zip-Up Hoodie",
    category: "Hoodies",
    price: 48,
    colors: APPAREL_COLORS,
    sizes: STANDARD_SIZES,
    image: "zip-up-hoodie-front",
    blurb:
      "Casual layering hoodie with full center metal zipper, split kangaroo pockets, and ribbed hem.",
  },
];

async function seed() {
  try {
    const validIds = products.map((p) => p.id);

    // Remove legacy/test products that are not part of the active catalog.
    await pool.query(`DELETE FROM products WHERE id NOT IN ($1, $2, $3, $4, $5, $6)`, validIds);
    console.log("Cleaned up legacy non-apparel records.");

    // Upsert the six apparel products
    for (const p of products) {
      await pool.query(
        `INSERT INTO products (id, name, category, price, colors, sizes, image, blurb)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           category = EXCLUDED.category,
           price = EXCLUDED.price,
           colors = EXCLUDED.colors,
           sizes = EXCLUDED.sizes,
           image = EXCLUDED.image,
           blurb = EXCLUDED.blurb`,
        [
          p.id,
          p.name,
          p.category,
          p.price,
          JSON.stringify(p.colors),
          JSON.stringify(p.sizes),
          p.image,
          p.blurb,
        ],
      );
      console.log("Upserted apparel product:", p.id, `(${p.name})`);
    }

    for (const customer of customers) {
      await pool.query(
        `INSERT INTO customers (id, username, role, name, phone, password_hash)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           username = EXCLUDED.username,
           role = EXCLUDED.role,
           name = EXCLUDED.name,
           phone = EXCLUDED.phone,
           password_hash = EXCLUDED.password_hash`,
        [
          customer.id,
          customer.username,
          customer.role,
          customer.name,
          customer.phone,
          customer.passwordHash,
        ],
      );
      console.log("Upserted demo customer:", customer.username);
    }

    console.log("Seeding six-product apparel catalog and demo accounts complete.");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await pool.end();
  }
}

seed();
