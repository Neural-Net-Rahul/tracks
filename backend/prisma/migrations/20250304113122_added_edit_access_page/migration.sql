-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "image" TEXT;

-- CreateTable
CREATE TABLE "RequestEditAccess" (
    "trackId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "message" TEXT,

    CONSTRAINT "RequestEditAccess_pkey" PRIMARY KEY ("trackId","userId")
);

-- AddForeignKey
ALTER TABLE "RequestEditAccess" ADD CONSTRAINT "RequestEditAccess_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestEditAccess" ADD CONSTRAINT "RequestEditAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
