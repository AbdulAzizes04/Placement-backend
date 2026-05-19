/*
  Warnings:

  - A unique constraint covering the columns `[student_id,batch_id]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `college_id` to the `Announcement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Announcement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `college_id` to the `StudentProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "college_id" UUID NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PlacementRecord" ADD COLUMN     "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "placed_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "college_id" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "Announcement_company_name_idx" ON "Announcement"("company_name");

-- CreateIndex
CREATE INDEX "Announcement_created_by_idx" ON "Announcement"("created_by");

-- CreateIndex
CREATE INDEX "Announcement_college_id_idx" ON "Announcement"("college_id");

-- CreateIndex
CREATE INDEX "Announcement_required_cgpa_idx" ON "Announcement"("required_cgpa");

-- CreateIndex
CREATE INDEX "Announcement_is_deleted_idx" ON "Announcement"("is_deleted");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Application_is_deleted_idx" ON "Application"("is_deleted");

-- CreateIndex
CREATE INDEX "Attendance_student_id_idx" ON "Attendance"("student_id");

-- CreateIndex
CREATE INDEX "Attendance_batch_id_idx" ON "Attendance"("batch_id");

-- CreateIndex
CREATE INDEX "Attendance_is_deleted_idx" ON "Attendance"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_student_id_batch_id_key" ON "Attendance"("student_id", "batch_id");

-- CreateIndex
CREATE INDEX "CRTBatch_is_deleted_idx" ON "CRTBatch"("is_deleted");

-- CreateIndex
CREATE INDEX "College_is_deleted_idx" ON "College"("is_deleted");

-- CreateIndex
CREATE INDEX "PlacementRecord_student_id_idx" ON "PlacementRecord"("student_id");

-- CreateIndex
CREATE INDEX "PlacementRecord_company_name_idx" ON "PlacementRecord"("company_name");

-- CreateIndex
CREATE INDEX "PlacementRecord_placed_at_idx" ON "PlacementRecord"("placed_at");

-- CreateIndex
CREATE INDEX "PlacementRecord_is_deleted_idx" ON "PlacementRecord"("is_deleted");

-- CreateIndex
CREATE INDEX "StudentProfile_college_id_idx" ON "StudentProfile"("college_id");

-- CreateIndex
CREATE INDEX "StudentProfile_is_deleted_idx" ON "StudentProfile"("is_deleted");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_college_id_idx" ON "User"("college_id");

-- CreateIndex
CREATE INDEX "User_is_deleted_idx" ON "User"("is_deleted");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
