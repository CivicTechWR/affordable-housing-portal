-- Remove jurisdiction FK from user_accounts
ALTER TABLE "user_accounts" DROP CONSTRAINT IF EXISTS "user_accounts_jurisdiction_id_fkey";
ALTER TABLE "user_accounts" DROP COLUMN IF EXISTS "jurisdiction_id";

-- Remove jurisdiction FK from feature_flags
ALTER TABLE "feature_flags" DROP CONSTRAINT IF EXISTS "feature_flags_jurisdiction_id_fkey";
ALTER TABLE "feature_flags" DROP COLUMN IF EXISTS "jurisdiction_id";
