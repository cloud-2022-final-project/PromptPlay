/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `totalScore` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to drop the `Player` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Room` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX `User_discordId_key` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    MODIFY `totalScore` DOUBLE NOT NULL,
    MODIFY `updateTime` DATETIME(3) NOT NULL,
    ADD PRIMARY KEY (`discordId`);

-- DropTable
DROP TABLE `Player`;

-- DropTable
DROP TABLE `Room`;

-- CreateTable
CREATE TABLE `DailyPlayer` (
    `discordId` VARCHAR(191) NOT NULL,
    `prompt` VARCHAR(191) NOT NULL,
    `score` DOUBLE NOT NULL,
    `dailyImageId` VARCHAR(191) NOT NULL,
    `dailyImageUrl` VARCHAR(191) NOT NULL,

    INDEX `DailyPlayer_dailyImageUrl_score_idx`(`dailyImageUrl`, `score`),
    PRIMARY KEY (`discordId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DailyImage` (
    `url` VARCHAR(191) NOT NULL,
    `round` INTEGER NOT NULL DEFAULT 1,
    `prompt` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`url`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ImageStore` (
    `url` VARCHAR(191) NOT NULL,
    `prompt` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`url`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `User_totalScore_idx` ON `User`(`totalScore`);
