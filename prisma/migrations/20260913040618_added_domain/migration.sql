/*
  Warnings:

  - Added the required column `domain` to the `Organization` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `Organization` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Organization" ADD COLUMN "domain" TEXT;

UPDATE "Organization" SET "domain" = 'default.example.com' WHERE "domain" IS NULL;

ALTER TABLE "Organization" ALTER COLUMN "domain" SET NOT NULL,

ALTER COLUMN "email" SET NOT NULL;
