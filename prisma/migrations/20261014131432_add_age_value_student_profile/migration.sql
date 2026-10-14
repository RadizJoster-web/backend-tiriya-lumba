/*
  Warnings:

  - Added the required column `age` to the `StudentProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `studentprofile` ADD COLUMN `age` VARCHAR(191) NOT NULL;
