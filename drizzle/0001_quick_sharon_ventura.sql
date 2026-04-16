ALTER TABLE "listings" ADD COLUMN "custom_fields" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "listing_field_values" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "listing_field_values" CASCADE;--> statement-breakpoint
CREATE INDEX "listings_custom_fields_gin_idx" ON "listings" USING gin ("custom_fields");
