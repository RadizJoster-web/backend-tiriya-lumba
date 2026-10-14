/*
  Warnings:

  - Added the required column `fullName` to the `StudentProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `studentprofile` ADD COLUMN `fullName` VARCHAR(191) NOT NULL;
