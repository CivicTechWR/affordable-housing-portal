ALTER TABLE "listings"
DROP COLUMN "neighborhood",
DROP COLUMN "region";

ALTER TABLE "listing_snapshot"
DROP COLUMN "neighborhood",
DROP COLUMN "region";

DROP TYPE "property_region_enum";
