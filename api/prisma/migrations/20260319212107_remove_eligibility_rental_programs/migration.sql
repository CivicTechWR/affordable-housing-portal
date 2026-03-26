-- Remove additional eligibility, rental assistance, and related fields

-- Listings table
ALTER TABLE "listings" DROP COLUMN IF EXISTS "credit_history";
ALTER TABLE "listings" DROP COLUMN IF EXISTS "criminal_background";
ALTER TABLE "listings" DROP COLUMN IF EXISTS "rental_assistance";
ALTER TABLE "listings" DROP COLUMN IF EXISTS "rental_history";

-- Listing snapshot table
ALTER TABLE "listing_snapshot" DROP COLUMN IF EXISTS "credit_history";
ALTER TABLE "listing_snapshot" DROP COLUMN IF EXISTS "criminal_background";
ALTER TABLE "listing_snapshot" DROP COLUMN IF EXISTS "rental_assistance";
ALTER TABLE "listing_snapshot" DROP COLUMN IF EXISTS "rental_history";

-- Jurisdictions table
ALTER TABLE "jurisdictions" DROP COLUMN IF EXISTS "rental_assistance_default";
