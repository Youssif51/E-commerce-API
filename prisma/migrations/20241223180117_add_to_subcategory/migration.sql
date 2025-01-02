/*
  Warnings:

  - Added the required column `whoCreated` to the `Subcategory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subcategory" ADD COLUMN     "whoCreated" TEXT NOT NULL;
