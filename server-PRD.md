# Backend Server PRD — PT Tirya Lumba
## Arsitektur REST API, Skema Basis Data, Otorisasi RBAC, dan Logika Bisnis Server

> **Tujuan Dokumen:**
> Dokumen ini adalah Product Requirement Document (PRD) teknis khusus untuk backend server PT Tirya Lumba (`/server`). Dokumen ini menjabarkan seluruh spesifikasi arsitektur data, alur transaksi Prisma, validasi keamanan, serta logika bisnis yang menjadi fondasi backend.

---

## 1. Ringkasan & Tumpukan Teknologi Backend

Backend PT Tirya Lumba melayani seluruh kebutuhan data bagi dua aplikasi klien: **Frontend Landing Page (Next.js)** dan **Frontend Dasbor Admin (React Vite)**.

- **Bahasa & Runtime:** Node.js (v20+ / v24+), TypeScript, Express.js.
- **ORM & Basis Data:** Prisma ORM, MySQL Database (`db_tirya_lumba`).
- **Autentikasi & Keamanan:** JSON Web Token (JWT), Bcrypt password hashing, Helmet, CORS, Express Rate Limit.
- **Validasi Data:** Zod schema validation.
- **Penanganan File Upload:** Multer (penyimpanan lokal ke `/public/uploads`).
- **Port Layanan:** `http://localhost:5000` (Base API: `/api`).

---

## 2. Arsitektur Data & Skema Database (Prisma Schema)

### 2.1 Enums
1. **`Role`:**
   - `ADMIN`: Administrator pusat (Super Admin).
   - `POOL_MANAGER`: Pengelola operasional cabang kolam renang.
   - `INSTRUCTOR`: Pelatih renang berlisensi.
   - `STUDENT`: Murid kursus renang terdaftar.
   - `USER`: Pengguna umum yang baru mendaftar/verifikasi OTP.
2. **`PaymentMethod`:**
   - `QRIS`, `BANK_TRANSFER`, `CASH`.
3. **`RegistrationStatus`:**
   - `PENDING`: Menunggu persetujuan admin/pengelola.
   - `APPROVED`: Disetujui (peran diaktifkan & kuota dialokasikan).
   - `REJECTED`: Ditolak beserta alasan penolakan.
4. **`RegistrationType`:**
   - `NEW_STUDENT`: Pendaftaran murid baru / daftar ulang paket.
   - `NEW_INSTRUCTOR`: Pendaftaran pelatih baru.
   - `RENEWAL`: Perpanjangan paket kursus.

### 2.2 Model Basis Data Utama

```prisma
model User {
  id                  String             @id @default(uuid())
  fullName            String
  phone               String?
  email               String             @unique
  password            String
  role                Role               @default(USER)
  otpCode             String?
  otpExpiresAt        DateTime?
  resetToken          String?
  resetTokenExpiresAt DateTime?
  isVerified          Boolean            @default(false)
  profilePictureUrl   String?
  locationId          String?
  location            Location?          @relation(fields: [locationId], references: [id])
  isActive            Boolean            @default(true)
  studentProfile      StudentProfile?
  instructorProfile   InstructorProfile?
  schedules           Schedule[]         @relation("InstructorSchedules")
  registrations       Registration[]
}

model Area {
  id        String     @id @default(uuid())
  name      String     @unique // Contoh: "Tangerang Selatan", "Kota Tangerang"
  locations Location[]
}

model Location {
  id          String              @id @default(uuid())
  name        String              // Nama kolam renang
  category    String              // Kerjasama Tangerang, Non-Kerjasama, dll.
  mapUrl      String?             // Tautan koordinat Google Maps
  areaId      String?
  area        Area?               @relation(fields: [areaId], references: [id])
  packages    Package[]
  users       User[]
  instructors InstructorProfile[] @relation("InstructorLocations")
  schedules   Schedule[]

  @@unique([name, areaId])
}

model Package {
  id           String   @id @default(uuid())
  locationId   String
  type         String   // Reguler, Privat, Prestasi, Ekskul
  price        Float
  sessionCount Int      @default(4) // Jumlah sesi per paket (1 - 10 pertemuan)
  location     Location @relation(fields: [locationId], references: [id])
}

model SessionTime {
  id          String  @id @default(uuid())
  dayOfWeek   String  // Senin, Selasa, dst.
  sessionName String  // Sesi 1, Sesi 2, dst.
  startTime   String  // "09:00"
  endTime     String  // "10:00"
  locationId  String? // Null = global, terisi = kolam spesifik
}

model StudentProfile {
  id             String       @id @default(uuid())
  userId         String       @unique
  fullName       String
  birthPlace     String
  birthDate      DateTime
  gender         String
  address        String
  schoolOrOffice String
  tshirtSize     String       // XS, S, M, L, XL, XXL
  activeSessions Int          @default(0) // Sisa kuota sesi latihan aktif
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  attendances    Attendance[]
}

model InstructorProfile {
  id                String     @id @default(uuid())
  userId            String     @unique
  user              User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  shortBio          String?    @db.Text
  birthDate         DateTime
  license           String?    @db.Text
  experience        String?
  locations         Location[] @relation("InstructorLocations")
  lastRescheduledAt DateTime?  // Timestamp kesempatan reschedule bulanan
}

model Registration {
  id               String             @id @default(uuid())
  userId           String
  user             User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  type             RegistrationType
  status           RegistrationStatus @default(PENDING)
  rejectionReason  String?
  packageId        String?
  locationId       String?
  instructorId     String?
  firstMeetDate    DateTime?
  firstMeetSession String?
  paymentMethod    PaymentMethod?
  paymentProofUrl  String?
  cvUrl            String?
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @default(now()) @updatedAt
}

model Schedule {
  id           String   @id @default(uuid())
  instructorId String
  instructor   User     @relation("InstructorSchedules", fields: [instructorId], references: [id])
  studentId    String?
  dayOfWeek    String
  sessionName  String
  locationId   String
  location     Location @relation(fields: [locationId], references: [id])
}

model Attendance {
  id               String          @id @default(uuid())
  studentProfileId String?
  instructorId     String?
  role             String          @default("Murid") // "Murid" / "Pelatih"
  name             String
  locationName     String
  date             DateTime        @default(now())
  status           String          // "Hadir" / "Tidak Hadir"
  studentProfile   StudentProfile? @relation(fields: [studentProfileId], references: [id])
}
```

---

## 3. Logika Bisnis Kritis Backend (*Core Algorithms*)

### 3.1 Aturan Saling Mengunci Kapasitas Pelatih (*Mutual Exclusion Clash Guard*)
Diterapkan pada endpoint pencarian pelatih ([`getAvailableInstructors.ts`](file:///d:/VS%20Code/Tiriya%20Lumba/server/src/controllers/instructorsController/getAvailableInstructors.ts)) dan verifikasi saat form disubmit ([`registerStudentController.ts`](file:///d:/VS%20Code/Tiriya%20Lumba/server/src/controllers/registerController/registerStudentController.ts)):
1. **Pengecekan Jadwal Deklarasi:** Pelatih wajib memiliki baris ketersediaan di tabel `Schedule` pada kolam, hari (`dayOfWeek`), dan sesi (`sessionName`) yang dipilih.
2. **Isolasi Hari:** Pengecekan pendaftaran aktif memfilter kecocokan hari dari tanggal pertemuan pertama (`firstMeetDate`).
3. **Aturan Kelas Privat (Eksklusif 1-on-1):**
   - Calon murid yang mendaftar paket **PRIVAT** hanya dapat memilih pelatih jika slot hari dan sesi tersebut **BENAR-BENAR KOSONG (0 murid aktif)**.
   - Jika sudah ada murid Privat di slot tersebut, slot terkunci eksklusif sehingga tidak dapat dipilih oleh murid lain (baik sesama Privat maupun Reguler).
4. **Aturan Kelas Reguler (Kelompok Maksimal 5 Murid):**
   - Calon murid yang mendaftar paket **REGULER** hanya dapat memilih pelatih jika:
     a. Slot tersebut **TIDAK memiliki murid Privat**.
     b. Jumlah murid reguler aktif pada slot tersebut **kurang dari 5 orang** (`regularCount < 5`).
5. **Double-Guard:** Jika terjadi *race condition* di mana kuota terpenuhi saat user sedang mengisi form, backend menolak dengan error `400 Bad Request` sebelum transaksi database dieksekusi.

### 3.2 Alur Daftar Ulang Tanpa Penguncian Akun (*Non-Locking Renewal*)
1. **Penanganan Presensi Sesi 0:**
   - Pada saat presensi dicatat sebagai *"Hadir"*, `activeSessions` di `StudentProfile` dikurangi 1 (`decrement: 1`).
   - Ketika `activeSessions` mencapai angka 0, status `User.isActive` **TETAP TRUE**. Akun tidak diblokir agar murid dapat login ke landing page dan melihat ringkasan paketnya yang telah selesai.
2. **Penanganan Pendaftaran Ulang:**
   - Saat murid dengan `activeSessions === 0` mendaftar ulang di `/daftar/murid`, controller `registerStudentController` memperbarui (*update*) record pendaftaran lama ke status `PENDING` dengan jadwal, kolam, paket, dan pelatih baru, serta menghapus duplikasi pendaftaran lama.
   - Hal ini memastikan pelatih lama tidak mendeteksi murid tersebut di sesi lamanya, sehingga mencegah terciptanya murid fiktif.

### 3.3 Alokasi Kuota Sesi Dinamis Saat Approval (`sessionCount`)
- Model `Package` menyimpan kolom `sessionCount` dengan batas minimal 1 dan maksimal 10 pertemuan (default: 4).
- Pada saat admin/pengelola menyetujui pendaftaran murid (`POST /api/register/:id/approve`), sistem membaca `package.sessionCount` dan mengisikannya ke `StudentProfile.activeSessions`.

### 3.4 Reschedule Mandiri Otonom Pelatih (Token Bulanan)
- Pelatih memiliki hak atur ulang jadwal mandiri (`PUT /api/instructors/reschedule`).
- Dibatasi kuota 1 kali per 30 hari berdasarkan timestamp `lastRescheduledAt`.
- **Validasi Kritis:** Pelatih dilarang menghapus sesi atau kolam yang sedang aktif dijadwalkan mengajar murid (`hasStudent === true`). Minimal menyisakan 1 sesi jadwal mengajar.

### 3.5 Agregasi Ringkasan Dasbor Hemat Memori
- Endpoint `GET /api/dashboard/summary?year=X&month=Y`:
  - Menggunakan query agregasi Prisma langsung di database (bukan menarik seluruh data mentah ke memori server).
  - Khusus untuk `POOL_MANAGER`, seluruh perhitungan otomatis di-filter berdasarkan `currentUser.locationId`.
  - Mengembalikan total siswa aktif, total guru, total pendaftar, dan array distribusi data grafik (12 bulan atau 5 minggu).

---

## 4. Keamanan & Middleware

1. **`authMiddleware`:**
   - Memverifikasi token JWT dari header `Authorization: Bearer <token>` atau HTTP-Only cookie `access_token`.
   - Menolak token kedaluwarsa (*TokenExpiredError*) dan memastikan akun terverifikasi (`isVerified === true`) serta aktif (`isActive === true`).
   - Menyematkan data user (`userId`, `email`, `role`, `locationId`) ke `req.user`.
2. **`authorize(...roles)`:**
   - Memeriksa apakah `req.user.role` termasuk dalam peran yang diizinkan untuk rute tersebut.
3. **`uploadMiddleware` (Multer):**
   - Membatasi ukuran file pas foto dan bukti bayar maksimal 5 MB (format JPG, PNG, WEBP).
   - Membatasi ukuran dokumen CV pelatih maksimal 10 MB (format PDF).
4. **`rateLimiter`:**
   - Membatasi request publik maksimal 100 request per 15 menit per alamat IP.

---

## 5. Matriks Rute Endpoint Backend

| Rute Endpoint | Method | Middleware / Auth | Handler Controller |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | `authController/register.ts` |
| `/api/auth/verify-otp` | `POST` | Public | `authController/verifyOtp.ts` |
| `/api/auth/login` | `POST` | Public | `authController/login.ts` |
| `/api/auth/forgot-password` | `POST` | Public | `authController/forgotPassword.ts` |
| `/api/auth/reset-password` | `POST` | Public | `authController/resetPassword.ts` |
| `/api/auth/logout` | `POST` | Public / Auth | `authController/logout.ts` |
| `/api/stats` | `GET` | Public | `statsController/index.ts` |
| `/api/areas` | `GET`, `POST` | GET: Public, POST: ADMIN | `areaController` |
| `/api/areas/:id` | `GET`, `PUT`, `DELETE` | GET: Public, Lainnya: ADMIN | `areaController` |
| `/api/locations` | `GET`, `POST` | GET: Public, POST: ADMIN | `locationController` |
| `/api/locations/:id` | `GET`, `PUT`, `DELETE` | GET: Public, Lainnya: ADMIN | `locationController` |
| `/api/packages` | `GET`, `POST` | GET: Public, POST: ADMIN | `packageController` |
| `/api/packages/:id` | `GET`, `PUT`, `DELETE` | GET: Public, Lainnya: ADMIN | `packageController` |
| `/api/sessions` | `GET`, `POST` | GET: Public, POST: ADMIN | `sessionController` |
| `/api/sessions/:id` | `GET`, `PUT`, `DELETE` | GET: Public, Lainnya: ADMIN | `sessionController` |
| `/api/pool-managers` | `GET`, `POST` | ADMIN | `poolManagerController` |
| `/api/pool-managers/:id` | `GET`, `PUT`, `DELETE` | ADMIN | `poolManagerController` |
| `/api/instructor/available` | `GET` | Public | `instructorsController/getAvailableInstructors.ts` |
| `/api/instructor/management` | `GET` | ADMIN, POOL_MANAGER | `instructorsController/get.ts` |
| `/api/instructors/reschedule/status` | `GET` | INSTRUCTOR | `instructorsController/rescheduleController.ts` |
| `/api/instructors/reschedule` | `PUT` | INSTRUCTOR | `instructorsController/rescheduleController.ts` |
| `/api/register/me` | `GET` | Auth (Semua User) | `registerController/getMyRegistration.ts` |
| `/api/register/student` | `POST` | Auth (USER / STUDENT) | `registerController/registerStudentController.ts` |
| `/api/register/instructor` | `POST` | Auth (USER / INSTRUCTOR)| `registerController/registerInstructorController.ts` |
| `/api/register` | `GET` | ADMIN, POOL_MANAGER | `registerController/get.ts` |
| `/api/register/:id` | `GET` | ADMIN, POOL_MANAGER | `registerController/getById.ts` |
| `/api/register/:id/approve` | `POST` | ADMIN, POOL_MANAGER | `registerController/approveRegistration.ts` |
| `/api/register/:id/reject` | `POST` | ADMIN, POOL_MANAGER | `registerController/rejectRegistration.ts` |
| `/api/siswa` / `/api/students` | `GET` | ADMIN, POOL_MANAGER | `studentsController/index.ts` |
| `/api/attendances/today` | `GET` | ADMIN, POOL_MANAGER | `attendanceController/index.ts` |
| `/api/attendances/my-history` | `GET` | Auth (STUDENT, USER) | `attendanceController/index.ts` |
| `/api/attendances` | `GET`, `POST` | ADMIN, POOL_MANAGER | `attendanceController/index.ts` |
| `/api/dashboard/summary` | `GET` | ADMIN, POOL_MANAGER | `dashboardController/index.ts` |
