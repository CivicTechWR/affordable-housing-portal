-- Single-Jurisdiction Simplification
-- Convert user-jurisdiction and feature-flag-jurisdiction from many-to-many to single FK

-- 1. UserAccounts: add jurisdiction_id FK
ALTER TABLE "user_accounts" ADD COLUMN "jurisdiction_id" UUID;

-- Populate from the implicit many-to-many junction table (take first jurisdiction per user)
UPDATE "user_accounts" ua
SET "jurisdiction_id" = sub."A"
FROM (
  SELECT DISTINCT ON ("B") "A", "B"
  FROM "_JurisdictionsToUserAccounts"
) sub
WHERE ua.id = sub."B";

-- Add FK constraint
ALTER TABLE "user_accounts"
  ADD CONSTRAINT "user_accounts_jurisdiction_id_fkey"
  FOREIGN KEY ("jurisdiction_id") REFERENCES "jurisdictions"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 2. FeatureFlags: add jurisdiction_id FK
ALTER TABLE "feature_flags" ADD COLUMN "jurisdiction_id" UUID;

-- Populate from the implicit many-to-many junction table (take first jurisdiction per flag)
UPDATE "feature_flags" ff
SET "jurisdiction_id" = sub."A"
FROM (
  SELECT DISTINCT ON ("B") "A", "B"
  FROM "_FeatureFlagsToJurisdictions"
) sub
WHERE ff.id = sub."B";

-- Add FK constraint
ALTER TABLE "feature_flags"
  ADD CONSTRAINT "feature_flags_jurisdiction_id_fkey"
  FOREIGN KEY ("jurisdiction_id") REFERENCES "jurisdictions"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- 3. Drop the old many-to-many junction tables
DROP TABLE "_JurisdictionsToUserAccounts";
DROP TABLE "_FeatureFlagsToJurisdictions";
