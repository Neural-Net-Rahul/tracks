/*
  Warnings:

  - You are about to drop the column `pageNumber` on the `Page` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Page` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Page" DROP COLUMN "pageNumber",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
