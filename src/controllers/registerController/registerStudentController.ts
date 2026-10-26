import { Request, Response, NextFunction } from 'express';
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
    const userId = (req as any).user.userId;

    // 2. Cek status user dan riwayat pendaftaran murid
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        registrations: {
          where: { type: 'NEW_STUDENT' },
          orderBy: { id: 'desc' },
          take: 1,
        },
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.',
      });
    }

    // Jika user sudah disetujui sebagai murid aktif (role STUDENT) dan masih memiliki sisa pertemuan (> 0)
    if (
      existingUser.role === 'STUDENT' &&
      (existingUser.studentProfile?.activeSessions ?? 0) > 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Email sudah terdaftar sebagai murid aktif dengan sisa pertemuan yang masih berjalan.',
      });
    }

    // Jika ada pendaftaran murid yang masih berstatus PENDING
    const latestStudentReg = existingUser.registrations?.[0];
    if (latestStudentReg && latestStudentReg.status === 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Pendaftaran Anda sedang diproses dan menunggu verifikasi admin.',
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
      // Update data user (nama, no HP, foto profil)
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          fullName: data.fullName,
          phone: data.phone,
          profilePictureUrl: data.profilePictureUrl || undefined,
        },
      });

      // Upsert StudentProfile (membuat baru atau memperbarui biodata jika pendaftaran sebelumnya ditolak)
      const studentProfile = await tx.studentProfile.upsert({
        where: { userId },
        create: {
          userId,
          fullName: data.fullName,
          birthPlace: data.birthPlace,
          birthDate: new Date(data.birthDate),
          gender: data.gender,
          address: data.address,
          schoolOrOffice: data.schoolOrOffice,
          tshirtSize: data.tshirtSize,
          activeSessions: 0, // Siswa baru 0 sesi sampai di-approve
        },
        update: {
          fullName: data.fullName,
          birthPlace: data.birthPlace,
          birthDate: new Date(data.birthDate),
          gender: data.gender,
          address: data.address,
          schoolOrOffice: data.schoolOrOffice,
          tshirtSize: data.tshirtSize,
        },
      });

      // Buat pendaftaran baru atau perbarui pendaftaran lama yang berstatus REJECTED
      let registration;
      if (latestStudentReg && latestStudentReg.status === 'REJECTED') {
        registration = await tx.registration.update({
          where: { id: latestStudentReg.id },
          data: {
            status: 'PENDING',
            rejectionReason: null,
            packageId: data.packageId,
            locationId: data.locationId,
            instructorId: data.instructorId,
            firstMeetDate: new Date(data.firstMeetDate),
            firstMeetSession: data.firstMeetSession,
            paymentMethod: data.paymentMethod,
            paymentProofUrl: data.paymentProofUrl,
          },
        });
      } else {
        registration = await tx.registration.create({
          data: {
            userId,
            type: 'NEW_STUDENT',
            status: 'PENDING',
            packageId: data.packageId,
            locationId: data.locationId,
            instructorId: data.instructorId,
            firstMeetDate: new Date(data.firstMeetDate),
            firstMeetSession: data.firstMeetSession,
            paymentMethod: data.paymentMethod,
            paymentProofUrl: data.paymentProofUrl,
          },
        });
      }

      return { user: updatedUser, studentProfile, registration };
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
