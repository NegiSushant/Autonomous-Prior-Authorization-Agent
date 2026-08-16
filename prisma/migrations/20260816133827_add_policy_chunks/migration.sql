-- CreateTable
CREATE TABLE "policy_chunks" (
    "id" BIGSERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "insurance" TEXT,
    "procedure" TEXT,
    "cpt_codes" TEXT,
    "source_file" TEXT,
    "metadata" JSONB,
    "embedding" vector,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "policy_chunks_insurance_idx" ON "policy_chunks"("insurance");

-- CreateIndex
CREATE INDEX "policy_chunks_procedure_idx" ON "policy_chunks"("procedure");
