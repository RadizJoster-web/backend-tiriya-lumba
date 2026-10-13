/*
  Warnings:

  - A unique constraint covering the columns `[name,areaId]` on the table `Location` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `studentprofile` DROP FOREIGN KEY `StudentProfile_userId_fkey`;

-- CreateTable
CREATE TABLE `InstructorProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `shortBio` TEXT NULL,
    `license` VARCHAR(191) NULL,
    `experience` VARCHAR(191) NULL,

    UNIQUE INDEX `InstructorProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_InstructorLocations` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_InstructorLocations_AB_unique`(`A`, `B`),
    INDEX `_InstructorLocations_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Location_name_areaId_key` ON `Location`(`name`, `areaId`);

-- AddForeignKey
ALTER TABLE `StudentProfile` ADD CONSTRAINT `StudentProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstructorProfile` ADD CONSTRAINT `InstructorProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_InstructorLocations` ADD CONSTRAINT `_InstructorLocations_A_fkey` FOREIGN KEY (`A`) REFERENCES `InstructorProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_InstructorLocations` ADD CONSTRAINT `_InstructorLocations_B_fkey` FOREIGN KEY (`B`) REFERENCES `Location`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
