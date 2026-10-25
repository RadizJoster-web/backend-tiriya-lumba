/*
  Warnings:

  - Added the required column `birthDate` to the `InstructorProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `instructorprofile` ADD COLUMN `birthDate` DATETIME(3) NOT NULL,
    MODIFY `license` TEXT NULL;
