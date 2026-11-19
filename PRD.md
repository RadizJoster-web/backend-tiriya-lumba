# Backend Server PRD — PT Tirya Lumba REST API
## Dokumen Kebutuhan Produk & Arsitektur Teknis Server

> **Status:** Resmi — Versi 2.1  
> **Lingkungan:** Node.js, Express.js, TypeScript, Prisma ORM, TiDB Cloud (MySQL), Cloudflare R2  
> **Port Standar:** 5000 (Base URL: `/api`)

---

## 1. Arsitektur & Peran Layanan

Backend bertindak sebagai penyedia layanan terpusat untuk Landing Page (`client/landing-page`) dan Dasbor Manajemen (`client/dashboard`):
- Otorisasi berbasis RBAC (Role-Based Access Control: `SUPER_ADMIN`, `POOL_MANAGER`, `INSTRUCTOR`, `STUDENT`, `GUEST`).
- Manajemen transaksi atomik pendaftaran murid & pelatih.
- Logika alokasi pelatih dan anti-bentrok (Mutual Exclusion Privat vs Reguler).
- Upload berkas aman ke Cloudflare R2 Object Storage dengan verifikasi Magic Bytes.
- Reverse proxy streaming file privat ke browser.
- Klasifikasi HTTP Cache-Control berjenjang.

---

## 2. Skema Basis Data & Model Utama (Prisma)

### Model `Location` (Kolam Renang)
- `id` (String / UUID, Primary Key)
- `name` (String, Nama kolam)
- `address` (String, Alamat lengkap kolam)
- `areaId` (String, Relasi ke Area/Wilayah)
- `imageUrl` (String nullable, URL gambar/foto kolam renang di Cloudflare R2)
- `isCoachRegistrationOpen` (Boolean, Default `true`, Kontrol buka/tutup pendaftaran pelatih)

### Model `User` & `StudentProfile` / `InstructorProfile`
- `User`: Akun utama dengan email, password hash, role, dan `isActive`.
- `StudentProfile`: Menyimpan `activeSessions` (kuota sesi latihan), data wali, kontak, dan riwayat presensi.
- `InstructorProfile`: Menyimpan lisensi, pengalaman, shortBio, CV URL, dan jadwal mengajar (`InstructorSchedule`).

---

## 3. Klasifikasi HTTP Cache-Control

1. **Tier 1 (Public Static Master Data - CDN Cache):**
   - Endpoints: `GET /api/stats`, `GET /api/areas`, `GET /api/packages`, `GET /api/sessions`.
   - Header: `Cache-Control: public, max-age=0, s-maxage=3600, stale-while-revalidate=86400`.
2. **Tier 2 (Real-Time High-Contention Data - No Cache):**
   - Endpoints: `GET /api/locations` & `/:id`, `GET /api/instructor/available`, `GET /api/instructors/reschedule/status`.
   - Header: `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`, `Pragma: no-cache`, `Expires: 0`.
   - *Alasan:* Status `isCoachRegistrationOpen` dan ketersediaan kuota slot wajib real-time.
3. **Tier 3 (Data Operasional & Scoped Cabang):**
   - Endpoints: `GET /api/register/me`, `GET /api/register`, `GET /api/siswa`, `GET /api/attendances`, `GET /api/pool-managers`.
   - Header: `Cache-Control: private, no-store, no-cache, must-revalidate`.
4. **Tier 4 (Agregasi Dasbor):**
   - Endpoint: `GET /api/dashboard/summary`.
   - Header: `Cache-Control: private, max-age=30, stale-while-revalidate=60`.

---

## 4. Keamanan & Cloudflare R2 Object Storage

- **Batas Ukuran:** Maksimal 4.5 MB.
- **Middleware Verifikasi:** `validateMagicBytesMiddleware` memverifikasi header biner untuk format PNG, JPG, WebP, dan PDF.
- **Folder Bucket:**
  - `profiles/` : Pas foto murid dan pelatih.
  - `payments/` : Bukti pembayaran.
  - `cvs/`      : Dokumen CV / sertifikat pelatih (PDF).
  - `locations/`: Foto dokumentasi kolam renang mitra.
- **Reverse Proxy Stream:** `GET /api/files/:folder/:filename`.
