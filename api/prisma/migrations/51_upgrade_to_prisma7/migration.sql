-- AlterTable
ALTER TABLE "_ApplicationFlaggedSetToApplications" ADD CONSTRAINT "_ApplicationFlaggedSetToApplications_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ApplicationFlaggedSetToApplications_AB_unique";

-- AlterTable
ALTER TABLE "_ApplicationSnapshotToUnitTypes" ADD CONSTRAINT "_ApplicationSnapshotToUnitTypes_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ApplicationSnapshotToUnitTypes_AB_unique";

-- AlterTable
ALTER TABLE "_ApplicationsToUnitTypes" ADD CONSTRAINT "_ApplicationsToUnitTypes_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ApplicationsToUnitTypes_AB_unique";

-- AlterTable
ALTER TABLE "_FeatureFlagsToJurisdictions" ADD CONSTRAINT "_FeatureFlagsToJurisdictions_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_FeatureFlagsToJurisdictions_AB_unique";

-- AlterTable
ALTER TABLE "_JurisdictionsToUserAccountSnapshot" ADD CONSTRAINT "_JurisdictionsToUserAccountSnapshot_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_JurisdictionsToUserAccountSnapshot_AB_unique";

-- AlterTable
ALTER TABLE "_JurisdictionsToUserAccounts" ADD CONSTRAINT "_JurisdictionsToUserAccounts_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_JurisdictionsToUserAccounts_AB_unique";

-- AlterTable
ALTER TABLE "_ListingSnapshotToUserAccountSnapshot" ADD CONSTRAINT "_ListingSnapshotToUserAccountSnapshot_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ListingSnapshotToUserAccountSnapshot_AB_unique";

-- AlterTable
ALTER TABLE "_ListingsToUserAccounts" ADD CONSTRAINT "_ListingsToUserAccounts_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ListingsToUserAccounts_AB_unique";

-- AlterTable
ALTER TABLE "_ListingsToUserPreferences" ADD CONSTRAINT "_ListingsToUserPreferences_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ListingsToUserPreferences_AB_unique";

-- AlterTable
ALTER TABLE "_UnitGroupSnapshotToUnitTypes" ADD CONSTRAINT "_UnitGroupSnapshotToUnitTypes_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_UnitGroupSnapshotToUnitTypes_AB_unique";

-- AlterTable
ALTER TABLE "_UnitGroupToUnitTypes" ADD CONSTRAINT "_UnitGroupToUnitTypes_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_UnitGroupToUnitTypes_AB_unique";

-- AlterTable
ALTER TABLE "_favorite_listings" ADD CONSTRAINT "_favorite_listings_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_favorite_listings_AB_unique";

-- AlterTable
ALTER TABLE "listing_snapshot" ALTER COLUMN "afs_last_run_at" SET DEFAULT '1970-01-01 00:00:00-07'::timestamp with time zone,
ALTER COLUMN "last_application_update_at" SET DEFAULT '1970-01-01 00:00:00-07'::timestamp with time zone,
ALTER COLUMN "requested_changes_date" SET DEFAULT '1970-01-01 00:00:00-07'::timestamp with time zone;

-- AlterTable
ALTER TABLE "listings" ALTER COLUMN "afs_last_run_at" SET DEFAULT '1970-01-01 00:00:00-07'::timestamp with time zone,
ALTER COLUMN "last_application_update_at" SET DEFAULT '1970-01-01 00:00:00-07'::timestamp with time zone,
ALTER COLUMN "requested_changes_date" SET DEFAULT '1970-01-01 00:00:00-07'::timestamp with time zone;
