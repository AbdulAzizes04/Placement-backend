/*
  Warnings:

  - You are about to drop the column `target_branch` on the `Announcement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Announcement" DROP COLUMN "target_branch",
ADD COLUMN     "package" TEXT DEFAULT 'N/A';
