CREATE TABLE "cart_items" (
	"id" text PRIMARY KEY NOT NULL,
	"cart_id" text NOT NULL,
	"product_id" text NOT NULL,
	"product_name" text NOT NULL,
	"color" text NOT NULL,
	"color_name" text NOT NULL,
	"size" text NOT NULL,
	"target_group" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" integer NOT NULL,
	"front_preview" text,
	"back_preview" text,
	"summary" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"role" text NOT NULL,
	"name" text,
	"email" text,
	"phone" text,
	"password_hash" text,
	"theme" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"product_id" text NOT NULL,
	"product_name" text NOT NULL,
	"shirt_color" text NOT NULL,
	"shirt_color_name" text NOT NULL,
	"custom_text" text NOT NULL,
	"custom_text_color" text NOT NULL,
	"custom_text_font" text NOT NULL,
	"custom_text_size" integer NOT NULL,
	"custom_image" text,
	"total_price" integer NOT NULL,
	"quantity" integer NOT NULL,
	"size" text NOT NULL,
	"target_group" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"customer_name" text NOT NULL,
	"shipping_name" text NOT NULL,
	"shipping_address" text NOT NULL,
	"shipping_phone" text NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text NOT NULL,
	"total_price" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"price" integer NOT NULL,
	"colors" jsonb NOT NULL,
	"sizes" jsonb NOT NULL,
	"image" text NOT NULL,
	"blurb" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reference_designs" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"svg" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"customer_id" text,
	"author" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_designs" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"product_id" text NOT NULL,
	"product_name" text NOT NULL,
	"shirt_color" text NOT NULL,
	"shirt_color_name" text NOT NULL,
	"custom_text" text NOT NULL,
	"custom_text_color" text NOT NULL,
	"custom_text_font" text NOT NULL,
	"custom_text_size" integer NOT NULL,
	"custom_image" text,
	"price" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlist_products" (
	"customer_id" text NOT NULL,
	"product_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wishlist_products_customer_id_product_id_pk" PRIMARY KEY("customer_id","product_id")
);
--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reference_designs" ADD CONSTRAINT "reference_designs_owner_id_customers_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_designs" ADD CONSTRAINT "saved_designs_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_products" ADD CONSTRAINT "wishlist_products_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "carts_customer_unique" ON "carts" USING btree ("customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_username_role_unique" ON "customers" USING btree ("username","role");