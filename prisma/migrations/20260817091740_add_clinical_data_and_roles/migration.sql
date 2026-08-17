-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'REVIEWER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'REVIEWER';

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "insurancePayer" TEXT NOT NULL,
    "procedureCode" TEXT NOT NULL,
    "procedureName" TEXT NOT NULL,
    "diagnosisCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalNote" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "noteDate" TEXT NOT NULL,
    "bodyText" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'EHR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClinicalNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicationRecord" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "drugName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "recordDate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImagingReport" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "bodyPart" TEXT NOT NULL,
    "findings" TEXT NOT NULL,
    "reportDate" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'Imaging',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImagingReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClinicalNote_patientId_idx" ON "ClinicalNote"("patientId");

-- CreateIndex
CREATE INDEX "ClinicalNote_documentId_idx" ON "ClinicalNote"("documentId");

-- CreateIndex
CREATE INDEX "MedicationRecord_patientId_idx" ON "MedicationRecord"("patientId");

-- CreateIndex
CREATE INDEX "MedicationRecord_category_idx" ON "MedicationRecord"("category");

-- CreateIndex
CREATE INDEX "ImagingReport_patientId_idx" ON "ImagingReport"("patientId");

-- CreateIndex
CREATE INDEX "ImagingReport_bodyPart_idx" ON "ImagingReport"("bodyPart");

-- AddForeignKey
ALTER TABLE "ClinicalNote" ADD CONSTRAINT "ClinicalNote_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationRecord" ADD CONSTRAINT "MedicationRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImagingReport" ADD CONSTRAINT "ImagingReport_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
