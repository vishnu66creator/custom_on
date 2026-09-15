import "dotenv/config";
import { pgTable, text, timestamp, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const customers = pgTable(
  "customers",
  {
    id: text("id").primaryKey(),
    username: text("username").notNull(),
    role: text("role").notNull(),
    name: text("name"),
    email: text("email"),
    phone: text("phone"),
    passwordHash: text("password_hash"),
    emailVerified: boolean("email_verified").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    usernameRoleUnique: uniqueIndex("customers_username_role_unique").on(
      table.username,
      table.role
    ),
    emailUnique: uniqueIndex("customers_email_unique").on(table.email),
  })
);

async function main() {
  const args = process.argv.slice(2);
  const emailArg = args[0] || process.env.ADMIN_EMAIL;
  const passwordArg = args[1] || process.env.ADMIN_PASSWORD;
  const nameArg = args[2] || process.env.ADMIN_NAME || "System Administrator";

  if (!emailArg || !passwordArg) {
    console.error("Usage: node scripts/create-admin.mjs <email> <password> [name]");
    console.error("Or set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.");
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is missing.");
    process.exit(1);
  }

  console.log(`Connecting to PostgreSQL to provision admin account for: ${emailArg}`);

  const pool = new pg.Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);

  const cleanEmail = emailArg.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(passwordArg, 10);
  const id = `admin-${crypto.randomUUID()}`;

  try {
    // Upsert admin user
    await db
      .insert(customers)
      .values({
        id,
        username: cleanEmail,
        email: cleanEmail,
        name: nameArg,
        role: "admin",
        passwordHash,
        emailVerified: true,
      })
      .onConflictDoUpdate({
        target: customers.email,
        set: {
          passwordHash,
          role: "admin",
          name: nameArg,
          emailVerified: true,
          updatedAt: new Date(),
        },
      });

    console.log(`✓ Admin account successfully created/updated: ${cleanEmail}`);
    console.log(`✓ Role: admin`);
    console.log(`✓ Access URL: http://localhost:5173/admin/login`);
  } catch (error) {
    console.error("Failed to provision admin account:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
