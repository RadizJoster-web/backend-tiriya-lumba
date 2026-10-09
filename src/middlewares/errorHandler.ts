import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error('[ERROR]: ', err);

  let statusCode = err.statusCode || 500;
  let errMessage = err.message || 'Terjadi kesalahan internal pada server';

  // Validasi Prisma Error
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      // Unique constraint failed (misal: email duplikat)
      case 'P2002':
        statusCode = 400;
        const target = (err.meta?.target as string[])?.join(', ') || 'data';
        errMessage = `Gagal! Field '${target}' sudah digunakan, Gunakan data lain`;
        break;
      // Record not found
      case 'P2025':
        statusCode = 404;
        errMessage = 'Data yang anda cari tidak ditemukan di database';
        break;
      // Foreign Key constraint failed
      case 'P2003':
        statusCode = 400;
        errMessage =
          'Gagal menyimpan data karena relasi data terkait tidak valid';
        break;
      default:
        statusCode = 400;
        errMessage = `Database Error: Kode ${err.code}`;
        break;
    }
  }

  // Validasi Zod Error
  if (err.name === 'ZodError') {
    statusCode = 400;
    errMessage = err.issues[0].message || 'Data input tidak valid';
    return res.status(statusCode).json({
      success: false,
      message: errMessage,
    });
  }
  8;

  // Balasan respon JSON yang konsisten ke Klien
  return res.status(statusCode).json({
    success: false,
    errMessage,
    // Sembunyikan stack trace jika aplikasi berada di lingkungan produksi
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
