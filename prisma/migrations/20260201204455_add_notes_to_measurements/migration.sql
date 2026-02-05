/*
  Warnings:

  - You are about to drop the column `notes` on the `Measurement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Measurement" DROP COLUMN "notes",
ADD COLUMN     "note" TEXT;
