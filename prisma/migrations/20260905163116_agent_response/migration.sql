/*
  Warnings:

  - Added the required column `criteria` to the `PriorAuthReview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `executionTrace` to the `PriorAuthReview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gatheredEvidence` to the `PriorAuthReview` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `patientId` on the `PriorAuthReview` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "isProceed" BOOLEAN;

-- AlterTable
ALTER TABLE "PriorAuthReview" ADD COLUMN     "criteria" JSONB NOT NULL,
ADD COLUMN     "executionTrace" JSONB NOT NULL,
ADD COLUMN     "gatheredEvidence" JSONB NOT NULL,
DROP COLUMN "patientId",
ADD COLUMN     "patientId" INTEGER NOT NULL,
ALTER COLUMN "finalDecision" DROP NOT NULL,
ALTER COLUMN "overridesJson" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "PriorAuthReview_patientId_idx" ON "PriorAuthReview"("patientId");

-- CreateIndex
CREATE INDEX "PriorAuthReview_agentStatus_idx" ON "PriorAuthReview"("agentStatus");

-- CreateIndex
CREATE INDEX "PriorAuthReview_agentRecommendation_idx" ON "PriorAuthReview"("agentRecommendation");

-- AddForeignKey
ALTER TABLE "PriorAuthReview" ADD CONSTRAINT "PriorAuthReview_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
