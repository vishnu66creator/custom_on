import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import { and, desc, eq } from "drizzle-orm";
import type { CartItem } from "../cart-store";
import type { Order, OrderStatus } from "../orders-store";
import {
  customers,
  otpVerifications,
  emailVerifications,
  passwordResetTokens,
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
  provider?: string;
  avatar?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
};
type DbCustomer = typeof customers.$inferSelect;

type AuthInput = {
  username?: string;
  email?: string;
  role: CustomerRole;
  password?: string;
};
type RegisterInput = {
  email?: string;
  username?: string;
  name: string;
  phone?: string;
  role?: CustomerRole;
  password?: string;
};
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
    await dbInstance.execute(sql`ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "email" text;`);
    await dbInstance.execute(sql`ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "phone" text;`);
    await dbInstance.execute(sql`ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "email_verified" boolean DEFAULT false NOT NULL;`);
    await dbInstance.execute(sql`ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "email_verification_otp_hash" text;`);
    await dbInstance.execute(sql`ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "email_verification_otp_expires_at" timestamp with time zone;`);
    await dbInstance.execute(sql`ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "email_verification_attempts" integer DEFAULT 0 NOT NULL;`);
    await dbInstance.execute(sql`ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "email_verification_last_sent_at" timestamp with time zone;`);
    await dbInstance.execute(sql`ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "email_verification_verified_at" timestamp with time zone;`);
    await dbInstance.execute(sql`ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "phone_verified" boolean DEFAULT false NOT NULL;`);
    await dbInstance.execute(sql`ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "provider" text DEFAULT 'email' NOT NULL;`);
    await dbInstance.execute(sql`ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "provider_account_id" text;`);
    await dbInstance.execute(sql`ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "avatar" text;`);
    await dbInstance.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "customers_email_unique" ON "customers" ("email");`);
    await dbInstance.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "customers_phone_role_unique" ON "customers" ("phone", "role");`);
    await dbInstance.execute(sql`
      CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
        "id" text PRIMARY KEY NOT NULL,
        "email" text NOT NULL,
        "otp_hash" text NOT NULL,
        "reset_token_hash" text,
        "expires_at" timestamp with time zone NOT NULL,
        "attempts" integer DEFAULT 0 NOT NULL,
        "resend_available_at" timestamp with time zone,
        "verified_at" timestamp with time zone,
        "used_at" timestamp with time zone,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);
    await dbInstance.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_tokens_email_idx" ON "password_reset_tokens" ("email");`);
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
    ...(row.provider ? { provider: row.provider } : {}),
    ...(row.avatar ? { avatar: row.avatar } : {}),
    emailVerified: row.emailVerified,
    phoneVerified: row.phoneVerified,
  };
}

function normalizeEmail(value?: string | null): string {
  if (!value) return "";
  return value.trim().toLowerCase();
}

function normalizePhone(value?: string | null): string {
  if (!value) return "";
  const compact = value.trim().replace(/[\s\-().]/g, "");
  if (compact.startsWith("+91")) return compact.slice(3);
  if (compact.startsWith("0091")) return compact.slice(4);
  if (compact.length === 11 && compact.startsWith("0")) return compact.slice(1);
  return compact;
}

function formatE164Phone(phone: string): string {
  const norm = normalizePhone(phone);
  return `+91${norm}`;
}

const PHONE_REGEX = /^[6-9]\d{9}$/;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamailblock.com",
  "sharklasers.com",
  "grr.la",
  "tempmail.com",
  "temp-mail.org",
  "10minutemail.com",
  "throwawaymail.com",
  "yopmail.com",
  "dispostable.com",
  "getairmail.com",
  "trashmail.com",
  "tempm.com",
  "mohmal.com",
  "generator.email",
  "inboxkitten.com",
  "burnermail.io",
]);

function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? DISPOSABLE_EMAIL_DOMAINS.has(domain) : false;
}

async function hashPassword(password: string): Promise<string> {
  const crypto = await import("node:crypto");
  const salt = crypto.randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt$${salt}$${derivedKey.toString("hex")}`);
    });
  });
}

async function verifyPassword(password: string, storedHash?: string | null): Promise<boolean> {
  if (!storedHash) return false;
  const crypto = await import("node:crypto");

  if (storedHash.startsWith("scrypt$")) {
    const parts = storedHash.split("$");
    const salt = parts[1];
    const hash = parts[2];
    if (!salt || !hash) return false;
    return new Promise((resolve) => {
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) return resolve(false);
        try {
          const keyBuffer = Buffer.from(hash, "hex");
          resolve(crypto.timingSafeEqual(keyBuffer, derivedKey));
        } catch {
          resolve(false);
        }
      });
    });
  }

  // Backward compatibility with legacy SHA-256 password hashes
  const legacySha256 = crypto.createHash("sha256").update(password).digest("hex");
  return storedHash === legacySha256;
}

// Alias for existing usages
async function passwordHash(password: string): Promise<string> {
  return hashPassword(password);
}

async function hashOtp(otp: string, identifier: string): Promise<string> {
  const crypto = await import("node:crypto");
  return crypto.createHash("sha256").update(`${otp.trim()}:${identifier.trim().toLowerCase()}`).digest("hex");
}

async function hashToken(token: string): Promise<string> {
  const crypto = await import("node:crypto");
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function generateOtp(): Promise<string> {
  const crypto = await import("node:crypto");
  return crypto.randomInt(100000, 1000000).toString();
}

async function sessionCustomer() {
  const sessionId = getCookie(SESSION_COOKIE);
  if (!sessionId) return null;
  try {
    const { db, hasDatabase } = await import("./db");
    if (!hasDatabase || !db) return null;
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
  } catch (err) {
    console.error("sessionCustomer error:", err);
    return null;
  }
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

export const loginWithGoogle = createServerFn({ method: "POST" })
  .validator((data: { credential?: string; accessToken?: string; code?: string; redirectUri?: string }) => data)
  .handler(async ({ data }) => {
    try {
      const db = await requireDb();
      if (!data.credential && !data.accessToken && !data.code) {
        return {
          success: false as const,
          error: "Google sign-in was cancelled or could not be completed.",
        };
      }

      let googleUser: {
        sub: string;
        email: string;
        name: string;
        picture?: string;
        email_verified: boolean;
      };

      const expectedClientId =
        process.env["GOOGLE_CLIENT_ID"] || process.env["VITE_GOOGLE_CLIENT_ID"] || "";

      if (data.credential) {
        // Verify Google ID Token with Google tokeninfo endpoint
        const tokenRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(data.credential)}`,
        );
        if (!tokenRes.ok) {
          console.error("Google token verification failed:", await tokenRes.text());
          return {
            success: false as const,
            error: "Google authentication failed. Please try again.",
          };
        }
        const payload = (await tokenRes.json()) as any;
        if (!payload.sub || !payload.email) {
          return {
            success: false as const,
            error: "Google sign-in did not return valid account details.",
          };
        }

        // Validate issuer
        if (
          payload.iss &&
          payload.iss !== "https://accounts.google.com" &&
          payload.iss !== "accounts.google.com"
        ) {
          return {
            success: false as const,
            error: "Google authentication issuer is invalid.",
          };
        }

        // Validate audience if client ID is configured
        if (expectedClientId && payload.aud && payload.aud !== expectedClientId) {
          console.warn(
            `Google token aud (${payload.aud}) does not match configured client ID (${expectedClientId})`,
          );
        }

        const isVerified =
          payload.email_verified === "true" || payload.email_verified === true;
        if (!isVerified) {
          return {
            success: false as const,
            error: "Your Google account email could not be verified by Google.",
          };
        }

        googleUser = {
          sub: payload.sub,
          email: normalizeEmail(payload.email),
          name: payload.name || payload.given_name || "Google User",
          picture: payload.picture,
          email_verified: true,
        };
      } else if (data.accessToken) {
        // Verify via Google userinfo endpoint
        const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${data.accessToken}` },
        });
        if (!userinfoRes.ok) {
          console.error("Google userinfo failed:", await userinfoRes.text());
          return {
            success: false as const,
            error: "Google authentication failed. Please try again.",
          };
        }
        const payload = (await userinfoRes.json()) as any;
        if (!payload.sub || !payload.email) {
          return {
            success: false as const,
            error: "Google sign-in did not return valid account details.",
          };
        }

        const isVerified =
          payload.email_verified === "true" || payload.email_verified === true;
        if (!isVerified) {
          return {
            success: false as const,
            error: "Your Google account email could not be verified by Google.",
          };
        }

        googleUser = {
          sub: payload.sub,
          email: normalizeEmail(payload.email),
          name: payload.name || payload.given_name || "Google User",
          picture: payload.picture,
          email_verified: true,
        };
      } else {
        return {
          success: false as const,
          error: "Google authentication failed. Please try again.",
        };
      }

      const { sql } = await import("drizzle-orm");

      // Search for existing customer account
      const existing = (
        await db
          .select()
          .from(customers)
          .where(
            and(
              eq(customers.role, "customer"),
              sql`(${customers.providerAccountId} = ${googleUser.sub} OR lower(${customers.email}) = ${googleUser.email})`,
            ),
          )
          .limit(1)
      )[0];

      let customerRecord: DbCustomer;
      if (existing) {
        await db
          .update(customers)
          .set({
            name: existing.name || googleUser.name,
            provider: "google",
            providerAccountId: googleUser.sub,
            avatar: googleUser.picture || existing.avatar,
            emailVerified: true,
            updatedAt: new Date(),
          })
          .where(eq(customers.id, existing.id));

        customerRecord = (
          await db.select().from(customers).where(eq(customers.id, existing.id)).limit(1)
        )[0]!;
      } else {
        const crypto = await import("node:crypto");
        const id = `cust-${crypto.randomUUID()}`;
        const newCust = {
          id,
          username: googleUser.email,
          role: "customer" as const,
          name: googleUser.name,
          email: googleUser.email,
          provider: "google",
          providerAccountId: googleUser.sub,
          avatar: googleUser.picture || null,
          emailVerified: true,
        };
        await db.insert(customers).values(newCust);
        customerRecord = (
          await db.select().from(customers).where(eq(customers.id, id)).limit(1)
        )[0]!;
      }

      await createSession(customerRecord.id);
      return { success: true as const, user: toCustomerView(customerRecord) };
    } catch (error) {
      console.error("Error in loginWithGoogle:", error);
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("The database is not configured")) {
        return { success: false as const, error: msg };
      }
      return {
        success: false as const,
        error: "Google sign-in was cancelled or could not be completed.",
      };
    }
  });

export const registerCustomerWithEmail = createServerFn({ method: "POST" })
  .validator(
    (data: {
      name: string;
      email: string;
      phone?: string;
      password: string;
      confirmPassword?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    try {
      const db = await requireDb();
      const rawName = data.name?.trim();
      if (!rawName) {
        return { success: false as const, error: "Please enter your full name." };
      }

      const email = normalizeEmail(data.email);
      if (!email || !EMAIL_REGEX.test(email)) {
        return { success: false as const, error: "Please enter a valid email address." };
      }

      if (isDisposableEmail(email)) {
        return { success: false as const, error: "Please use a permanent, valid email address." };
      }

      const phone = normalizePhone(data.phone);
      if (data.phone && phone && !PHONE_REGEX.test(phone) && phone.length < 7) {
        return { success: false as const, error: "Please enter a valid phone number." };
      }

      const password = data.password ?? "";
      if (
        password.length < 6 ||
        !/[A-Za-z]/.test(password) ||
        !/[^A-Za-z0-9\s]/.test(password)
      ) {
        return {
          success: false as const,
          error:
            "Password must be at least 6 characters and include a letter and a special character.",
        };
      }

      if (data.confirmPassword !== undefined && data.confirmPassword !== password) {
        return {
          success: false as const,
          error: "Passwords do not match.",
        };
      }

      const { sql } = await import("drizzle-orm");

      // Check if email already exists
      const existing = (
        await db
          .select()
          .from(customers)
          .where(and(eq(customers.role, "customer"), sql`lower(${customers.email}) = ${email}`))
          .limit(1)
      )[0];

      if (existing && existing.emailVerified) {
        return {
          success: false as const,
          error: "An account with this email already exists. Please sign in instead.",
        };
      }

      // Generate 6-digit cryptographically secure OTP
      const otp = await generateOtp();
      const otpHashValue = await hashOtp(otp, email);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
      const pHash = await hashPassword(password);

      // Send verification email via Resend
      const { sendVerificationEmail } = await import("../email/send-verification-email");
      const emailResult = await sendVerificationEmail({
        to: email,
        name: rawName,
        otp,
      });

      if (!emailResult.success) {
        return {
          success: false as const,
          error: emailResult.error || "We couldn't send the verification email. Please try again.",
        };
      }

      const crypto = await import("node:crypto");
      const id = existing?.id || `cust-${crypto.randomUUID()}`;

      if (existing) {
        await db
          .update(customers)
          .set({
            name: rawName,
            phone: phone || existing.phone || null,
            passwordHash: pHash,
            emailVerificationOtpHash: otpHashValue,
            emailVerificationOtpExpiresAt: expiresAt,
            emailVerificationAttempts: 0,
            emailVerificationLastSentAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(customers.id, existing.id));
      } else {
        await db.insert(customers).values({
          id,
          username: email,
          role: "customer",
          name: rawName,
          email,
          phone: phone || null,
          passwordHash: pHash,
          provider: "email",
          emailVerified: false,
          emailVerificationOtpHash: otpHashValue,
          emailVerificationOtpExpiresAt: expiresAt,
          emailVerificationAttempts: 0,
          emailVerificationLastSentAt: new Date(),
        });
      }

      return {
        success: true as const,
        email,
        requireVerification: true as const,
      };
    } catch (error) {
      console.error("Database error in registerCustomerWithEmail:", error);
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("The database is not configured")) {
        return { success: false as const, error: msg };
      }
      return { success: false as const, error: "Unable to complete registration. Please try again." };
    }
  });

export const verifyEmailOtp = createServerFn({ method: "POST" })
  .validator((data: { email: string; otp: string }) => data)
  .handler(async ({ data }) => {
    try {
      const db = await requireDb();
      const email = normalizeEmail(data.email);
      const cleanOtp = data.otp?.trim();

      if (!email || !EMAIL_REGEX.test(email)) {
        return { success: false as const, error: "Please enter a valid email address." };
      }

      if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
        return { success: false as const, error: "Invalid verification code. Please try again." };
      }

      const { sql } = await import("drizzle-orm");
      const customer = (
        await db
          .select()
          .from(customers)
          .where(and(eq(customers.role, "customer"), sql`lower(${customers.email}) = ${email}`))
          .limit(1)
      )[0];

      if (!customer) {
        return { success: false as const, error: "No account found with this email. Please sign up." };
      }

      if (customer.emailVerified) {
        await createSession(customer.id);
        return {
          success: true as const,
          user: toCustomerView(customer),
        };
      }

      if (
        !customer.emailVerificationOtpExpiresAt ||
        customer.emailVerificationOtpExpiresAt.getTime() <= Date.now()
      ) {
        return {
          success: false as const,
          error: "This verification code has expired. Please request a new code.",
        };
      }

      if ((customer.emailVerificationAttempts ?? 0) >= 5) {
        return {
          success: false as const,
          error:
            "Too many incorrect attempts. Please request a new code.",
        };
      }

      const inputOtpHash = await hashOtp(cleanOtp, email);
      if (inputOtpHash !== customer.emailVerificationOtpHash) {
        const nextAttempts = (customer.emailVerificationAttempts ?? 0) + 1;
        await db
          .update(customers)
          .set({ emailVerificationAttempts: nextAttempts })
          .where(eq(customers.id, customer.id));

        if (nextAttempts >= 5) {
          return {
            success: false as const,
            error:
              "Too many incorrect attempts. Please request a new code.",
          };
        }
        return { success: false as const, error: "That verification code is incorrect. Please try again." };
      }

      // Mark verified and clear temporary OTP fields
      await db
        .update(customers)
        .set({
          emailVerified: true,
          emailVerificationVerifiedAt: new Date(),
          emailVerificationOtpHash: null,
          emailVerificationOtpExpiresAt: null,
          emailVerificationAttempts: 0,
          updatedAt: new Date(),
        })
        .where(eq(customers.id, customer.id));

      const updated = (
        await db.select().from(customers).where(eq(customers.id, customer.id)).limit(1)
      )[0]!;

      await createSession(updated.id);
      return { success: true as const, user: toCustomerView(updated) };
    } catch (error) {
      console.error("Database error in verifyEmailOtp:", error);
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("The database is not configured")) {
        return { success: false as const, error: msg };
      }
      return { success: false as const, error: "Unable to complete verification. Please try again." };
    }
  });

export const resendEmailOtp = createServerFn({ method: "POST" })
  .validator((data: { email: string }) => data)
  .handler(async ({ data }) => {
    try {
      const db = await requireDb();
      const email = normalizeEmail(data.email);

      if (!email || !EMAIL_REGEX.test(email)) {
        return { success: false as const, error: "Please enter a valid email address." };
      }

      const { sql } = await import("drizzle-orm");
      const customer = (
        await db
          .select()
          .from(customers)
          .where(and(eq(customers.role, "customer"), sql`lower(${customers.email}) = ${email}`))
          .limit(1)
      )[0];

      if (!customer) {
        return { success: false as const, error: "No account found with this email. Please sign up." };
      }

      if (customer.emailVerified) {
        return { success: false as const, error: "This email is already verified. Please sign in." };
      }

      // Check 60-second cooldown
      if (customer.emailVerificationLastSentAt) {
        const elapsedSeconds = Math.floor(
          (Date.now() - customer.emailVerificationLastSentAt.getTime()) / 1000,
        );
        if (elapsedSeconds < 60) {
          const remaining = 60 - elapsedSeconds;
          return {
            success: false as const,
            error: `Please wait ${remaining}s before requesting another code.`,
            resendInSeconds: remaining,
          };
        }
      }

      const newOtp = await generateOtp();
      const newOtpHash = await hashOtp(newOtp, email);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      const { sendVerificationEmail } = await import("../email/send-verification-email");
      const emailResult = await sendVerificationEmail({
        to: email,
        name: customer.name || "Customer",
        otp: newOtp,
      });

      if (!emailResult.success) {
        return {
          success: false as const,
          error: emailResult.error || "We couldn't send the verification email. Please try again.",
        };
      }

      await db
        .update(customers)
        .set({
          emailVerificationOtpHash: newOtpHash,
          emailVerificationOtpExpiresAt: expiresAt,
          emailVerificationAttempts: 0,
          emailVerificationLastSentAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(customers.id, customer.id));

      return { success: true as const, resendInSeconds: 60 };
    } catch (error) {
      console.error("Database error in resendEmailOtp:", error);
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("The database is not configured")) {
        return { success: false as const, error: msg };
      }
      return { success: false as const, error: "Unable to resend verification email. Please try again." };
    }
  });

export const loginCustomerWithEmail = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    try {
      const db = await requireDb();
      const email = normalizeEmail(data.email);
      if (!email || !EMAIL_REGEX.test(email)) {
        return { success: false as const, error: "Please enter a valid email address." };
      }

      const password = data.password ?? "";
      if (!password) {
        return { success: false as const, error: "Please enter your password." };
      }

      const { sql } = await import("drizzle-orm");
      const row = (
        await db
          .select()
          .from(customers)
          .where(and(eq(customers.role, "customer"), sql`lower(${customers.email}) = ${email}`))
          .limit(1)
      )[0];

      if (!row) {
        return {
          success: false as const,
          error: "We couldn't find an account with that email address.",
        };
      }

      const isPasswordCorrect = await verifyPassword(password, row.passwordHash);
      if (!isPasswordCorrect) {
        return { success: false as const, error: "Incorrect password. Please try again." };
      }

      if (!row.emailVerified) {
        return {
          success: false as const,
          error: "Please verify your email before signing in.",
          requireVerification: true as const,
          unverifiedEmail: email,
        };
      }

      await createSession(row.id);
      return { success: true as const, user: toCustomerView(row) };
    } catch (error) {
      console.error("Database error in loginCustomerWithEmail:", error);
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("The database is not configured")) {
        return { success: false as const, error: msg };
      }
      return { success: false as const, error: "Unable to connect to the account service." };
    }
  });

// ==========================================
// PASSWORD RESET ENDPOINTS
// ==========================================

export const requestPasswordResetOtp = createServerFn({ method: "POST" })
  .validator((data: { email: string }) => data)
  .handler(async ({ data }) => {
    try {
      const db = await requireDb();
      const email = normalizeEmail(data.email);
      if (!email || !EMAIL_REGEX.test(email)) {
        return { success: false as const, error: "Please enter a valid email address." };
      }

      const { sql } = await import("drizzle-orm");
      const customer = (
        await db
          .select()
          .from(customers)
          .where(and(eq(customers.role, "customer"), sql`lower(${customers.email}) = ${email}`))
          .limit(1)
      )[0];

      // Check existing reset token record for cooldown
      const existingToken = (
        await db
          .select()
          .from(passwordResetTokens)
          .where(sql`lower(${passwordResetTokens.email}) = ${email}`)
          .limit(1)
      )[0];

      if (existingToken?.resendAvailableAt && existingToken.resendAvailableAt.getTime() > Date.now()) {
        const remaining = Math.ceil(
          (existingToken.resendAvailableAt.getTime() - Date.now()) / 1000,
        );
        return {
          success: true as const,
          message: "If an account exists for this email, we've sent a verification code.",
          resendInSeconds: remaining,
        };
      }

      if (customer) {
        const otp = await generateOtp();
        const otpHash = await hashOtp(otp, email);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        const resendAvailableAt = new Date(Date.now() + 60 * 1000); // 60s cooldown

        const { sendPasswordResetEmail } = await import("../email/send-verification-email");
        const emailResult = await sendPasswordResetEmail({
          to: email,
          name: customer.name || "Customer",
          otp,
        });

        if (!emailResult.success) {
          console.error(`[Auth] Failed to send password reset email to: ${email}`, emailResult.error);
          return {
            success: false as const,
            error:
              emailResult.error ||
              "We couldn't send the password reset email right now. Please check your configuration and try again.",
          };
        }

        const crypto = await import("node:crypto");
        const id = existingToken?.id || `prt-${crypto.randomUUID()}`;

        if (existingToken) {
          await db
            .update(passwordResetTokens)
            .set({
              otpHash,
              resetTokenHash: null,
              expiresAt,
              attempts: 0,
              resendAvailableAt,
              verifiedAt: null,
              usedAt: null,
              createdAt: new Date(),
            })
            .where(eq(passwordResetTokens.id, existingToken.id));
        } else {
          await db.insert(passwordResetTokens).values({
            id,
            email,
            otpHash,
            expiresAt,
            attempts: 0,
            resendAvailableAt,
          });
        }

        console.log(`[Auth] Password reset OTP generated and stored for customer (ID: ${id})`);
      } else {
        console.log(`[Auth] Password reset requested for non-existent account: ${email}`);
      }

      // Return neutral success message to prevent account enumeration
      return {
        success: true as const,
        message: "If an account exists for this email, we've sent a verification code.",
        resendInSeconds: 60,
      };
    } catch (error) {
      console.error("Database error in requestPasswordResetOtp:", error);
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("The database is not configured")) {
        return { success: false as const, error: msg };
      }
      return {
        success: true as const,
        message: "If an account exists for this email, we've sent a verification code.",
      };
    }
  });

export const verifyPasswordResetOtp = createServerFn({ method: "POST" })
  .validator((data: { email: string; otp: string }) => data)
  .handler(async ({ data }) => {
    try {
      const db = await requireDb();
      const email = normalizeEmail(data.email);
      const cleanOtp = data.otp?.trim();

      if (!email || !EMAIL_REGEX.test(email)) {
        return { success: false as const, error: "Please enter a valid email address." };
      }

      if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
        return { success: false as const, error: "Invalid verification code. Please try again." };
      }

      const { sql } = await import("drizzle-orm");
      const record = (
        await db
          .select()
          .from(passwordResetTokens)
          .where(sql`lower(${passwordResetTokens.email}) = ${email}`)
          .limit(1)
      )[0];

      if (!record) {
        return { success: false as const, error: "That verification code is incorrect. Please try again." };
      }

      if (record.usedAt) {
        return {
          success: false as const,
          error: "This password reset session has expired. Please start again.",
        };
      }

      if (Date.now() > record.expiresAt.getTime()) {
        return {
          success: false as const,
          error: "This verification code has expired. Please request a new code.",
        };
      }

      if ((record.attempts ?? 0) >= 5) {
        return {
          success: false as const,
          error: "Too many incorrect attempts. Please request a new code.",
        };
      }

      const inputHash = await hashOtp(cleanOtp, email);
      if (inputHash !== record.otpHash) {
        const nextAttempts = (record.attempts ?? 0) + 1;
        await db
          .update(passwordResetTokens)
          .set({ attempts: nextAttempts })
          .where(eq(passwordResetTokens.id, record.id));

        if (nextAttempts >= 5) {
          return {
            success: false as const,
            error: "Too many incorrect attempts. Please request a new code.",
          };
        }
        return { success: false as const, error: "That verification code is incorrect. Please try again." };
      }

      // Generate single-use secure reset token
      const crypto = await import("node:crypto");
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = await hashToken(resetToken);

      await db
        .update(passwordResetTokens)
        .set({
          resetTokenHash,
          verifiedAt: new Date(),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min reset window
          attempts: 0,
        })
        .where(eq(passwordResetTokens.id, record.id));

      return { success: true as const, resetToken };
    } catch (error) {
      console.error("Database error in verifyPasswordResetOtp:", error);
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("The database is not configured")) {
        return { success: false as const, error: msg };
      }
      return { success: false as const, error: "Unable to verify reset code. Please try again." };
    }
  });

export const resendPasswordResetOtp = createServerFn({ method: "POST" })
  .validator((data: { email: string }) => data)
  .handler(async ({ data }) => {
    try {
      const db = await requireDb();
      const email = normalizeEmail(data.email);

      if (!email || !EMAIL_REGEX.test(email)) {
        return { success: false as const, error: "Please enter a valid email address." };
      }

      const { sql } = await import("drizzle-orm");
      const customer = (
        await db
          .select()
          .from(customers)
          .where(and(eq(customers.role, "customer"), sql`lower(${customers.email}) = ${email}`))
          .limit(1)
      )[0];

      const existingToken = (
        await db
          .select()
          .from(passwordResetTokens)
          .where(sql`lower(${passwordResetTokens.email}) = ${email}`)
          .limit(1)
      )[0];

      if (existingToken?.resendAvailableAt && existingToken.resendAvailableAt.getTime() > Date.now()) {
        const remaining = Math.ceil(
          (existingToken.resendAvailableAt.getTime() - Date.now()) / 1000,
        );
        return {
          success: false as const,
          error: `Please wait ${remaining}s before requesting another code.`,
          resendInSeconds: remaining,
        };
      }

      if (customer) {
        const newOtp = await generateOtp();
        const newOtpHash = await hashOtp(newOtp, email);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        const resendAvailableAt = new Date(Date.now() + 60 * 1000);

        const { sendPasswordResetEmail } = await import("../email/send-verification-email");
        const emailResult = await sendPasswordResetEmail({
          to: email,
          name: customer.name || "Customer",
          otp: newOtp,
        });

        if (!emailResult.success) {
          console.error(`[Auth] Failed to resend password reset email to: ${email}`, emailResult.error);
          return {
            success: false as const,
            error:
              emailResult.error ||
              "We couldn't resend the verification email right now. Please check your configuration and try again.",
          };
        }

        const crypto = await import("node:crypto");
        const id = existingToken?.id || `prt-${crypto.randomUUID()}`;

        if (existingToken) {
          await db
            .update(passwordResetTokens)
            .set({
              otpHash: newOtpHash,
              resetTokenHash: null,
              expiresAt,
              attempts: 0,
              resendAvailableAt,
              verifiedAt: null,
              usedAt: null,
              createdAt: new Date(),
            })
            .where(eq(passwordResetTokens.id, existingToken.id));
        } else {
          await db.insert(passwordResetTokens).values({
            id,
            email,
            otpHash: newOtpHash,
            expiresAt,
            attempts: 0,
            resendAvailableAt,
          });
        }

        console.log(`[Auth] Password reset OTP resent and stored for customer (ID: ${id})`);
      }

      return { success: true as const, resendInSeconds: 60 };
    } catch (error) {
      console.error("Database error in resendPasswordResetOtp:", error);
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("The database is not configured")) {
        return { success: false as const, error: msg };
      }
      return { success: false as const, error: "Unable to resend reset code. Please try again." };
    }
  });

export const resetPasswordWithToken = createServerFn({ method: "POST" })
  .validator(
    (data: {
      email: string;
      resetToken: string;
      newPassword: string;
      confirmPassword?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    try {
      const db = await requireDb();
      const email = normalizeEmail(data.email);
      const token = data.resetToken?.trim();

      if (!email || !EMAIL_REGEX.test(email)) {
        return { success: false as const, error: "Please enter a valid email address." };
      }

      if (!token) {
        return {
          success: false as const,
          error: "Your password reset session has expired. Please start again.",
        };
      }

      const password = data.newPassword ?? "";
      if (
        password.length < 6 ||
        !/[A-Za-z]/.test(password) ||
        !/[^A-Za-z0-9\s]/.test(password)
      ) {
        return {
          success: false as const,
          error:
            "Password must be at least 6 characters and include a letter and a special character.",
        };
      }

      if (data.confirmPassword !== undefined && data.confirmPassword !== password) {
        return { success: false as const, error: "Passwords do not match." };
      }

      const { sql } = await import("drizzle-orm");
      const record = (
        await db
          .select()
          .from(passwordResetTokens)
          .where(sql`lower(${passwordResetTokens.email}) = ${email}`)
          .limit(1)
      )[0];

      if (
        !record ||
        !record.verifiedAt ||
        record.usedAt ||
        Date.now() > record.expiresAt.getTime() ||
        !record.resetTokenHash
      ) {
        return {
          success: false as const,
          error: "Your password reset session has expired. Please start again.",
        };
      }

      const inputTokenHash = await hashToken(token);
      if (inputTokenHash !== record.resetTokenHash) {
        return {
          success: false as const,
          error: "Your password reset session has expired. Please start again.",
        };
      }

      const customer = (
        await db
          .select()
          .from(customers)
          .where(and(eq(customers.role, "customer"), sql`lower(${customers.email}) = ${email}`))
          .limit(1)
      )[0];

      if (!customer) {
        return { success: false as const, error: "Account could not be found." };
      }

      const pHash = await hashPassword(password);

      // Update customer password
      await db
        .update(customers)
        .set({
          passwordHash: pHash,
          emailVerified: true, // Resetting via verified email proves email ownership
          updatedAt: new Date(),
        })
        .where(eq(customers.id, customer.id));

      // Mark reset token as used
      await db
        .update(passwordResetTokens)
        .set({
          usedAt: new Date(),
          resetTokenHash: null,
        })
        .where(eq(passwordResetTokens.id, record.id));

      // Invalidate existing sessions for security
      await db.delete(sessions).where(eq(sessions.customerId, customer.id));

      return {
        success: true as const,
        message: "Your password has been reset successfully.",
      };
    } catch (error) {
      console.error("Database error in resetPasswordWithToken:", error);
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("The database is not configured")) {
        return { success: false as const, error: msg };
      }
      return { success: false as const, error: "Unable to reset password. Please try again." };
    }
  });

// ==========================================
// ADMIN AUTHENTICATION ENDPOINTS
// ==========================================

export const loginAdminWithEmail = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    try {
      const email = normalizeEmail(data.email);
      if (!email || !EMAIL_REGEX.test(email)) {
        return { success: false as const, error: "Please enter a valid admin email address." };
      }

      const password = data.password ?? "";
      if (!password) {
        return { success: false as const, error: "Please enter your password." };
      }

      const { db, hasDatabase } = await import("./db");
      if (!hasDatabase || !db) {
        if ((email === "admin@customon.in" || email === "admin@custom-on.com" || email === "admin") && password.length >= 4) {
          const fallbackAdminUser: CustomerView = {
            id: "fallback-admin-1",
            username: "admin",
            name: "System Admin",
            email: email.includes("@") ? email : "admin@customon.in",
            role: "shop-owner",
            emailVerified: true,
          };
          return { success: true as const, user: fallbackAdminUser };
        }
        return {
          success: false as const,
          error: "Database is not connected. Sign in with admin@customon.in / password 'admin' for demo access or configure DATABASE_URL in .env.",
        };
      }

      const { sql, or } = await import("drizzle-orm");
      const row = (
        await db
          .select()
          .from(customers)
          .where(
            and(
              or(eq(customers.role, "admin"), eq(customers.role, "shop-owner")),
              sql`lower(${customers.email}) = ${email}`,
            ),
          )
          .limit(1)
      )[0];

      if (!row) {
        return {
          success: false as const,
          error: "Invalid email or password.",
        };
      }

      const isPasswordCorrect = await verifyPassword(password, row.passwordHash);
      if (!isPasswordCorrect) {
        return { success: false as const, error: "Invalid email or password." };
      }

      await createSession(row.id);
      return { success: true as const, user: toCustomerView(row) };
    } catch (error) {
      console.error("Database error in loginAdminWithEmail:", error);
      const msg = error instanceof Error ? error.message : "";
      if (msg.includes("The database is not configured")) {
        return { success: false as const, error: msg };
      }
      return { success: false as const, error: "Unable to connect to the authentication service." };
    }
  });

export const requestAdminPasswordResetOtp = createServerFn({ method: "POST" })
  .validator((data: { email: string }) => data)
  .handler(async ({ data }) => {
    try {
      const db = await requireDb();
      const email = normalizeEmail(data.email);
      if (!email || !EMAIL_REGEX.test(email)) {
        return { success: false as const, error: "Please enter a valid email address." };
      }

      const { sql, or } = await import("drizzle-orm");
      const adminUser = (
        await db
          .select()
          .from(customers)
          .where(
            and(
              or(eq(customers.role, "admin"), eq(customers.role, "shop-owner")),
              sql`lower(${customers.email}) = ${email}`,
            ),
          )
          .limit(1)
      )[0];

      const existingToken = (
        await db
          .select()
          .from(passwordResetTokens)
          .where(sql`lower(${passwordResetTokens.email}) = ${email}`)
          .limit(1)
      )[0];

      if (existingToken?.resendAvailableAt && existingToken.resendAvailableAt.getTime() > Date.now()) {
        const remaining = Math.ceil(
          (existingToken.resendAvailableAt.getTime() - Date.now()) / 1000,
        );
        return {
          success: true as const,
          message: "If an admin account exists for this email, we've sent a verification code.",
          resendInSeconds: remaining,
        };
      }

      if (adminUser) {
        const otp = await generateOtp();
        const otpHash = await hashOtp(otp, email);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        const resendAvailableAt = new Date(Date.now() + 60 * 1000); // 60s cooldown

        const { sendPasswordResetEmail } = await import("../email/send-verification-email");
        const emailResult = await sendPasswordResetEmail({
          to: email,
          name: adminUser.name || "Administrator",
          otp,
        });

        if (!emailResult.success) {
          console.error(`[Auth] Failed to send admin password reset email to: ${email}`, emailResult.error);
          return {
            success: false as const,
            error: emailResult.error || "Could not send the password reset email right now.",
          };
        }

        const crypto = await import("node:crypto");
        const id = existingToken?.id || `prt-${crypto.randomUUID()}`;

        if (existingToken) {
          await db
            .update(passwordResetTokens)
            .set({
              otpHash,
              resetTokenHash: null,
              expiresAt,
              attempts: 0,
              resendAvailableAt,
              verifiedAt: null,
              usedAt: null,
              createdAt: new Date(),
            })
            .where(eq(passwordResetTokens.id, existingToken.id));
        } else {
          await db.insert(passwordResetTokens).values({
            id,
            email,
            otpHash,
            expiresAt,
            attempts: 0,
            resendAvailableAt,
          });
        }
      }

      return {
        success: true as const,
        message: "If an admin account exists for this email, we've sent a verification code.",
        resendInSeconds: 60,
      };
    } catch (error) {
      console.error("Database error in requestAdminPasswordResetOtp:", error);
      return {
        success: true as const,
        message: "If an admin account exists for this email, we've sent a verification code.",
      };
    }
  });

export const verifyAdminPasswordResetOtp = createServerFn({ method: "POST" })
  .validator((data: { email: string; otp: string }) => data)
  .handler(async ({ data }) => {
    try {
      const db = await requireDb();
      const email = normalizeEmail(data.email);
      const cleanOtp = data.otp?.trim();

      if (!email || !EMAIL_REGEX.test(email)) {
        return { success: false as const, error: "Please enter a valid email address." };
      }

      if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
        return { success: false as const, error: "Invalid verification code. Please enter 6 numeric digits." };
      }

      const { sql, or } = await import("drizzle-orm");
      const adminUser = (
        await db
          .select()
          .from(customers)
          .where(
            and(
              or(eq(customers.role, "admin"), eq(customers.role, "shop-owner")),
              sql`lower(${customers.email}) = ${email}`,
            ),
          )
          .limit(1)
      )[0];

      if (!adminUser) {
        return { success: false as const, error: "Invalid or expired verification code." };
      }

      const record = (
        await db
          .select()
          .from(passwordResetTokens)
          .where(sql`lower(${passwordResetTokens.email}) = ${email}`)
          .limit(1)
      )[0];

      if (!record) {
        return { success: false as const, error: "Invalid or expired verification code." };
      }

      if (record.usedAt) {
        return {
          success: false as const,
          error: "This session has expired. Please request a new verification code.",
        };
      }

      if (Date.now() > record.expiresAt.getTime()) {
        return {
          success: false as const,
          error: "Verification code has expired. Please request a new code.",
        };
      }

      if ((record.attempts ?? 0) >= 5) {
        return {
          success: false as const,
          error: "Too many incorrect attempts. Please request a new verification code.",
        };
      }

      const inputHash = await hashOtp(cleanOtp, email);
      if (inputHash !== record.otpHash) {
        const nextAttempts = (record.attempts ?? 0) + 1;
        await db
          .update(passwordResetTokens)
          .set({ attempts: nextAttempts })
          .where(eq(passwordResetTokens.id, record.id));

        return { success: false as const, error: "Invalid verification code." };
      }

      const crypto = await import("node:crypto");
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = await hashToken(resetToken);

      await db
        .update(passwordResetTokens)
        .set({
          resetTokenHash,
          verifiedAt: new Date(),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min window
          attempts: 0,
        })
        .where(eq(passwordResetTokens.id, record.id));

      return { success: true as const, resetToken };
    } catch (error) {
      console.error("Database error in verifyAdminPasswordResetOtp:", error);
      return { success: false as const, error: "Unable to verify code. Please try again." };
    }
  });

export const resendAdminPasswordResetOtp = createServerFn({ method: "POST" })
  .validator((data: { email: string }) => data)
  .handler(async ({ data }) => {
    return requestAdminPasswordResetOtp({ data });
  });

export const resetAdminPasswordWithToken = createServerFn({ method: "POST" })
  .validator(
    (data: {
      email: string;
      resetToken: string;
      newPassword: string;
      confirmPassword?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    try {
      const db = await requireDb();
      const email = normalizeEmail(data.email);
      const token = data.resetToken?.trim();

      if (!email || !EMAIL_REGEX.test(email)) {
        return { success: false as const, error: "Please enter a valid email address." };
      }

      if (!token) {
        return {
          success: false as const,
          error: "Your password reset session has expired. Please start again.",
        };
      }

      const password = data.newPassword ?? "";
      if (password.length < 8) {
        return {
          success: false as const,
          error: "Admin password must be at least 8 characters long.",
        };
      }

      if (data.confirmPassword !== undefined && data.confirmPassword !== password) {
        return { success: false as const, error: "Passwords do not match." };
      }

      const { sql, or } = await import("drizzle-orm");
      const record = (
        await db
          .select()
          .from(passwordResetTokens)
          .where(sql`lower(${passwordResetTokens.email}) = ${email}`)
          .limit(1)
      )[0];

      if (
        !record ||
        !record.verifiedAt ||
        record.usedAt ||
        Date.now() > record.expiresAt.getTime() ||
        !record.resetTokenHash
      ) {
        return {
          success: false as const,
          error: "Your password reset session has expired. Please start again.",
        };
      }

      const inputTokenHash = await hashToken(token);
      if (inputTokenHash !== record.resetTokenHash) {
        return {
          success: false as const,
          error: "Your password reset session has expired. Please start again.",
        };
      }

      const adminUser = (
        await db
          .select()
          .from(customers)
          .where(
            and(
              or(eq(customers.role, "admin"), eq(customers.role, "shop-owner")),
              sql`lower(${customers.email}) = ${email}`,
            ),
          )
          .limit(1)
      )[0];

      if (!adminUser) {
        return { success: false as const, error: "Admin account could not be found." };
      }

      const pHash = await hashPassword(password);

      await db
        .update(customers)
        .set({
          passwordHash: pHash,
          emailVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(customers.id, adminUser.id));

      await db
        .update(passwordResetTokens)
        .set({
          usedAt: new Date(),
          resetTokenHash: null,
        })
        .where(eq(passwordResetTokens.id, record.id));

      await db.delete(sessions).where(eq(sessions.customerId, adminUser.id));

      return {
        success: true as const,
        message: "Admin password has been reset successfully. Please log in with your new password.",
      };
    } catch (error) {
      console.error("Database error in resetAdminPasswordWithToken:", error);
      return { success: false as const, error: "Unable to reset password. Please try again." };
    }
  });

export const loginCustomer = createServerFn({ method: "POST" })
  .validator((data: AuthInput) => data)
  .handler(async ({ data }) => {
    try {
      const db = await requireDb();
      const role = data.role === "shop-owner" ? "shop-owner" : "customer";

      if (role === "customer") {
        const emailInput = normalizeEmail(data.email || data.username);
        if (!emailInput || !EMAIL_REGEX.test(emailInput)) {
          return {
            success: false as const,
            error: "Please enter a valid email address.",
          };
        }

        const { sql } = await import("drizzle-orm");
        const rows = await db
          .select()
          .from(customers)
          .where(
            and(
              eq(customers.role, "customer"),
              sql`lower(${customers.email}) = ${emailInput}`
            )
          )
          .limit(1);

        const row = rows[0];
        if (!row) {
          return {
            success: false as const,
            error: "Invalid email or password.",
          };
        }

        const isPasswordCorrect = await verifyPassword(data.password ?? "", row.passwordHash);
        if (!isPasswordCorrect) {
          return { success: false as const, error: "Invalid email or password." };
        }

        await createSession(row.id);
        return { success: true as const, user: toCustomerView(row) };
      } else {
        // Shop Owner login
        const username = data.username?.trim().toLowerCase() || normalizeEmail(data.email);
        if (!username) {
          return { success: false as const, error: "Admin Username / ID is required." };
        }
        const row = (
          await db
            .select()
            .from(customers)
            .where(and(eq(customers.username, username), eq(customers.role, "shop-owner")))
            .limit(1)
        )[0];

        if (!row) {
          return { success: false as const, error: "No registered shop owner account was found." };
        }
        const isPasswordCorrect = await verifyPassword(data.password ?? "", row.passwordHash);
        if (!isPasswordCorrect) {
          return { success: false as const, error: "Incorrect password." };
        }

        await createSession(row.id);
        return { success: true as const, user: toCustomerView(row) };
      }
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
      const db = await requireDb();
      const role = data.role === "shop-owner" ? "shop-owner" : "customer";

      if (role === "customer") {
        const email = normalizeEmail(data.email || data.username);
        if (!email || !EMAIL_REGEX.test(email)) {
          return { success: false as const, error: "Please enter a valid email address." };
        }

        const name = data.name ? data.name.trim() : "";
        if (!name) {
          return { success: false as const, error: "Please enter your full name." };
        }

        if (!data.password || data.password.length < 4) {
          return { success: false as const, error: "Please enter a password (at least 4 characters)." };
        }

        const phone = normalizePhone(data.phone);

        // Check if email already exists
        const { sql } = await import("drizzle-orm");
        const existing = await db
          .select({ id: customers.id })
          .from(customers)
          .where(
            and(
              eq(customers.role, "customer"),
              sql`lower(${customers.email}) = ${email}`
            )
          )
          .limit(1);

        if (existing.length > 0) {
          return {
            success: false as const,
            error: "An account with this email already exists. Please log in.",
          };
        }

        const crypto = await import("node:crypto");
        const id = `cust-${crypto.randomUUID()}`;
        const pHash = await passwordHash(data.password);

        const row = {
          id,
          username: email,
          role: "customer" as const,
          name,
          email,
          phone: phone || null,
          passwordHash: pHash,
          emailVerified: true,
        };

        try {
          await db.insert(customers).values(row);
        } catch (insertErr: any) {
          const errMsg = String(insertErr?.message || insertErr);
          if (
            insertErr?.code === "23505" ||
            errMsg.includes("customers_email_unique") ||
            errMsg.includes("unique") ||
            errMsg.includes("already exists")
          ) {
            return {
              success: false as const,
              error: "An account with this email already exists. Please log in.",
            };
          }
          throw insertErr;
        }

        const inserted = (await db.select().from(customers).where(eq(customers.id, id)).limit(1))[0];
        if (!inserted) throw new Error("Registration could not be completed.");

        await createSession(id);
        return { success: true as const, user: toCustomerView(inserted) };
      } else {
        // Shop Owner registration (admin portal only)
        const username = data.username?.trim().toLowerCase() || normalizeEmail(data.email);
        if (!username) {
          return { success: false as const, error: "Username is required." };
        }
        const existing = await db
          .select({ id: customers.id })
          .from(customers)
          .where(and(eq(customers.username, username), eq(customers.role, "shop-owner")))
          .limit(1);
        if (existing.length > 0) {
          return { success: false as const, error: "This admin account is already registered." };
        }
        const crypto = await import("node:crypto");
        const id = `owner-${crypto.randomUUID()}`;
        const pHash = data.password ? await passwordHash(data.password) : null;
        const row = {
          id,
          username,
          role: "shop-owner" as const,
          name: data.name?.trim() || "System Admin",
          email: normalizeEmail(data.email) || null,
          phone: normalizePhone(data.phone) || null,
          passwordHash: pHash,
          emailVerified: true,
        };
        await db.insert(customers).values(row);
        const inserted = (await db.select().from(customers).where(eq(customers.id, id)).limit(1))[0];
        if (!inserted) throw new Error("Registration could not be completed.");
        await createSession(id);
        return { success: true as const, user: toCustomerView(inserted) };
      }
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
