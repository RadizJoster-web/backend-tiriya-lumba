-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 29, 2026 at 04:22 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_tirya_lumba`
--

-- --------------------------------------------------------

--
-- Table structure for table `area`
--

CREATE TABLE `area` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `area`
--

INSERT INTO `area` (`id`, `name`) VALUES
('b666a364-bd09-46e1-8c5b-534e239acbd1', 'Kab.Tangerang'),
('ab8ff645-1ff4-4c1e-8354-291f9d301502', 'Kota Tangerang'),
('5d6d2e68-722a-4fb9-9aa9-d7247cdf57dc', 'Tangerang Selatan');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` varchar(191) NOT NULL,
  `studentProfileId` varchar(191) DEFAULT NULL,
  `date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `status` varchar(191) NOT NULL,
  `instructorId` varchar(191) DEFAULT NULL,
  `locationName` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `role` varchar(191) NOT NULL DEFAULT 'Murid'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `studentProfileId`, `date`, `status`, `instructorId`, `locationName`, `name`, `role`) VALUES
('34431ce6-5367-4d55-bfa2-ee07b7270c1f', NULL, '2026-10-29 03:58:01.042', 'Hadir', NULL, 'Permata', 'Siswa Luar', 'Murid'),
('cc598646-bf0c-4e10-a705-58ab3d9bed71', '5f5bd2ff-29f4-45b4-a322-c818eee64f1b', '2026-10-29 03:51:45.623', 'Hadir', NULL, 'Permata', 'Murid Satu', 'Murid');

-- --------------------------------------------------------

--
-- Table structure for table `instructorprofile`
--

CREATE TABLE `instructorprofile` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `shortBio` text DEFAULT NULL,
  `license` text DEFAULT NULL,
  `experience` varchar(191) DEFAULT NULL,
  `birthDate` datetime(3) NOT NULL,
  `lastRescheduledAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `instructorprofile`
--

INSERT INTO `instructorprofile` (`id`, `userId`, `shortBio`, `license`, `experience`, `birthDate`, `lastRescheduledAt`) VALUES
('0bdb7a4a-5341-46c2-804c-bf7fd8a6454b', '52b8950b-22fd-4669-b267-26a0a4998005', 'Saya pernah mengajar anak magang & anak SMK. Saya berpengalaman dalam mengajar, komunikasi dana publik speaking saya juga bagus. Saya bisa berenang dan pernah memenangkan kejuaraan berenang tingkat SMK. ', 'PRSI Level 2', '3 tahun', '2006-08-09 00:00:00.000', '2026-10-26 08:58:49.099'),
('a6a2f4dd-5e7d-4287-a7bb-24d342900f72', '344d5f42-a134-47f4-a93f-ce12c3b00a7f', 'Pelatih bersertifikasi PRSI berpengalaman membina gaya dada dan bebas.', 'PRSI-INA-2024-8891', '5 Tahun melatih renang anak & dewasa', '1995-05-15 00:00:00.000', '2026-10-29 03:54:28.279');

-- --------------------------------------------------------

--
-- Table structure for table `location`
--

CREATE TABLE `location` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `category` varchar(191) NOT NULL,
  `mapUrl` varchar(191) DEFAULT NULL,
  `areaId` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `location`
--

INSERT INTO `location` (`id`, `name`, `category`, `mapUrl`, `areaId`) VALUES
('1f12ef21-9337-4df8-a5ee-9e64c215f721', 'Laverde Jelupang', 'Kerjasama', 'https://maps.app.goo.gl/kpTBKCzcyyHc4RLr7', '5d6d2e68-722a-4fb9-9aa9-d7247cdf57dc'),
('301f4eab-7ca2-4015-b450-45f252cca4d5', 'Duta Bintaro-Kunciran', 'Kerjasama', 'https://maps.app.goo.gl/kpTBKCzcyyHc4RLr7', 'ab8ff645-1ff4-4c1e-8354-291f9d301502'),
('8b1e2229-a930-4164-a070-40bcf7e9f520', 'B Residence BSD', 'Kerjasama', 'https://maps.app.goo.gl/kpTBKCzcyyHc4RLr7', 'b666a364-bd09-46e1-8c5b-534e239acbd1'),
('8c28f5ce-0dde-437a-baf4-3601fd5f595e', 'Permata', 'Kerjasama', 'https://maps.app.goo.gl/kpTBKCzcyyHc4RLr7', '5d6d2e68-722a-4fb9-9aa9-d7247cdf57dc'),
('94607167-92f7-48fe-be3d-4dc3778b4c52', 'Aeropolis-Bandara', 'Kerjasama', 'https://maps.app.goo.gl/kpTBKCzcyyHc4RLr7', 'ab8ff645-1ff4-4c1e-8354-291f9d301502'),
('97f4af0b-f375-48e2-a9d2-7752f7bee476', 'Serpong Park-Serpong', 'Kerjasama', 'https://maps.app.goo.gl/kpTBKCzcyyHc4RLr7', '5d6d2e68-722a-4fb9-9aa9-d7247cdf57dc'),
('e8bfcc8b-9f77-4b3a-a8e3-43e217713f58', 'Puri Beta-Larangan-Ciledug', 'Kerjasama', 'https://maps.app.goo.gl/kpTBKCzcyyHc4RLr7', 'ab8ff645-1ff4-4c1e-8354-291f9d301502');

-- --------------------------------------------------------

--
-- Table structure for table `package`
--

CREATE TABLE `package` (
  `id` varchar(191) NOT NULL,
  `locationId` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `price` double NOT NULL,
  `sessionCount` int(11) NOT NULL DEFAULT 4
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `package`
--

INSERT INTO `package` (`id`, `locationId`, `type`, `price`, `sessionCount`) VALUES
('5ad6c176-77e6-4275-8e42-5b55b2c6684d', '8c28f5ce-0dde-437a-baf4-3601fd5f595e', 'Privat', 600000, 4),
('d499dc60-bd3d-4d96-8cb9-e5bbb9349687', '8c28f5ce-0dde-437a-baf4-3601fd5f595e', 'Reguler', 350000, 4),
('d5824e76-baa2-411c-ba8b-9ac370b2af81', '8c28f5ce-0dde-437a-baf4-3601fd5f595e', 'Atlit', 800000, 4),
('dc412c5e-a5fd-4bd7-82b4-0d1a9bb58280', '8c28f5ce-0dde-437a-baf4-3601fd5f595e', 'Beasiswa', 150000, 4);

-- --------------------------------------------------------

--
-- Table structure for table `registration`
--

CREATE TABLE `registration` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `type` enum('NEW_STUDENT','NEW_INSTRUCTOR','RENEWAL') NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `rejectionReason` varchar(191) DEFAULT NULL,
  `packageId` varchar(191) DEFAULT NULL,
  `locationId` varchar(191) DEFAULT NULL,
  `instructorId` varchar(191) DEFAULT NULL,
  `firstMeetDate` datetime(3) DEFAULT NULL,
  `firstMeetSession` varchar(191) DEFAULT NULL,
  `paymentMethod` enum('QRIS','BANK_TRANSFER','CASH') DEFAULT NULL,
  `paymentProofUrl` varchar(191) DEFAULT NULL,
  `cvUrl` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `registration`
--

INSERT INTO `registration` (`id`, `userId`, `type`, `status`, `rejectionReason`, `packageId`, `locationId`, `instructorId`, `firstMeetDate`, `firstMeetSession`, `paymentMethod`, `paymentProofUrl`, `cvUrl`, `createdAt`, `updatedAt`) VALUES
('06394f13-3f88-4356-8ce0-8a047eed1430', 'e435bc3d-c0fd-4441-a04a-4347e5d5bf69', 'NEW_STUDENT', 'APPROVED', NULL, '5ad6c176-77e6-4275-8e42-5b55b2c6684d', '8c28f5ce-0dde-437a-baf4-3601fd5f595e', '52b8950b-22fd-4669-b267-26a0a4998005', '2026-11-01 00:00:00.000', 'sesi 3', 'QRIS', 'public\\uploads\\payments\\paymentProof-1793071861024-495388221.jpeg', NULL, '2026-10-27 03:18:52.440', '2026-10-27 03:31:25.320'),
('2324e300-1cc8-4c2d-a6c7-0fcb1473b993', '9d991121-991a-4bb8-bbda-8ca28bd7ad16', 'NEW_STUDENT', 'APPROVED', NULL, '5ad6c176-77e6-4275-8e42-5b55b2c6684d', '8c28f5ce-0dde-437a-baf4-3601fd5f595e', '344d5f42-a134-47f4-a93f-ce12c3b00a7f', '2026-11-02 00:00:00.000', 'sesi 1', 'BANK_TRANSFER', 'public/uploads/payments/paymentProof-1793245706668-361635022.jpg', NULL, '2026-10-29 03:45:24.994', '2026-10-29 03:48:58.247'),
('4a7b84db-a4e8-40c9-a17b-779fca698152', 'c215ffaa-6610-4715-8918-8b41cf7ab7b3', 'NEW_STUDENT', 'APPROVED', NULL, 'd499dc60-bd3d-4d96-8cb9-e5bbb9349687', '8c28f5ce-0dde-437a-baf4-3601fd5f595e', '52b8950b-22fd-4669-b267-26a0a4998005', '2026-11-02 00:00:00.000', 'sesi 2', 'BANK_TRANSFER', 'public\\uploads\\payments\\paymentProof-1793009022753-285227970.jpeg', NULL, '2026-10-26 10:03:43.125', '2026-10-26 10:03:56.628'),
('5a68b3b2-ca90-428c-8924-e2e3001cd50e', '52b8950b-22fd-4669-b267-26a0a4998005', 'NEW_INSTRUCTOR', 'APPROVED', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'public\\uploads\\cvs\\cv-1792919992038-445744528.pdf', '2026-10-26 06:07:16.743', '2026-10-26 06:07:16.743'),
('ef5223a5-377d-43e0-b685-bfb3a4a4f7a1', '344d5f42-a134-47f4-a93f-ce12c3b00a7f', 'NEW_INSTRUCTOR', 'APPROVED', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'public/uploads/cvs/cv-1793245009046-47242764.pdf', '2026-10-29 03:37:17.821', '2026-10-29 03:37:56.838');

-- --------------------------------------------------------

--
-- Table structure for table `schedule`
--

CREATE TABLE `schedule` (
  `id` varchar(191) NOT NULL,
  `instructorId` varchar(191) NOT NULL,
  `studentId` varchar(191) DEFAULT NULL,
  `dayOfWeek` varchar(191) NOT NULL,
  `sessionName` varchar(191) NOT NULL,
  `locationId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `schedule`
--

INSERT INTO `schedule` (`id`, `instructorId`, `studentId`, `dayOfWeek`, `sessionName`, `locationId`) VALUES
('0d1525f9-ba66-4daf-a7bd-276e09e9a6ba', '52b8950b-22fd-4669-b267-26a0a4998005', NULL, 'Minggu', 'sesi 3', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('2952746d-e5a3-4ab1-b9e4-9df312a9e186', '52b8950b-22fd-4669-b267-26a0a4998005', NULL, 'Sabtu', 'sesi 2', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('682e3a6c-c551-4024-aa6f-05df08cd02e8', '52b8950b-22fd-4669-b267-26a0a4998005', NULL, 'Sabtu', 'sesi 3', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('7ab62c0a-1f61-4228-860d-3fecefdade0a', '52b8950b-22fd-4669-b267-26a0a4998005', NULL, 'Senin', 'sesi 2', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('802d8c72-4e48-4f92-88df-709813f26467', '52b8950b-22fd-4669-b267-26a0a4998005', NULL, 'Sabtu', 'sesi 1', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('95da5cac-1064-4f35-ab78-3ef342e305aa', '344d5f42-a134-47f4-a93f-ce12c3b00a7f', NULL, 'Senin', 'sesi 1', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('cf953aa6-47e1-4b33-8006-b1c14ae2a8b5', '52b8950b-22fd-4669-b267-26a0a4998005', NULL, 'Senin', 'sesi 3', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('d5bee1eb-78ef-49aa-8523-213bfb98eb42', '344d5f42-a134-47f4-a93f-ce12c3b00a7f', NULL, 'Rabu', 'sesi 1', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('d68fe0aa-5a21-4eb2-8686-0bdcbe32e3ef', '52b8950b-22fd-4669-b267-26a0a4998005', NULL, 'Senin', 'sesi 1', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('d8b5a780-30b1-451a-a1aa-84b6201105b9', '52b8950b-22fd-4669-b267-26a0a4998005', NULL, 'Minggu', 'sesi 1', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('ffaaf579-93c7-4f2a-b09a-93d68e765f2d', '52b8950b-22fd-4669-b267-26a0a4998005', NULL, 'Minggu', 'sesi 2', '8c28f5ce-0dde-437a-baf4-3601fd5f595e');

-- --------------------------------------------------------

--
-- Table structure for table `sessiontime`
--

CREATE TABLE `sessiontime` (
  `id` varchar(191) NOT NULL,
  `dayOfWeek` varchar(191) NOT NULL,
  `sessionName` varchar(191) NOT NULL,
  `startTime` varchar(191) NOT NULL,
  `endTime` varchar(191) NOT NULL,
  `locationId` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessiontime`
--

INSERT INTO `sessiontime` (`id`, `dayOfWeek`, `sessionName`, `startTime`, `endTime`, `locationId`) VALUES
('0385760a-5532-40db-9c7e-db9db1989002', 'Selasa', 'sesi 2', '11:00', '12:00', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('1482c680-0b58-42e1-992b-1a6c8f371939', 'Senin', 'sesi 2', '11:00', '12:00', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('1b0b3223-94f1-47b7-a33c-106b61b1aa56', 'Rabu', 'sesi 1', '09:00', '10:00', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('370ed8a1-d0f7-42a4-ba97-e99ad96d0b77', 'Jumat', 'sesi 1', '09:00', '10:00', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('520ae756-3ebb-4cc0-bf34-e855188d279a', 'Selasa', 'sesi 3', '13:00', '14:00', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('52370d58-24d1-4d98-aeb3-eb5fb2aa6831', 'Sabtu', 'sesi 1', '09:00', '10:00', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('5ec823d0-c1ce-4a1c-becd-c61ecd4570af', 'Rabu', 'sesi 3', '13:00', '14:00', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('71dc629a-81a6-44ad-a288-3460c19e0267', 'Kamis', 'sesi 2', '11:00', '12:00', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('720df36d-dfbc-485b-bb75-5c6c261ed313', 'Kamis', 'sesi 1', '09:00', '10:00', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('839c2b3a-3532-49a6-ab54-3c990908d632', 'Jumat', 'sesi 3', '13:00', '14:00', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('8a563ae9-8598-453c-883f-70f454c245db', 'Minggu', 'sesi 2', '11:00', '12:00', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('a1f0e273-a231-4129-af32-cb8229d6c91a', 'Sabtu', 'sesi 3', '13:00', '14:00', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('a33d1c24-0e92-439c-89ce-e27e8dcc47a5', 'Senin', 'sesi 1', '09:00', '10:00', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('a8ac2c89-f1ed-4db4-8ea8-2faffd1d4d1f', 'Selasa', 'sesi 1', '09:00', '10:00', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('bf35005b-cf55-4ed6-af83-d719424aabae', 'Rabu', 'sesi 2', '11:00', '12:00', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('cdd30932-deaf-4844-ae1a-b0a76d944405', 'Minggu', 'sesi 3', '13:00', '14:00', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('e930d1ad-adbc-4feb-ba26-0428760725df', 'Senin', 'sesi 3', '13:00', '14:00', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('ea426342-4872-4efd-8b6e-767f6d9c8ddd', 'Sabtu', 'sesi 2', '11:00', '12:00', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('f33d6c92-7bec-44c4-9826-ca25d8aa0ec8', 'Kamis', 'sesi 3', '13:00', '14:00', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('fec8e7e8-a009-4beb-91cc-19a9a7df9b29', 'Minggu', 'sesi 1', '09:00', '10:00', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('ff831358-7fa6-4b5b-88d5-19ca1b4b1c73', 'Jumat', 'sesi 2', '11:00', '12:00', '8c28f5ce-0dde-437a-baf4-3601fd5f595e');

-- --------------------------------------------------------

--
-- Table structure for table `studentprofile`
--

CREATE TABLE `studentprofile` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `birthPlace` varchar(191) NOT NULL,
  `birthDate` datetime(3) NOT NULL,
  `gender` varchar(191) NOT NULL,
  `address` varchar(191) NOT NULL,
  `schoolOrOffice` varchar(191) NOT NULL,
  `tshirtSize` varchar(191) NOT NULL,
  `activeSessions` int(11) NOT NULL DEFAULT 0,
  `fullName` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `studentprofile`
--

INSERT INTO `studentprofile` (`id`, `userId`, `birthPlace`, `birthDate`, `gender`, `address`, `schoolOrOffice`, `tshirtSize`, `activeSessions`, `fullName`) VALUES
('214ed85a-b945-4095-bcb0-33d8cf25e6f7', 'c215ffaa-6610-4715-8918-8b41cf7ab7b3', 'pemalang', '2006-08-09 00:00:00.000', 'Laki-Laki', 'Jl. Mainan, Ciputat', 'Universitas Budi Luhur', 'XL', 4, 'Radiz Dirganta'),
('5f5bd2ff-29f4-45b4-a322-c818eee64f1b', '9d991121-991a-4bb8-bbda-8ca28bd7ad16', 'Tangerang', '2010-06-15 00:00:00.000', 'Laki-Laki', 'Jl. Melati No. 10, Tangerang', 'SMP Negeri 1 Tangerang', 'M', 2, 'Murid Satu'),
('f3bad135-e4dc-4062-aa23-085cf409867a', 'e435bc3d-c0fd-4441-a04a-4347e5d5bf69', 'Tangerang Selatan', '2006-08-09 00:00:00.000', 'Perempuan', 'Emerald Residence, Bintaro Sektor 9', 'Universitas Pembangunan Jaya', 'L', 4, 'Rikka');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `role` enum('ADMIN','POOL_MANAGER','INSTRUCTOR','STUDENT','USER') NOT NULL DEFAULT 'USER',
  `profilePictureUrl` varchar(191) DEFAULT NULL,
  `locationId` varchar(191) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `isVerified` tinyint(1) NOT NULL DEFAULT 0,
  `otpCode` varchar(191) DEFAULT NULL,
  `otpExpiresAt` datetime(3) DEFAULT NULL,
  `fullName` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `resetToken` varchar(191) DEFAULT NULL,
  `resetTokenExpiresAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `email`, `password`, `role`, `profilePictureUrl`, `locationId`, `isActive`, `isVerified`, `otpCode`, `otpExpiresAt`, `fullName`, `phone`, `resetToken`, `resetTokenExpiresAt`) VALUES
('344d5f42-a134-47f4-a93f-ce12c3b00a7f', 'pelatih.uji@gmail.com', '$2b$10$uU3Y/bd8DNWL9F0H.8/ctuNpTr2QVy7FGL7GV3F6mcKZ3If/Tzo16', 'INSTRUCTOR', 'public/uploads/profiles/profilePicture-1793244971422-360814179.jpg', NULL, 1, 1, NULL, NULL, 'Budi Santoso, S.Pd.', '081234567890', NULL, NULL),
('4b00aea7-78c0-49b0-8c49-07710bd2451f', 'tiryalumba@gmail.com', '$2b$10$qho1qBZTTplzBTqYTCzwkOnjSayJG59TPzVXtInqijMltGwCLsV86', 'ADMIN', NULL, NULL, 1, 1, NULL, NULL, 'Super Admin Tiriya Lumba', '081234567890', NULL, NULL),
('52b8950b-22fd-4669-b267-26a0a4998005', 'cihuykan0101@gmail.com', '$2b$10$hUdlD7AuuiI2S18vHEPqcOUJn7dJjllIS//s4zbrRg18Kw2.XQ2k2', 'INSTRUCTOR', 'public\\uploads\\profiles\\profilePicture-1792919888436-990907735.png', NULL, 1, 1, NULL, NULL, 'coach lumba', '0851234523123', NULL, NULL),
('95e926e0-6867-45e3-939e-c7303c4a9285', 'murid2.test@tiryalumba.id', '$2b$10$XoL3KiRL91iUlUbVagS1KuqbsWctmTtv.GX54fY4.hez9AqkGpJ.e', 'USER', NULL, NULL, 1, 1, NULL, NULL, 'Murid Dua', NULL, NULL, NULL),
('9d991121-991a-4bb8-bbda-8ca28bd7ad16', 'murid1.test@tiryalumba.id', '$2b$10$OATbIGTvEetV4gn7fGdVR.izn0uVIcHEhnygWADHoi2MDjM8q7vVW', 'STUDENT', 'public/uploads/profiles/profilePicture-1793245375261-869750030.jpg', NULL, 1, 1, NULL, NULL, 'Murid Satu', '081298765432', NULL, NULL),
('c215ffaa-6610-4715-8918-8b41cf7ab7b3', 'pintar054@gmail.com', '$2b$10$a5B1ijmvdAMG0/NzHLqS0u9crybPA4rGlzr1qB.s0bL41hrhTE/ym', 'STUDENT', 'public\\uploads\\profiles\\profilePicture-1792920439670-374064175.jpeg', NULL, 1, 1, NULL, NULL, 'Radiz Dirganta', '0851234523123', NULL, NULL),
('e435bc3d-c0fd-4441-a04a-4347e5d5bf69', 'radizjoster@gmail.com', '$2b$10$G1xHFGolTEhG87RR1N.t8ee/F8DD6Vx76FN15oI1Zr21OB3AwghbW', 'STUDENT', 'public\\uploads\\profiles\\profilePicture-1793071005392-561689831.jpg', NULL, 1, 1, NULL, NULL, 'Rikka', '085782599453', NULL, NULL),
('e5563710-cb83-4eca-be3d-d194a6760e8f', 'poolmanager@gmail.com', '$2b$10$qho1qBZTTplzBTqYTCzwkOnjSayJG59TPzVXtInqijMltGwCLsV86', 'POOL_MANAGER', NULL, '8c28f5ce-0dde-437a-baf4-3601fd5f595e', 1, 1, NULL, NULL, 'Pool Manager Permata', '+625782599453', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `_instructorlocations`
--

CREATE TABLE `_instructorlocations` (
  `A` varchar(191) NOT NULL,
  `B` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_instructorlocations`
--

INSERT INTO `_instructorlocations` (`A`, `B`) VALUES
('0bdb7a4a-5341-46c2-804c-bf7fd8a6454b', '8c28f5ce-0dde-437a-baf4-3601fd5f595e'),
('a6a2f4dd-5e7d-4287-a7bb-24d342900f72', '8c28f5ce-0dde-437a-baf4-3601fd5f595e');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('261a5dd0-9772-4d4d-a17e-ae00689611b2', 'a5b6dfdc22df9bac0ca3e9406e022aab21c6590080a2313cfe1adb7704d86a9a', '2026-10-23 23:01:30.391', '20261013232518_add_option_value_phone_num', NULL, NULL, '2026-10-23 23:01:30.350', 1),
('27c14f2e-d769-4b31-aa8d-c4651d471d0b', '612ad8298652f8e24c975ca7cd7e0d448c3daf4ce40562b80f8d3b995adfee71', '2026-10-23 23:01:30.420', '20261014145353_add_fullname_student_profile', NULL, NULL, '2026-10-23 23:01:30.413', 1),
('576e22fa-9c51-4e4a-acfc-5c1266d2036f', '161266f4109c3cac1a64868b95906bca0566b4bc52f2ec68b47de9206f037a30', '2026-10-23 23:01:30.411', '20261014143342_remove_age_value_student_profile', NULL, NULL, '2026-10-23 23:01:30.403', 1),
('8f4c41eb-d1fe-4472-b970-69c3df31051c', '6519f14ea2b771c175c363e8392b6453b76ad1de35817a9a9d60020e2aff8382', '2026-10-23 23:01:30.084', '20261012111611_add_fullname_and_phone_to_user', NULL, NULL, '2026-10-23 23:01:30.076', 1),
('93a54b8a-dc67-46a7-af87-7bff6abfeed8', '2ab2b5662588c3e10c07d4751a728363b8587d0903f33120d9db3b75075bae73', '2026-10-23 23:01:30.130', '20261013091627_remove_instructor_profile', NULL, NULL, '2026-10-23 23:01:30.085', 1),
('9822452c-58f5-4936-bd3f-cf1045f96328', '669e70c6cd86b08049722ecfb76c146c16d241fe05b09349fc9187891631a018', '2026-10-23 23:01:30.349', '20261013135216_remove_meet_count_package', NULL, NULL, '2026-10-23 23:01:30.342', 1),
('b1c09349-6ebe-4b70-838b-2339a8e14460', 'ea2e883f6b65f260cfd7ed50588a760e2cacff21716674211b926d925edb33d7', '2026-10-23 23:01:29.988', '20261008123040_init', NULL, NULL, '2026-10-23 23:01:29.548', 1),
('ba0a6d67-e92c-409e-aebe-351367b6d032', '311d3137bad00e49fa58c8af4da5fb9f4eed0360b5696e350a46374dcb50b4e6', '2026-10-23 23:01:30.000', '20261009015518_add_otp_fields', NULL, NULL, '2026-10-23 23:01:29.990', 1),
('bafbecb3-5307-4f8a-9b78-f71c62d66564', 'c9bffaf306074cf0738a5db9db4817d948a94586ba6d1515c0f3b9e5440d5ec7', '2026-10-23 23:01:30.341', '20261013120312_finalize_instructor_schema', NULL, NULL, '2026-10-23 23:01:30.132', 1),
('bbe2237b-eacd-46a3-a27e-f49429e543ce', 'c485e4dd731d05f67c8b45dc86ecc4f6adb92277ccab622ee93be0524a695336', '2026-10-23 23:01:30.402', '20261014131432_add_age_value_student_profile', NULL, NULL, '2026-10-23 23:01:30.393', 1),
('c8e92d07-1239-42ad-846a-594cc0137911', '35bf8318068f18ef505e68ca2ef2fa61eeb4e8bc5de2de5468e7fd185084e83a', '2026-10-23 23:01:30.430', '20261023014719_remove_photo_url_in_regristarion', NULL, NULL, '2026-10-23 23:01:30.421', 1),
('ec347e4d-de3c-439c-a498-fe7093ba30d4', '9994d741b7ac749bbdb520051e90bb01f9ffd27a07eb08a852e8a00cb48015c0', '2026-10-23 23:01:30.468', '20261023024405_add_user_relation_to_registration', NULL, NULL, '2026-10-23 23:01:30.431', 1),
('ed2536d0-fba1-4674-85a2-dff5b0f479d3', 'd4ba888448cb402db46016fc53273ae64990e942648c474eb06fdfa15a6b9ba3', '2026-10-23 23:01:30.075', '20261011224310_add_area_table', NULL, NULL, '2026-10-23 23:01:30.002', 1),
('edd5b2fb-51d4-41ca-9c00-f5c08eedc164', '4619327153f5ba799e6dd191cdf4b600af50f2775bd8088c204b7985ced0b42a', '2026-10-23 23:03:26.827', '20261023230326_add_birthdate_to_instructor', NULL, NULL, '2026-10-23 23:03:26.746', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `area`
--
ALTER TABLE `area`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Area_name_key` (`name`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Attendance_studentProfileId_fkey` (`studentProfileId`);

--
-- Indexes for table `instructorprofile`
--
ALTER TABLE `instructorprofile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `InstructorProfile_userId_key` (`userId`);

--
-- Indexes for table `location`
--
ALTER TABLE `location`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Location_name_areaId_key` (`name`,`areaId`),
  ADD KEY `Location_areaId_fkey` (`areaId`);

--
-- Indexes for table `package`
--
ALTER TABLE `package`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Package_locationId_fkey` (`locationId`);

--
-- Indexes for table `registration`
--
ALTER TABLE `registration`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Registration_userId_fkey` (`userId`);

--
-- Indexes for table `schedule`
--
ALTER TABLE `schedule`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Schedule_locationId_fkey` (`locationId`),
  ADD KEY `Schedule_instructorId_fkey` (`instructorId`);

--
-- Indexes for table `sessiontime`
--
ALTER TABLE `sessiontime`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `studentprofile`
--
ALTER TABLE `studentprofile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `StudentProfile_userId_key` (`userId`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`),
  ADD KEY `User_locationId_fkey` (`locationId`);

--
-- Indexes for table `_instructorlocations`
--
ALTER TABLE `_instructorlocations`
  ADD UNIQUE KEY `_InstructorLocations_AB_unique` (`A`,`B`),
  ADD KEY `_InstructorLocations_B_index` (`B`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `Attendance_studentProfileId_fkey` FOREIGN KEY (`studentProfileId`) REFERENCES `studentprofile` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `instructorprofile`
--
ALTER TABLE `instructorprofile`
  ADD CONSTRAINT `InstructorProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `location`
--
ALTER TABLE `location`
  ADD CONSTRAINT `Location_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `area` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `package`
--
ALTER TABLE `package`
  ADD CONSTRAINT `Package_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `location` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `registration`
--
ALTER TABLE `registration`
  ADD CONSTRAINT `Registration_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `schedule`
--
ALTER TABLE `schedule`
  ADD CONSTRAINT `Schedule_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `user` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Schedule_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `location` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `studentprofile`
--
ALTER TABLE `studentprofile`
  ADD CONSTRAINT `StudentProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `User_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `_instructorlocations`
--
ALTER TABLE `_instructorlocations`
  ADD CONSTRAINT `_InstructorLocations_A_fkey` FOREIGN KEY (`A`) REFERENCES `instructorprofile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `_InstructorLocations_B_fkey` FOREIGN KEY (`B`) REFERENCES `location` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
