-- CreateTable
CREATE TABLE "PriorAuthReview" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "agentRecommendation" TEXT NOT NULL,
    "agentStatus" TEXT NOT NULL,
    "finalDecision" TEXT NOT NULL,
    "reviewerNote" TEXT,
    "agentResultJson" JSONB NOT NULL,
    "overridesJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewerId" INTEGER,

    CONSTRAINT "PriorAuthReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PriorAuthReview_patientId_idx" ON "PriorAuthReview"("patientId");

-- CreateIndex
CREATE INDEX "PriorAuthReview_createdAt_idx" ON "PriorAuthReview"("createdAt");

-- AddForeignKey
ALTER TABLE "PriorAuthReview" ADD CONSTRAINT "PriorAuthReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
