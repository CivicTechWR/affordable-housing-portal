-- Update any existing rows that reference removed languages to English
UPDATE "applications" SET "language" = 'en' WHERE "language" NOT IN ('en');
UPDATE "application_snapshot" SET "language" = 'en' WHERE "language" NOT IN ('en');
UPDATE "paper_applications" SET "language" = 'en' WHERE "language" NOT IN ('en');
UPDATE "paper_application_snapshot" SET "language" = 'en' WHERE "language" NOT IN ('en');
UPDATE "user_accounts" SET "language" = 'en' WHERE "language" IS NOT NULL AND "language" NOT IN ('en');
UPDATE "translations" SET "language" = 'en' WHERE "language" NOT IN ('en');

-- Remove duplicate translations that may result from the language update
-- (keep the one with the most recent updated_at)
DELETE FROM "translations" t1
USING "translations" t2
WHERE t1.id < t2.id
  AND t1."jurisdiction_id" IS NOT DISTINCT FROM t2."jurisdiction_id"
  AND t1."language" = t2."language";

-- Update jurisdiction languages arrays to only contain 'en'
UPDATE "jurisdictions" SET "languages" = ARRAY['en']::languages_enum[];

-- Create the new enum with only en and fr
CREATE TYPE "languages_enum_new" AS ENUM ('en', 'fr');

-- Alter columns to use the new enum
ALTER TABLE "applications" ALTER COLUMN "language" TYPE "languages_enum_new" USING ("language"::text::"languages_enum_new");
ALTER TABLE "application_snapshot" ALTER COLUMN "language" TYPE "languages_enum_new" USING ("language"::text::"languages_enum_new");
ALTER TABLE "paper_applications" ALTER COLUMN "language" TYPE "languages_enum_new" USING ("language"::text::"languages_enum_new");
ALTER TABLE "paper_application_snapshot" ALTER COLUMN "language" TYPE "languages_enum_new" USING ("language"::text::"languages_enum_new");
ALTER TABLE "translations" ALTER COLUMN "language" TYPE "languages_enum_new" USING ("language"::text::"languages_enum_new");
ALTER TABLE "user_accounts" ALTER COLUMN "language" TYPE "languages_enum_new" USING ("language"::text::"languages_enum_new");
ALTER TABLE "jurisdictions" ALTER COLUMN "languages" TYPE "languages_enum_new"[] USING ("languages"::text[]::"languages_enum_new"[]);

-- Drop old enum and rename new one
DROP TYPE "languages_enum";
ALTER TYPE "languages_enum_new" RENAME TO "languages_enum";
