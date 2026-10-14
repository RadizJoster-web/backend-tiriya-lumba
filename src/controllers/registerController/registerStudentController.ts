import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../../config/prisma';
import { registerStudentSchema } from './registerSchema';

export const registerStudentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Validasi JSON dari frontend
    const data = registerStudentSchema.parse(req.body);
    const userEmail = (req as any).user.email;

    // 2. Cek duplikasi email (Jika sudah terdaftar sebagai murid aktif, tolak)
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { studentProfile: true },
    });

    if (existingUser && existingUser.studentProfile) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar sebagai murid aktif.',
      });
    }

    // 3. Validasi ID relasi (Location, Package, Instructor)
    const [location, packageData, instructor] = await Promise.all([
      prisma.location.findUnique({ where: { id: data.locationId } }),
      prisma.package.findUnique({ where: { id: data.packageId } }),
      prisma.user.findFirst({
        where: { id: data.instructorId, role: 'INSTRUCTOR' },
      }),
    ]);

    if (!location)
      return res
        .status(404)
        .json({ success: false, message: 'Lokasi tidak ditemukan' });
    if (!packageData)
      return res
        .status(404)
        .json({ success: false, message: 'Paket tidak ditemukan' });
    if (!instructor)
      return res
        .status(404)
        .json({ success: false, message: 'Instruktur tidak ditemukan' });

    // 4. Jalankan Transaksi Database (Atomic)
    const result = await prisma.$transaction(async (tx) => {
      const user = existingUser;

      if (!user) {
        throw new Error('User tidak ditemukan untuk pendaftaran murid.');
      }

      // Buat StudentProfile (Data akademik/kesiswaan)
      const studentProfile = await tx.studentProfile.create({
        data: {
          userId: user.id,
          fullName: data.fullName,
          birthPlace: data.birthPlace,
          birthDate: new Date(data.birthDate),
          gender: data.gender,
          address: data.address,
          schoolOrOffice: data.schoolOrOffice,
          tshirtSize: data.tshirtSize,
          activeSessions: 0, // Siswa baru 0 sesi sampai di-approve
        },
      });

      // Buat Record Pendaftaran / Booking
      const registration = await tx.registration.create({
        data: {
          userId: user.id,
          type: 'NEW_STUDENT',
          status: 'PENDING',
          packageId: data.packageId,
          locationId: data.locationId,
          instructorId: data.instructorId,
          firstMeetDate: new Date(data.firstMeetDate),
          firstMeetSession: data.firstMeetSession,
          paymentMethod: data.paymentMethod,
          paymentProofUrl: data.paymentProofUrl,
          photoUrl: data.profilePictureUrl || null,
        },
      });

      return { user, studentProfile, registration };
    });

    // 5. Kembalikan Response
    return res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil. Silakan tunggu verifikasi admin.',
      data: {
        registrationId: result.registration.id,
        userId: result.user.id,
        status: result.registration.status,
      },
    });
  } catch (error) {
    next(error);
  }
};
