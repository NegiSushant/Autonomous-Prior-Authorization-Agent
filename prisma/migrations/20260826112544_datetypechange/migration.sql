/*
  Warnings:

  - Changed the type of `reportDate` on the `ImagingReport` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `recordDate` on the `MedicationRecord` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ImagingReport" 
ALTER COLUMN "reportDate" TYPE TIMESTAMP(3)
  USING "reportDate"::timestamp;

-- AlterTable
ALTER TABLE "MedicationRecord"
  ALTER COLUMN "recordDate" TYPE TIMESTAMP(3)
  USING "recordDate"::timestamp;
