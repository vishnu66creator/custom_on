CREATE UNIQUE INDEX IF NOT EXISTS "customers_email_unique" ON "customers" USING btree ("email");
