import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import { and, desc, eq } from "drizzle-orm";
import type { CartItem } from "../cart-store";
import type { Order, OrderStatus } from "../orders-store";
import {
  customers,
  sessions,
  carts,
  cartItems,
  savedDesigns,
  wishlistProducts,
  referenceDesigns,
  reviews,
  orders,
  orderItems,
} from "./schema";

const SESSION_COOKIE = "customon_session";
const SESSION_DAYS = 30;

type CustomerRole = "customer" | "shop-owner";
type CustomerView = {
  id: string;
  username: string;
  role: CustomerRole;
  name?: string;
  email?: string;
  phone?: string;
};
type DbCustomer = typeof customers.$inferSelect;

type AuthInput = { username: string; role: CustomerRole; password?: string };
type RegisterInput = AuthInput & { name: string };
type CartInput = Omit<CartItem, "id">;
type OrderInput = Omit<Order, "id" | "date" | "status"> & {
  productId?: string;
  quantity?: number;
};
type ReviewInput = { productId: string; author: string; rating: number; comment: string };
type ReferenceDesignInput = { name: string; svg: string };
type SavedDesignInput = {
  productId: string;
  productName: string;
  shirtColor: string;
  shirtColorName: string;
  customText: string;
  customTextColor: string;
  customTextFont: string;
  customTextSize: number;
  customImage: string | null;
  price: number;
  designState?: Record<string, unknown> | null;
};
type SavedDesignRecord = SavedDesignInput & { id: string; createdAt: string };

let schemaEnsured = false;

async function ensureSchemaColumns(dbInstance: any) {
  if (schemaEnsured) return;
  schemaEnsured = true;
  try {
    const { sql } = await import("drizzle-orm");
    await dbInstance.execute(sql`ALTER TABLE "cart_items" ADD COLUMN IF NOT EXISTS "design_state" jsonb;`);
    await dbInstance.execute(sql`ALTER TABLE "saved_designs" ADD COLUMN IF NOT EXISTS "design_state" jsonb;`);
    await dbInstance.execute(sql`ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "design_state" jsonb;`);
  } catch (err) {
    console.error("Auto schema column check notice:", err);
  }
}

async function requireDb() {
  const { db } = await import("./db");
  if (!db) throw new Error("The database is not configured on the server.");
  await ensureSchemaColumns(db);
  return db;
}

function toCustomerView(row: DbCustomer): CustomerView {
  return {
    id: row.id,
    username: row.username,
    role: row.role as CustomerRole,
    ...(row.name ? { name: row.name } : {}),
    ...(row.email ? { email: row.email } : {}),
    ...(row.phone ? { phone: row.phone } : {}),
  };
}

function normalizePhone(value: string) {
  const compact = value.trim().replace(/[\s\-().]/g, "");
  if (compact.startsWith("+91")) return compact.slice(3);
  if (compact.startsWith("0091")) return compact.slice(4);
  if (compact.length === 11 && compact.startsWith("0")) return compact.slice(1);
  return compact;
}

function canonicalUsername(value: string, role: CustomerRole) {
  return role === "customer" ? normalizePhone(value) : value.trim().toLowerCase();
}

function customerId(role: CustomerRole, username: string) {
  return `${role}-${canonicalUsername(username, role).replace(/[^a-z0-9]+/gi, "-")}`;
}

async function passwordHash(password: string) {
  const crypto = await import("node:crypto");
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function sessionCustomer() {
  const sessionId = getCookie(SESSION_COOKIE);
  if (!sessionId) return null;
  const db = await requireDb();
  const rows = await db
    .select({ customer: customers, expiresAt: sessions.expiresAt })
    .from(sessions)
    .innerJoin(customers, eq(sessions.customerId, customers.id))
    .where(eq(sessions.id, sessionId))
    .limit(1);
  const row = rows[0];
  if (!row || row.expiresAt.getTime() <= Date.now()) {
    deleteCookie(SESSION_COOKIE, { httpOnly: true, sameSite: "lax", path: "/" });
    return null;
  }
  return row.customer;
}

async function requireCustomer() {
  const customer = await sessionCustomer();
  if (!customer) throw new Error("Your session has expired. Please sign in again.");
  return customer;
}

async function createSession(customerIdValue: string) {
  const crypto = await import("node:crypto");
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const db = await requireDb();
  await db.insert(sessions).values({ id, customerId: customerIdValue, expiresAt });
  setCookie(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export const getCurrentCustomer = createServerFn({ method: "GET" }).handler(async () => {
  const customer = await sessionCustomer();
  return customer ? toCustomerView(customer) : null;
});

export const loginCustomer = createServerFn({ method: "POST" })
  .validator((data: AuthInput) => data)
  .handler(async ({ data }) => {
    try {
      const username = canonicalUsername(data.username, data.role);
      const db = await requireDb();
      const row = (
        await db
          .select()
          .from(customers)
          .where(and(eq(customers.username, username), eq(customers.role, data.role)))
          .limit(1)
      )[0];
      if (!row) {
        return {
          success: false as const,
          error:
            data.role === "customer"
              ? "No account was found for this phone number."
              : "No registered account was found.",
        };
      }
      if (row.passwordHash && row.passwordHash !== (await passwordHash(data.password ?? ""))) {
        return { success: false as const, error: "Incorrect password." };
      }
      await createSession(row.id);
      return { success: true as const, user: toCustomerView(row) };
    } catch (error) {
      console.error("Database error in loginCustomer:", error);
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("The database is not configured")) {
        return { success: false as const, error: msg };
      }
      return { success: false as const, error: "Unable to connect to the account service." };
    }
  });

export const registerCustomer = createServerFn({ method: "POST" })
  .validator((data: RegisterInput) => data)
  .handler(async ({ data }) => {
    try {
      const username = canonicalUsername(data.username, data.role);
      const id = customerId(data.role, username);
      const db = await requireDb();
      const existing = await db
        .select({ id: customers.id })
        .from(customers)
        .where(and(eq(customers.username, username), eq(customers.role, data.role)))
        .limit(1);
      if (existing.length)
        return { success: false as const, error: "This account is already registered." };
      const row = {
        id,
        username,
        role: data.role,
        name: data.name.trim(),
        phone: data.role === "customer" ? username : null,
        passwordHash: data.password ? await passwordHash(data.password) : null,
      };
      await db.insert(customers).values(row);
      const inserted = (await db.select().from(customers).where(eq(customers.id, id)).limit(1))[0];
      if (!inserted) throw new Error("Registration could not be completed.");
      await createSession(id);
      return { success: true as const, user: toCustomerView(inserted) };
    } catch (error) {
      console.error("Database error in registerCustomer:", error);
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("The database is not configured")) {
        return { success: false as const, error: msg };
      }
      return { success: false as const, error: "Unable to connect to the account service." };
    }
  });

export const logoutCustomer = createServerFn({ method: "POST" }).handler(async () => {
  const sessionId = getCookie(SESSION_COOKIE);
  if (sessionId) {
    const db = await requireDb();
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }
  deleteCookie(SESSION_COOKIE, { httpOnly: true, sameSite: "lax", path: "/" });
  return { success: true };
});

async function ensureCart(customerIdValue: string) {
  const db = await requireDb();
  const existing = await db
    .select()
    .from(carts)
    .where(eq(carts.customerId, customerIdValue))
    .limit(1);
  if (existing[0]) return existing[0];
  const row = { id: `CART-${customerIdValue}`, customerId: customerIdValue };
  await db.insert(carts).values(row);
  return { ...row, createdAt: new Date(), updatedAt: new Date() };
}

function mapCartItem(row: typeof cartItems.$inferSelect): CartItem {
  return {
    id: row.id,
    productId: row.productId,
    productName: row.productName,
    color: row.color,
    colorName: row.colorName,
    size: row.size,
    targetGroup: row.targetGroup as "Men",
    quantity: row.quantity,
    unitPrice: row.unitPrice,
    frontPreview: row.frontPreview,
    backPreview: row.backPreview,
    summary: row.summary,
    designState: row.designState,
  };
}

export const getCustomerCart = createServerFn({ method: "GET" }).handler(async () => {
  const customer = await requireCustomer();
  const cart = await ensureCart(customer.id);
  const db = await requireDb();
  return (await db.select().from(cartItems).where(eq(cartItems.cartId, cart.id))).map(mapCartItem);
});

export const addCustomerCartItem = createServerFn({ method: "POST" })
  .validator((data: CartInput) => data)
  .handler(async ({ data }) => {
    const customer = await requireCustomer();
    const cart = await ensureCart(customer.id);
    const db = await requireDb();
    const item = { id: `CI-${cryptoRandomId()}`, cartId: cart.id, ...data };
    try {
      await db.insert(cartItems).values(item);
    } catch (err) {
      console.error("Cart item insert error, retrying without designState:", err);
      const { designState, ...fallbackItem } = item;
      await db.insert(cartItems).values(fallbackItem);
    }
    return mapCartItem({ ...item, createdAt: new Date(), updatedAt: new Date() });
  });

export const removeCustomerCartItem = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const customer = await requireCustomer();
    const cart = await ensureCart(customer.id);
    const db = await requireDb();
    await db.delete(cartItems).where(and(eq(cartItems.id, data.id), eq(cartItems.cartId, cart.id)));
    return { success: true };
  });

export const setCustomerCartQuantity = createServerFn({ method: "POST" })
  .validator((data: { id: string; quantity: number }) => data)
  .handler(async ({ data }) => {
    const customer = await requireCustomer();
    const cart = await ensureCart(customer.id);
    const db = await requireDb();
    await db
      .update(cartItems)
      .set({
        quantity: Math.max(1, Math.min(999, Math.round(data.quantity))),
        updatedAt: new Date(),
      })
      .where(and(eq(cartItems.id, data.id), eq(cartItems.cartId, cart.id)));
    return { success: true };
  });

export const clearCustomerCart = createServerFn({ method: "POST" }).handler(async () => {
  const customer = await requireCustomer();
  const cart = await ensureCart(customer.id);
  const db = await requireDb();
  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
  return { success: true };
});

function cryptoRandomId() {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1_000_000).toString(36)}`;
}

function mapSavedDesign(row: typeof savedDesigns.$inferSelect): SavedDesignRecord {
  return {
    id: row.id,
    productId: row.productId,
    productName: row.productName,
    shirtColor: row.shirtColor,
    shirtColorName: row.shirtColorName,
    customText: row.customText,
    customTextColor: row.customTextColor,
    customTextFont: row.customTextFont,
    customTextSize: row.customTextSize,
    customImage: row.customImage,
    price: row.price,
    designState: row.designState,
    createdAt: row.createdAt.toISOString(),
  };
}

export const getCustomerSavedDesigns = createServerFn({ method: "GET" }).handler(async () => {
  const customer = await requireCustomer();
  const db = await requireDb();
  return (
    await db
      .select()
      .from(savedDesigns)
      .where(eq(savedDesigns.customerId, customer.id))
      .orderBy(desc(savedDesigns.createdAt))
  ).map(mapSavedDesign);
});

export const getSavedDesignById = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const customer = await requireCustomer();
    const db = await requireDb();
    const rows = await db
      .select()
      .from(savedDesigns)
      .where(and(eq(savedDesigns.id, data.id), eq(savedDesigns.customerId, customer.id)))
      .limit(1);
    if (!rows[0]) return null;
    return mapSavedDesign(rows[0]);
  });

export const saveCustomerDesign = createServerFn({ method: "POST" })
  .validator((data: SavedDesignInput) => data)
  .handler(async ({ data }) => {
    const customer = await requireCustomer();
    const db = await requireDb();
    const row = { id: `DES-${cryptoRandomId()}`, customerId: customer.id, ...data };
    try {
      await db.insert(savedDesigns).values(row);
    } catch (err) {
      console.error("Saved design insert error, retrying without designState:", err);
      const { designState, ...fallbackRow } = row;
      await db.insert(savedDesigns).values(fallbackRow);
    }
    return mapSavedDesign({ ...row, createdAt: new Date() });
  });

export const removeCustomerDesign = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const customer = await requireCustomer();
    const db = await requireDb();
    await db
      .delete(savedDesigns)
      .where(and(eq(savedDesigns.id, data.id), eq(savedDesigns.customerId, customer.id)));
    return { success: true };
  });

export const getCustomerWishlist = createServerFn({ method: "GET" }).handler(async () => {
  const customer = await requireCustomer();
  const db = await requireDb();
  return (
    await db
      .select({ productId: wishlistProducts.productId })
      .from(wishlistProducts)
      .where(eq(wishlistProducts.customerId, customer.id))
  ).map((row) => row.productId);
});

export const toggleCustomerWishlist = createServerFn({ method: "POST" })
  .validator((data: { productId: string }) => data)
  .handler(async ({ data }) => {
    const customer = await requireCustomer();
    const db = await requireDb();
    const existing = await db
      .select()
      .from(wishlistProducts)
      .where(
        and(
          eq(wishlistProducts.customerId, customer.id),
          eq(wishlistProducts.productId, data.productId),
        ),
      )
      .limit(1);
    if (existing.length) {
      await db
        .delete(wishlistProducts)
        .where(
          and(
            eq(wishlistProducts.customerId, customer.id),
            eq(wishlistProducts.productId, data.productId),
          ),
        );
      return { added: false };
    }
    await db
      .insert(wishlistProducts)
      .values({ customerId: customer.id, productId: data.productId });
    return { added: true };
  });

export const listReviews = createServerFn({ method: "GET" })
  .validator((data: { productId: string }) => data)
  .handler(async ({ data }) => {
    const db = await requireDb();
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, data.productId))
      .orderBy(desc(reviews.createdAt));
  });

export const addProductReview = createServerFn({ method: "POST" })
  .validator((data: ReviewInput) => data)
  .handler(async ({ data }) => {
    const customer = await requireCustomer();
    const db = await requireDb();
    const row = {
      id: `REV-${cryptoRandomId()}`,
      productId: data.productId,
      customerId: customer.id,
      author: data.author,
      rating: Math.max(1, Math.min(5, Math.round(data.rating))),
      comment: data.comment,
    };
    await db.insert(reviews).values(row);
    return { ...row, createdAt: new Date() };
  });

function mapOrder(row: typeof orders.$inferSelect, item: typeof orderItems.$inferSelect): Order {
  return {
    id: row.id,
    customerName: row.customerName,
    shippingName: row.shippingName,
    shippingAddress: row.shippingAddress,
    shippingPhone: row.shippingPhone,
    date: row.date.toISOString(),
    status: row.status as OrderStatus,
    productName: item.productName,
    shirtColor: item.shirtColor,
    shirtColorName: item.shirtColorName,
    customText: item.customText,
    customTextColor: item.customTextColor,
    customTextFont: item.customTextFont,
    customTextSize: item.customTextSize,
    customImage: item.customImage,
    totalPrice: item.totalPrice,
    size: item.size,
    targetGroup: item.targetGroup as "Men",
    designState: item.designState,
  };
}

export const getCustomerOrders = createServerFn({ method: "GET" }).handler(async () => {
  const customer = await requireCustomer();
  const db = await requireDb();
  const rows = await db
    .select({ order: orders, item: orderItems })
    .from(orders)
    .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(eq(orders.customerId, customer.id))
    .orderBy(desc(orders.date));
  return rows.map(({ order, item }) => mapOrder(order, item));
});

export const getAllOrders = createServerFn({ method: "GET" }).handler(async () => {
  const customer = await requireCustomer();
  if (customer.role !== "shop-owner") throw new Error("Shop owner access required.");
  const db = await requireDb();
  const rows = await db
    .select({ order: orders, item: orderItems })
    .from(orders)
    .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
    .orderBy(desc(orders.date));
  return rows.map(({ order, item }) => mapOrder(order, item));
});

export const createCustomerOrder = createServerFn({ method: "POST" })
  .validator(
    (data: {
      shippingName: string;
      shippingAddress: string;
      shippingPhone: string;
      items: OrderInput[];
    }) => data,
  )
  .handler(async ({ data }) => {
    const customer = await requireCustomer();
    const db = await requireDb();
    const orderId = `ORD-${cryptoRandomId()}`;
    const totalPrice = data.items.reduce((sum, item) => sum + item.totalPrice, 0);
    await db.transaction(async (tx) => {
      await tx.insert(orders).values({
        id: orderId,
        customerId: customer.id,
        customerName: customer.name ?? customer.username,
        shippingName: data.shippingName.trim(),
        shippingAddress: data.shippingAddress.trim(),
        shippingPhone: data.shippingPhone.trim(),
        status: "Pending",
        totalPrice,
      });
      await tx.insert(orderItems).values(
        data.items.map((item) => ({
          id: `OI-${cryptoRandomId()}`,
          orderId,
          productId: item.productId ?? "unknown",
          productName: item.productName,
          shirtColor: item.shirtColor,
          shirtColorName: item.shirtColorName,
          customText: item.customText,
          customTextColor: item.customTextColor,
          customTextFont: item.customTextFont,
          customTextSize: item.customTextSize,
          customImage: item.customImage,
          totalPrice: item.totalPrice,
          quantity: item.quantity ?? 1,
          size: item.size,
          targetGroup: item.targetGroup,
          designState: item.designState ?? null,
        })),
      );
    });
    return { success: true, orderId };
  });

export const updateCustomerOrderStatus = createServerFn({ method: "POST" })
  .validator((data: { orderId: string; status: OrderStatus }) => data)
  .handler(async ({ data }) => {
    const customer = await requireCustomer();
    if (customer.role !== "shop-owner") throw new Error("Shop owner access required.");
    const db = await requireDb();
    await db.update(orders).set({ status: data.status }).where(eq(orders.id, data.orderId));
    return { success: true };
  });

export const getReferenceDesigns = createServerFn({ method: "GET" }).handler(async () => {
  const customer = await requireCustomer();
  if (customer.role !== "shop-owner") throw new Error("Shop owner access required.");
  const db = await requireDb();
  return db
    .select()
    .from(referenceDesigns)
    .where(eq(referenceDesigns.ownerId, customer.id))
    .orderBy(desc(referenceDesigns.createdAt));
});

export const saveReferenceDesign = createServerFn({ method: "POST" })
  .validator((data: ReferenceDesignInput) => data)
  .handler(async ({ data }) => {
    const customer = await requireCustomer();
    if (customer.role !== "shop-owner") throw new Error("Shop owner access required.");
    const db = await requireDb();
    const row = {
      id: `REF-${cryptoRandomId()}`,
      ownerId: customer.id,
      name: data.name.trim(),
      svg: data.svg,
    };
    await db.insert(referenceDesigns).values(row);
    return { id: row.id, name: row.name, svg: row.svg };
  });

export const updateCustomerTheme = createServerFn({ method: "POST" })
  .validator((data: { theme: "light" | "dark" }) => data)
  .handler(async ({ data }) => {
    const customer = await requireCustomer();
    const db = await requireDb();
    await db
      .update(customers)
      .set({ theme: data.theme, updatedAt: new Date() })
      .where(eq(customers.id, customer.id));
    return { success: true };
  });
