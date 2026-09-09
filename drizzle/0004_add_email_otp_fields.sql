ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "email_verified" boolean DEFAULT false NOT NULL;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "email_verification_otp_hash" text;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "email_verification_otp_expires_at" timestamp with time zone;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "email_verification_attempts" integer DEFAULT 0 NOT NULL;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "email_verification_last_sent_at" timestamp with time zone;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "email_verification_verified_at" timestamp with time zone;
