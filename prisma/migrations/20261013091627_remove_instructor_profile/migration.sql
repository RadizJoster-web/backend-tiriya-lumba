/*
  Warnings:

  - You are about to drop the column `fullName` on the `studentprofile` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `studentprofile` table. All the data in the column will be lost.
  - You are about to drop the `instructorprofile` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `fullName` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `instructorprofile` DROP FOREIGN KEY `InstructorProfile_userId_fkey`;

-- AlterTable
ALTER TABLE `studentprofile` DROP COLUMN `fullName`,
    DROP COLUMN `phone`;

-- AlterTable
ALTER TABLE `user` MODIFY `fullName` VARCHAR(191) NOT NULL,
    MODIFY `phone` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `instructorprofile`;
