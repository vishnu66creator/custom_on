ALTER TABLE "cart_items" ADD COLUMN "design_state" jsonb;--> statement-breakpoint
ALTER TABLE "saved_designs" ADD COLUMN "design_state" jsonb;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "design_state" jsonb;
