-- DropForeignKey
ALTER TABLE "_JurisdictionsToUserAccounts" DROP CONSTRAINT "_JurisdictionsToUserAccounts_A_fkey";

-- DropForeignKey
ALTER TABLE "_JurisdictionsToUserAccounts" DROP CONSTRAINT "_JurisdictionsToUserAccounts_B_fkey";

-- DropTable
DROP TABLE "_JurisdictionsToUserAccounts";
