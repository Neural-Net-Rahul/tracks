-- AlterTable
ALTER TABLE "Track" ALTER COLUMN "chaptersCount" SET DEFAULT 0,
ALTER COLUMN "name" SET DEFAULT 'My Track',
ALTER COLUMN "tags" SET DEFAULT ARRAY['track']::TEXT[];
