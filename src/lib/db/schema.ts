import {
  boolean,
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
    emailVerified: boolean("email_verified").default(false).notNull(),
    emailVerificationOtpHash: text("email_verification_otp_hash"),
    emailVerificationOtpExpiresAt: timestamp("email_verification_otp_expires_at", { withTimezone: true }),
    emailVerificationAttempts: integer("email_verification_attempts").default(0).notNull(),
    emailVerificationLastSentAt: timestamp("email_verification_last_sent_at", { withTimezone: true }),
    emailVerificationVerifiedAt: timestamp("email_verification_verified_at", { withTimezone: true }),
    phoneVerified: boolean("phone_verified").default(false).notNull(),
    provider: text("provider").default("email").notNull(),
    providerAccountId: text("provider_account_id"),
    avatar: text("avatar"),
    theme: text("theme"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    usernameRoleUnique: uniqueIndex("customers_username_role_unique").on(
      table.username,
      table.role,
    ),
    emailUnique: uniqueIndex("customers_email_unique").on(table.email),
    phoneRoleUnique: uniqueIndex("customers_phone_role_unique").on(table.phone, table.role),
  }),
);

export const otpVerifications = pgTable(
  "otp_verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    otpHash: text("otp_hash").notNull(),
    purpose: text("purpose").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    attempts: integer("attempts").default(0).notNull(),
    resendAvailableAt: timestamp("resend_available_at", { withTimezone: true }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    identifierIdx: uniqueIndex("otp_verifications_identifier_idx").on(table.identifier),
  }),
);

export const emailVerifications = pgTable(
  "email_verifications",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    phone: text("phone"),
    passwordHash: text("password_hash").notNull(),
    otpHash: text("otp_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    attempts: integer("attempts").default(0).notNull(),
    resendAvailableAt: timestamp("resend_available_at", { withTimezone: true }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("email_verifications_email_idx").on(table.email),
  }),
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    otpHash: text("otp_hash").notNull(),
    resetTokenHash: text("reset_token_hash"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    attempts: integer("attempts").default(0).notNull(),
    resendAvailableAt: timestamp("resend_available_at", { withTimezone: true }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("password_reset_tokens_email_idx").on(table.email),
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
  designState: jsonb("design_state").$type<Record<string, unknown>>(),
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
  designState: jsonb("design_state").$type<Record<string, unknown>>(),
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
  designState: jsonb("design_state").$type<Record<string, unknown>>(),
});
