import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding data awal...');

  // 1. Enkripsi password admin sesuai standar keamanan autentikasi
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // 2. Gunakan upsert agar script aman dijalankan berulang kali tanpa error duplicate email
  const admin = await prisma.user.upsert({
    where: { email: 'tiryalumba@gmail.com' },
    update: {}, // Jika email sudah ada, tidak melakukan perubahan
    create: {
      fullName: 'Super Admin Tiriya Lumba',
      email: 'tiryalumba@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '081234567890',
      isVerified: true, 
      isActive: true,
    },
  });

  console.log(`✅ Admin berhasil dibuat/diverifikasi: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error('❌ Gagal melakukan seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
