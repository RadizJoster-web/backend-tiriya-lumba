import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import multer from 'multer';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error('[ERROR]: ', err);

  let statusCode = err.statusCode || err.status || 500;
  let errMessage = err.message || 'Terjadi kesalahan internal pada server';

  // Handle Multer errors (misal: LIMIT_FILE_SIZE)
  if (err instanceof multer.MulterError || err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      statusCode = 413;
      errMessage = 'Ukuran berkas terlalu besar. Batas maksimal yang diizinkan adalah 4.5 MB.';
    } else {
      statusCode = 400;
      errMessage = `Terjadi kendala pada berkas unggahan: ${err.message}`;
    }
  }

  // Handle HTTP 413 Content Too Large
  if (err.status === 413 || err.statusCode === 413 || err.type === 'entity.too.large') {
    statusCode = 413;
    errMessage = 'Ukuran berkas atau konten yang dikirimkan terlalu besar (maksimal 4.5 MB).';
  }

  // Validasi Prisma Error
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        statusCode = 409;
        const target = (err.meta?.target as string[])?.join(', ') || 'data';
        errMessage = `Gagal! Field '${target}' sudah digunakan, gunakan data lain`;
        break;
      case 'P2025':
        statusCode = 404;
        errMessage = 'Data yang anda cari tidak ditemukan di database';
        break;
      case 'P2003':
        statusCode = 400;
        errMessage = 'Gagal menyimpan data karena relasi data terkait tidak valid';
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
    errMessage = err.issues?.[0]?.message || 'Data input tidak valid';
  }

  // Balasan respon JSON yang konsisten ke klien
  return res.status(statusCode).json({
    success: false,
    message: errMessage,
    errMessage,
  });
};
