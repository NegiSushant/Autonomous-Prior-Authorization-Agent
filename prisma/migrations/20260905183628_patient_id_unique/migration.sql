/*
  Warnings:

  - A unique constraint covering the columns `[patientId]` on the table `PriorAuthReview` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Patient" ALTER COLUMN "isProceed" SET DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "PriorAuthReview_patientId_key" ON "PriorAuthReview"("patientId");
