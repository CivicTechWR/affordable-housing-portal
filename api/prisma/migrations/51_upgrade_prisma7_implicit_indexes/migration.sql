-- Prisma 7 upgrade: convert implicit many-to-many join tables from unique indexes
-- to composite primary keys, as required by Prisma 7's new schema conventions.
-- Note: The unique indexes were managed implicitly by Prisma 6 and may not exist
-- on a fresh shadow database, so we use DROP INDEX IF EXISTS for safety.

-- AlterTable: _ApplicationFlaggedSetToApplications
ALTER TABLE "_ApplicationFlaggedSetToApplications" ADD CONSTRAINT "_ApplicationFlaggedSetToApplications_AB_pkey" PRIMARY KEY ("A", "B");
DROP INDEX IF EXISTS "_ApplicationFlaggedSetToApplications_AB_unique";

-- AlterTable: _ApplicationSnapshotToUnitTypes
ALTER TABLE "_ApplicationSnapshotToUnitTypes" ADD CONSTRAINT "_ApplicationSnapshotToUnitTypes_AB_pkey" PRIMARY KEY ("A", "B");
DROP INDEX IF EXISTS "_ApplicationSnapshotToUnitTypes_AB_unique";

-- AlterTable: _ApplicationsToUnitTypes
ALTER TABLE "_ApplicationsToUnitTypes" ADD CONSTRAINT "_ApplicationsToUnitTypes_AB_pkey" PRIMARY KEY ("A", "B");
DROP INDEX IF EXISTS "_ApplicationsToUnitTypes_AB_unique";

-- AlterTable: _FeatureFlagsToJurisdictions
ALTER TABLE "_FeatureFlagsToJurisdictions" ADD CONSTRAINT "_FeatureFlagsToJurisdictions_AB_pkey" PRIMARY KEY ("A", "B");
DROP INDEX IF EXISTS "_FeatureFlagsToJurisdictions_AB_unique";

-- AlterTable: _JurisdictionsToUserAccountSnapshot
ALTER TABLE "_JurisdictionsToUserAccountSnapshot" ADD CONSTRAINT "_JurisdictionsToUserAccountSnapshot_AB_pkey" PRIMARY KEY ("A", "B");
DROP INDEX IF EXISTS "_JurisdictionsToUserAccountSnapshot_AB_unique";

-- AlterTable: _JurisdictionsToUserAccounts
ALTER TABLE "_JurisdictionsToUserAccounts" ADD CONSTRAINT "_JurisdictionsToUserAccounts_AB_pkey" PRIMARY KEY ("A", "B");
DROP INDEX IF EXISTS "_JurisdictionsToUserAccounts_AB_unique";

-- AlterTable: _ListingSnapshotToUserAccountSnapshot
ALTER TABLE "_ListingSnapshotToUserAccountSnapshot" ADD CONSTRAINT "_ListingSnapshotToUserAccountSnapshot_AB_pkey" PRIMARY KEY ("A", "B");
DROP INDEX IF EXISTS "_ListingSnapshotToUserAccountSnapshot_AB_unique";

-- AlterTable: _ListingsToUserAccounts
ALTER TABLE "_ListingsToUserAccounts" ADD CONSTRAINT "_ListingsToUserAccounts_AB_pkey" PRIMARY KEY ("A", "B");
DROP INDEX IF EXISTS "_ListingsToUserAccounts_AB_unique";

-- AlterTable: _ListingsToUserPreferences
ALTER TABLE "_ListingsToUserPreferences" ADD CONSTRAINT "_ListingsToUserPreferences_AB_pkey" PRIMARY KEY ("A", "B");
DROP INDEX IF EXISTS "_ListingsToUserPreferences_AB_unique";

-- AlterTable: _UnitGroupSnapshotToUnitTypes
ALTER TABLE "_UnitGroupSnapshotToUnitTypes" ADD CONSTRAINT "_UnitGroupSnapshotToUnitTypes_AB_pkey" PRIMARY KEY ("A", "B");
DROP INDEX IF EXISTS "_UnitGroupSnapshotToUnitTypes_AB_unique";

-- AlterTable: _UnitGroupToUnitTypes
ALTER TABLE "_UnitGroupToUnitTypes" ADD CONSTRAINT "_UnitGroupToUnitTypes_AB_pkey" PRIMARY KEY ("A", "B");
DROP INDEX IF EXISTS "_UnitGroupToUnitTypes_AB_unique";

-- AlterTable: _favorite_listings
ALTER TABLE "_favorite_listings" ADD CONSTRAINT "_favorite_listings_AB_pkey" PRIMARY KEY ("A", "B");
DROP INDEX IF EXISTS "_favorite_listings_AB_unique";

-- AlterTable: listing_snapshot (timestamp defaults)
ALTER TABLE "listing_snapshot"
  ALTER COLUMN "afs_last_run_at" SET DEFAULT '1970-01-01 00:00:00-07'::timestamp with time zone,
  ALTER COLUMN "last_application_update_at" SET DEFAULT '1970-01-01 00:00:00-07'::timestamp with time zone,
  ALTER COLUMN "requested_changes_date" SET DEFAULT '1970-01-01 00:00:00-07'::timestamp with time zone;

-- AlterTable: listings (timestamp defaults)
ALTER TABLE "listings"
  ALTER COLUMN "afs_last_run_at" SET DEFAULT '1970-01-01 00:00:00-07'::timestamp with time zone,
  ALTER COLUMN "last_application_update_at" SET DEFAULT '1970-01-01 00:00:00-07'::timestamp with time zone,
  ALTER COLUMN "requested_changes_date" SET DEFAULT '1970-01-01 00:00:00-07'::timestamp with time zone;
