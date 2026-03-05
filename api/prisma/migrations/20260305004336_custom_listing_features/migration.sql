-- CreateEnum
CREATE TYPE "custom_listing_scope" AS ENUM ('PROPERTY', 'UNIT');

-- AlterTable
ALTER TABLE "listing_snapshot" ALTER COLUMN "afs_last_run_at" SET DEFAULT '1970-01-01 00:00:00-07'::timestamp with time zone,
ALTER COLUMN "last_application_update_at" SET DEFAULT '1970-01-01 00:00:00-07'::timestamp with time zone,
ALTER COLUMN "requested_changes_date" SET DEFAULT '1970-01-01 00:00:00-07'::timestamp with time zone;

-- AlterTable
ALTER TABLE "listings" ALTER COLUMN "afs_last_run_at" SET DEFAULT '1970-01-01 00:00:00-07'::timestamp with time zone,
ALTER COLUMN "last_application_update_at" SET DEFAULT '1970-01-01 00:00:00-07'::timestamp with time zone,
ALTER COLUMN "requested_changes_date" SET DEFAULT '1970-01-01 00:00:00-07'::timestamp with time zone;

-- CreateTable
CREATE TABLE "custom_listing_fields" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "displayName" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "scope" "custom_listing_scope" NOT NULL,

    CONSTRAINT "custom_listing_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_listing_features_listings" (
    "custom_listing_feature_id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,

    CONSTRAINT "custom_listing_features_listings_pkey" PRIMARY KEY ("custom_listing_feature_id","listing_id")
);

-- CreateTable
CREATE TABLE "custom_listing_features_units" (
    "custom_listing_feature_id" UUID NOT NULL,
    "unit_id" UUID NOT NULL,

    CONSTRAINT "custom_listing_features_units_pkey" PRIMARY KEY ("custom_listing_feature_id","unit_id")
);

-- CreateIndex
CREATE INDEX "custom_listing_features_listings_listing_id_idx" ON "custom_listing_features_listings"("listing_id");

-- CreateIndex
CREATE INDEX "custom_listing_features_units_unit_id_idx" ON "custom_listing_features_units"("unit_id");

-- AddForeignKey
ALTER TABLE "custom_listing_features_listings" ADD CONSTRAINT "custom_listing_features_listings_custom_listing_feature_id_fkey" FOREIGN KEY ("custom_listing_feature_id") REFERENCES "custom_listing_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_listing_features_listings" ADD CONSTRAINT "custom_listing_features_listings_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_listing_features_units" ADD CONSTRAINT "custom_listing_features_units_custom_listing_feature_id_fkey" FOREIGN KEY ("custom_listing_feature_id") REFERENCES "custom_listing_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_listing_features_units" ADD CONSTRAINT "custom_listing_features_units_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
