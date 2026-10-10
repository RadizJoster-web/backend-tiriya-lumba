# Arsitektur Backend: REST API & Database PT Tirya Lumba

Spesifikasi teknis, pedoman arsitektur, desain _database_ (Prisma), dan struktur _endpoint_ untuk sistem _backend_ PT Tirya Lumba.

# 1\. Ringkasan Sistem

Backend PT Tirya Lumba adalah pusat logika bisnis yang menyuplai data ke _Landing Page_ (Next.js) dan _Dashboard Admin_ (Vite SPA). Dibangun menggunakan Node.js dan Express.js, sistem ini menyediakan antarmuka REST API, mengelola relasi data menggunakan Prisma ORM dengan _database_ MySQL, mengatur lapisan keamanan (_Role-Based Access Control_ / RBAC), serta menangani unggahan file secara lokal (_local storage_).

# 2\. Teknologi Utama

- **Framework:** Node.js \+ Express.js
- **Database & ORM:** MySQL \+ Prisma ORM
- **Autentikasi & Keamanan:** JSON Web Token (JWT), bcrypt (hashing password), Express Rate Limit, Helmet, CORS.
- **File Upload:** Multer (Local Storage).
- **Validasi Data:** Zod (Validasi _payload_ request).

# 3\. Desain Database (Prisma Schema Core)

Skema telah disesuaikan dengan _workflow_ pendaftaran terbaru dan kebutuhan CMS Dasbor.

```
enum Role { ADMIN, POOL_MANAGER, INSTRUCTOR, STUDENT }
enum PaymentMethod { QRIS, BANK_TRANSFER, CASH }
enum RegistrationStatus { PENDING, APPROVED, REJECTED }
enum RegistrationType { NEW_STUDENT, NEW_INSTRUCTOR, RENEWAL }

model User {
  id                String             @id @default(uuid())
  email             String             @unique
  password          String
  role              Role
  otpCode           String?            // Menyimpan kode OTP
  otpExpiresAt      DateTime?          // Masa berlaku OTP (misal: 5 menit dari dibuat)
  isVerified        Boolean            @default(false) // Status apakah OTP sudah diverifikasi
  profilePictureUrl String?
  locationId        String?
  location          Location?          @relation(fields: [locationId], references: [id])
  isActive          Boolean            @default(true)
  studentProfile    StudentProfile?
  instructorProfile InstructorProfile?
}

model Location {
  id          String   @id @default(uuid())
  name        String
  address     String
  category    String   // Kerjasama Tangerang, Non-Kerjasama, dll.
  mapUrl      String?
  packages    Package[]
}

model Package {
  id          String   @id @default(uuid())
  locationId  String
  type        String   // Reguler, Privat, Prestasi, Ekskul
  price       Float
  meetCount   Int      // Jumlah sesi (misal: 4)
  location    Location @relation(fields: [locationId], references: [id])
}

model SessionTime {
  id          String   @id @default(uuid())
  dayOfWeek   String   // Senin, Selasa, dll.
  sessionName String   // Sesi 1
  startTime   String   // "09:00"
  endTime     String   // "10:00"
  locationId  String?  // Jika null, berlaku global. Jika terisi, spesifik kolam.
}

model StudentProfile {
  id             String   @id @default(uuid())
  userId         String   @unique
  fullName       String
  birthPlace     String
  birthDate      DateTime
  gender         String
  address        String
  phone          String
  schoolOrOffice String
  tshirtSize     String   // XS, S, M, L, XL, XXL
  activeSessions Int      @default(0)
  user           User     @relation(fields: [userId], references: [id])
}

model Registration {
  id                String             @id @default(uuid())
  userId            String             // Referensi pendaftar
  type              RegistrationType
  status            RegistrationStatus @default(PENDING)
  rejectionReason   String?            // Wajib diisi admin jika status = REJECTED

  // Data Pendaftaran Murid (Booking)
  packageId         String?
  locationId        String?
  instructorId      String?
  firstMeetDate     DateTime?          // Rencana pertemuan ke-1
  firstMeetSession  String?

  // Data Pembayaran & File (Multer)
  paymentMethod     PaymentMethod?
  paymentProofUrl   String?            // Foto transfer / dokumentasi serah uang cash
  photoUrl          String?            // Foto 4x6 (Siswa)
  cvUrl             String?            // CV (Pelatih)
}

model Schedule {
  id           String   @id @default(uuid())
  instructorId String
  studentId    String?  // Null jika pelatih hanya declare ketersediaan, terisi jika sudah di-booking murid
  dayOfWeek    String
  sessionName  String
  locationId   String
}
```

# 4\. Desain REST API (Endpoints)

## A. Autentikasi & Profil Publik

- POST /api/auth/register \- Daftar akun awal, kirim OTP.
- POST /api/auth/verify-otp \- Verifikasi OTP.
- POST /api/auth/login \- Login, kembalikan JWT JWT \+ Role.
- GET /api/public/instructors \- Ambil daftar pelatih (untuk _Landing Page_).
- GET /api/public/locations \- Ambil data lokasi (untuk _Landing Page_).

## B. Booking & Upload (Klien)

- POST /api/upload \- _Upload_ file (foto 4x6, bukti bayar, dokumentasi cash, CV). Menggunakan Multer. Menyimpan file di folder /public/uploads.
- POST /api/bookings/students \- Submit pendaftaran murid berstatus PENDING. Validasi _Payment Method_
- POST /api/bookings/instructors \- Submit pendaftaran pelatih.
- POST /api/bookings/renewal \- Perpanjangan paket mandiri oleh murid (activeSessions \= 0).

## C. CMS & Dasbor Admin (Wajib Token JWT)

1. GET /api/dashboard/summary?month=X\&year=Y \- Metrik grafik & angka utama.
2. GET /api/admin/registrations \- Ambil data antrian (Difilter berdasar role: Pusat lihat semua, Pengelola lihat kolamnya saja).
3. POST /api/admin/registrations/:id/approve \- Pindahkan data ke _Master_.
4. POST /api/admin/registrations/:id/reject \- Tolak pendaftaran (Wajib kirim JSON rejectionReason).
5. **CMS Master Data (Khusus Admin Pusat):**
   1. CRUD /api/admin/locations
   2. CRUD /api/admin/packages \- Atur harga per kolam.
   3. CRUD /api/admin/sessions \- Atur waktu sesi global/lokal.
   4. CRUD /api/admin/pool-managers \- Manajemen pengelola kolam.
6. **Manajemen Siswa:**
   1. GET /api/admin/students
   2. POST /api/admin/students/:id/renew \- _Quick Renew_ offline oleh Pengelola (Tambah sesi).
   3. PATCH /api/admin/students/:id/toggle-status \- _Soft delete_ manual.

## D. Absensi & Reschedule

- POST /api/admin/attendances \- Catat "Hadir"/"Tidak Hadir" (Akses: Pengelola Kolam).
- POST /api/portal/reschedules \- Pengajuan jadwal ulang pelatih. **Validasi:** Tolak _request_ jika pelatih memiliki studentId \!= null di hari tersebut.
- DELETE /api/portal/schedules/:id \- Hapus ketersediaan jadwal pelatih.

# 5\. Logika Bisnis & Middleware Krusial

## 1\. Middleware RBAC (Role-Based Access Control)

```js
// Middleware untuk proteksi endpoint CMS Harga/Sesi/Pengelola
const requireCentralAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN')
    return res.status(403).json({ error: 'Forbidden' });
  next();
};

// Middleware filter data otomatis untuk Pengelola Kolam
const poolManagerScope = (req, res, next) => {
  if (req.user.role === 'POOL_MANAGER') {
    req.query.locationId = req.user.locationId; // Memaksa filter lokasi database
  }
  next();
};
```

## 2\. Logika Soft Delete & Pemotongan Sesi Otomatis

Ketika Pengelola Kolam melakukan presensi "Hadir" melalui API POST /api/admin/attendances, _backend_ akan menjalankan Prisma Transaction:

- Menambah record tabel Attendance.
- Melakukan _decrement_ activeSessions pada profil siswa.
- Memeriksa activeSessions. Jika nilainya menjadi 0, otomatis atur isActive \= false (_Soft Delete_).

## 3\. Validasi Reschedule Pelatih

Saat pelatih memanggil POST /api/portal/reschedules, _backend_ melakukan kueri ke tabel Schedule. Jika ditemukan jadwal dengan hari tersebut dan studentId tidak _null_ (artinya pelatih punya murid), API wajib mengembalikan 400 Bad Request dengan pesan: _"Tidak dapat mengajukan jadwal ulang karena Anda memiliki jadwal mengajar dengan murid pada sesi ini."_

# 6\. Manajemen Penyimpanan File Latar Belakang (Multer)

Mengingat aplikasi belum menggunakan _cloud storage_ (seperti S3), seluruh gambar dan PDF disimpan di mesin server.

- **Struktur Direktori Server:** /public/uploads/receipts, /public/uploads/profiles, /public/uploads/cv.
- **Limit Multer:** Ditetapkan maksimal 5 file per _request_, masing-masing maksimal 10 MB (sesuai spesifikasi _Landing Page_).
- **Rute Publik:** Tambahkan app.use('/public', express.static('public')) agar _frontend_ bisa mengakses URL gambar.

# 7\. Risiko & Mitigasi Hardware

7. **Memory Leak Node.js:** Hindari menyimpan variabel _array_ berukuran masif di memori lokal saat me-_looping_ data dasbor. Gunakan kapabilitas kueri agregat _database_ Prisma secara langsung.
8. **Koneksi Database:** Batasi koneksi _pool_ Prisma (connection*limit=5) agar \_server database* lokal tidak macet.
9. **Local Storage:** Perhatikan kepenuhan _hard disk_ akibat file _upload_ lokal. Buat kesepakatan untuk menghapus bukti bayar kedaluwarsa setelah 1 tahun.
