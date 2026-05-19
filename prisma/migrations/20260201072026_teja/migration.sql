/*
  Warnings:

  - Added the required column `job_role` to the `Announcement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "application_link" TEXT,
ADD COLUMN     "job_role" TEXT NOT NULL;
