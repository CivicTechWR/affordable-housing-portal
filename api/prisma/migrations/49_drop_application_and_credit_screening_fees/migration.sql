-- AlterTable
ALTER TABLE "listings"
  DROP COLUMN IF EXISTS "application_fee",
  DROP COLUMN IF EXISTS "credit_screening_fee";

-- AlterTable
ALTER TABLE "listing_snapshot"
  DROP COLUMN IF EXISTS "application_fee",
  DROP COLUMN IF EXISTS "credit_screening_fee";
