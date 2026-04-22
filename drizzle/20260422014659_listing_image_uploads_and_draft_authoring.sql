ALTER TABLE "listing_images" ALTER COLUMN "listing_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "listing_images" ALTER COLUMN "image_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "listing_images" ALTER COLUMN "sort_order" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "listing_images" ADD COLUMN "upload_session_id" uuid;--> statement-breakpoint
ALTER TABLE "listing_images" ADD COLUMN "uploaded_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "listing_images" ADD COLUMN "image_data" "bytea";--> statement-breakpoint
ALTER TABLE "listing_images" ADD COLUMN "content_type" text;--> statement-breakpoint
ALTER TABLE "listing_images" ADD COLUMN "size_bytes" integer;--> statement-breakpoint
ALTER TABLE "listing_images" ADD COLUMN "width" integer;--> statement-breakpoint
ALTER TABLE "listing_images" ADD COLUMN "height" integer;--> statement-breakpoint
ALTER TABLE "listing_images" ADD COLUMN "original_filename" text;--> statement-breakpoint
UPDATE "listing_images" AS "li"
SET "uploaded_by_user_id" = "l"."created_by_user_id"
FROM "listings" AS "l"
WHERE "li"."listing_id" = "l"."id";--> statement-breakpoint
ALTER TABLE "listing_images" ALTER COLUMN "uploaded_by_user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "listing_images" ADD CONSTRAINT "listing_images_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "listing_images_upload_session_id_idx" ON "listing_images" USING btree ("upload_session_id");--> statement-breakpoint
CREATE INDEX "listing_images_uploaded_by_user_id_idx" ON "listing_images" USING btree ("uploaded_by_user_id");
