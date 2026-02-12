ALTER TABLE "listings"
  DROP COLUMN IF EXISTS "application_fee",
  DROP COLUMN IF EXISTS "costs_not_included",
  DROP COLUMN IF EXISTS "credit_screening_fee",
  DROP COLUMN IF EXISTS "utilities_id";

ALTER TABLE "listing_snapshot"
  DROP COLUMN IF EXISTS "application_fee",
  DROP COLUMN IF EXISTS "costs_not_included",
  DROP COLUMN IF EXISTS "credit_screening_fee",
  DROP COLUMN IF EXISTS "utility_snapshot_id";

DROP TABLE IF EXISTS "listing_utilities";
DROP TABLE IF EXISTS "listing_utility_snapshot";
