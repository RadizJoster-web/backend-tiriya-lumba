-- 1. Buat tabel Location terlebih dahulu (karena di-referensi oleh User, Package, SessionTime, Registration, Schedule)
CREATE TABLE Location (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    address TEXT NOT NULL,
    category VARCHAR(191) NOT NULL,
    mapUrl VARCHAR(255)
);

-- 2. Buat tabel User (merujuk ke Location untuk POOL_MANAGER)
CREATE TABLE User (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(191) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'POOL_MANAGER', 'INSTRUCTOR', 'STUDENT') NOT NULL,
    profilePictureUrl VARCHAR(255),
    locationId VARCHAR(36),
    isActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (locationId) REFERENCES Location(id) ON DELETE SET NULL
);

-- 3. Buat tabel StudentProfile (Relasi 1:1 ke User)
CREATE TABLE StudentProfile (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) UNIQUE NOT NULL,
    fullName VARCHAR(191) NOT NULL,
    birthPlace VARCHAR(191) NOT NULL,
    birthDate DATETIME(3) NOT NULL,
    gender VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    schoolOrOffice VARCHAR(191) NOT NULL,
    tshirtSize VARCHAR(10) NOT NULL,
    activeSessions INT DEFAULT 0 NOT NULL,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

-- [Catatan: Model InstructorProfile ada di relasi User, namun tidak tertulis di skema Anda. Ini adalah bentuk standarnya]
CREATE TABLE InstructorProfile (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) UNIQUE NOT NULL,
    -- Tambahkan field spesifik instruktur di sini
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

-- 4. Buat tabel Package
CREATE TABLE Package (
    id VARCHAR(36) PRIMARY KEY,
    locationId VARCHAR(36) NOT NULL,
    type VARCHAR(191) NOT NULL,
    price DOUBLE NOT NULL,
    meetCount INT NOT NULL,
    FOREIGN KEY (locationId) REFERENCES Location(id) ON DELETE CASCADE
);

-- 5. Buat tabel SessionTime
CREATE TABLE SessionTime (
    id VARCHAR(36) PRIMARY KEY,
    dayOfWeek VARCHAR(50) NOT NULL,
    sessionName VARCHAR(100) NOT NULL,
    startTime VARCHAR(10) NOT NULL,
    endTime VARCHAR(10) NOT NULL,
    locationId VARCHAR(36),
    FOREIGN KEY (locationId) REFERENCES Location(id) ON DELETE SET NULL
);

-- 6. Buat tabel Registration
CREATE TABLE Registration (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    type ENUM('NEW_STUDENT', 'NEW_INSTRUCTOR', 'RENEWAL') NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING' NOT NULL,
    rejectionReason TEXT,
    packageId VARCHAR(36),
    locationId VARCHAR(36),
    instructorId VARCHAR(36),
    firstMeetDate DATETIME(3),
    firstMeetSession VARCHAR(100),
    paymentMethod ENUM('QRIS', 'BANK_TRANSFER', 'CASH'),
    paymentProofUrl VARCHAR(255),
    photoUrl VARCHAR(255),
    cvUrl VARCHAR(255),
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (packageId) REFERENCES Package(id) ON DELETE SET NULL,
    FOREIGN KEY (locationId) REFERENCES Location(id) ON DELETE SET NULL,
    FOREIGN KEY (instructorId) REFERENCES User(id) ON DELETE SET NULL
);

-- 7. Buat tabel Schedule
CREATE TABLE Schedule (
    id VARCHAR(36) PRIMARY KEY,
    instructorId VARCHAR(36) NOT NULL,
    studentId VARCHAR(36),
    dayOfWeek VARCHAR(50) NOT NULL,
    sessionName VARCHAR(100) NOT NULL,
    locationId VARCHAR(36) NOT NULL,
    FOREIGN KEY (instructorId) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (studentId) REFERENCES User(id) ON DELETE SET NULL,
    FOREIGN KEY (locationId) REFERENCES Location(id) ON DELETE CASCADE
);