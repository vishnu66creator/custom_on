import {
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: integer("price").notNull(),
  colors: jsonb("colors").$type<string[]>().notNull(),
  sizes: jsonb("sizes").$type<string[]>().notNull(),
  image: text("image").notNull(),
  blurb: text("blurb").notNull(),
});

export const customers = pgTable(
  "customers",
  {
    id: text("id").primaryKey(),
    username: text("username").notNull(),
    role: text("role").notNull(),
    name: text("name"),
    email: text("email"),
    phone: text("phone"),
    passwordHash: text("password_hash"),
    theme: text("theme"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    usernameRoleUnique: uniqueIndex("customers_username_role_unique").on(
      table.username,
      table.role,
    ),
  }),
);

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const carts = pgTable(
  "carts",
  {
    id: text("id").primaryKey(),
    customerId: text("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    customerUnique: uniqueIndex("carts_customer_unique").on(table.customerId),
  }),
);

export const cartItems = pgTable("cart_items", {
  id: text("id").primaryKey(),
  cartId: text("cart_id")
    .notNull()
    .references(() => carts.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  color: text("color").notNull(),
  colorName: text("color_name").notNull(),
  size: text("size").notNull(),
  targetGroup: text("target_group").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),
  frontPreview: text("front_preview"),
  backPreview: text("back_preview"),
  summary: text("summary").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const savedDesigns = pgTable("saved_designs", {
  id: text("id").primaryKey(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  shirtColor: text("shirt_color").notNull(),
  shirtColorName: text("shirt_color_name").notNull(),
  customText: text("custom_text").notNull(),
  customTextColor: text("custom_text_color").notNull(),
  customTextFont: text("custom_text_font").notNull(),
  customTextSize: integer("custom_text_size").notNull(),
  customImage: text("custom_image"),
  price: integer("price").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const wishlistProducts = pgTable(
  "wishlist_products",
  {
    customerId: text("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    productId: text("product_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.customerId, table.productId] }),
  }),
);

export const referenceDesigns = pgTable("reference_designs", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  svg: text("svg").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull(),
  customerId: text("customer_id").references(() => customers.id, { onDelete: "set null" }),
  author: text("author").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "restrict" }),
  customerName: text("customer_name").notNull(),
  shippingName: text("shipping_name").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  shippingPhone: text("shipping_phone").notNull(),
  date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
  status: text("status").notNull(),
  totalPrice: integer("total_price").notNull(),
});

export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  shirtColor: text("shirt_color").notNull(),
  shirtColorName: text("shirt_color_name").notNull(),
  customText: text("custom_text").notNull(),
  customTextColor: text("custom_text_color").notNull(),
  customTextFont: text("custom_text_font").notNull(),
  customTextSize: integer("custom_text_size").notNull(),
  customImage: text("custom_image"),
  totalPrice: integer("total_price").notNull(),
  quantity: integer("quantity").notNull(),
  size: text("size").notNull(),
  targetGroup: text("target_group").notNull(),
});
