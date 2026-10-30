import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_DOC_EXTS = ['.pdf'];

const storage = multer.memoryStorage();

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === 'cv') {
    if (ALLOWED_DOC_EXTS.includes(ext) && file.mimetype === 'application/pdf') {
      return cb(null, true);
    }
    return cb(new AppError(400, 'Format berkas CV harus berupa PDF asli (.pdf).'));
  }

  if (ALLOWED_IMAGE_EXTS.includes(ext)) {
    return cb(null, true);
  }

  return cb(
    new AppError(
      400,
      'Format berkas harus berupa gambar yang valid (JPG, JPEG, PNG, WEBP).',
    ),
  );
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Maksimal 10 MB (CV)
  },
});

function checkMagicBytes(buffer: Buffer, expectedType: 'image' | 'pdf'): boolean {
  if (!buffer || buffer.length < 12) return false;

  if (expectedType === 'pdf') {
    return buffer.toString('utf8', 0, 4) === '%PDF';
  }

  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;
  const isWebp =
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP';

  return isJpeg || isPng || isWebp;
}

export const validateMagicBytesMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const filesMap = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  if (!filesMap) return next();

  for (const fieldname of Object.keys(filesMap)) {
    const files = filesMap[fieldname] || [];
    const isCv = fieldname === 'cv';
    const expectedType = isCv ? 'pdf' : 'image';
    const maxSize = isCv ? 10 * 1024 * 1024 : 5 * 1024 * 1024;

    for (const file of files) {
      if (file.size > maxSize) {
        return next(
          new AppError(
            400,
            `Ukuran berkas '${file.originalname}' melebihi batas ${isCv ? '10 MB' : '5 MB'}.`,
          ),
        );
      }

      const isValid = checkMagicBytes(file.buffer, expectedType);
      if (!isValid) {
        return next(
          new AppError(
            400,
            `Berkas '${file.originalname}' tidak valid. Isi berkas tidak sesuai format asli yang diizinkan (Magic Bytes mismatch).`,
          ),
        );
      }
    }
  }

  next();
};
