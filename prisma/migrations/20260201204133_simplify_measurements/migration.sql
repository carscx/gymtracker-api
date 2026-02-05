/*
  Warnings:

  - You are about to drop the column `fat` on the `Measurement` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `Measurement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Measurement" DROP COLUMN "fat",
DROP COLUMN "note",
ADD COLUMN     "photoUrl" TEXT;
