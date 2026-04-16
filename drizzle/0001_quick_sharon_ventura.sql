ALTER TABLE "listings" ADD COLUMN "custom_fields" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
UPDATE "listings" AS l
SET "custom_fields" = aggregated_values."custom_fields"
FROM (
  SELECT
    "listing_field_values"."listing_id",
    jsonb_object_agg("listing_field_definitions"."key", "listing_field_values"."value") AS "custom_fields"
  FROM "listing_field_values"
  INNER JOIN "listing_field_definitions"
    ON "listing_field_definitions"."id" = "listing_field_values"."field_definition_id"
  GROUP BY "listing_field_values"."listing_id"
) AS "aggregated_values"
WHERE l."id" = aggregated_values."listing_id";--> statement-breakpoint
ALTER TABLE "listing_field_values" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "listing_field_values" CASCADE;--> statement-breakpoint
CREATE INDEX "listings_custom_fields_gin_idx" ON "listings" USING gin ("custom_fields");
