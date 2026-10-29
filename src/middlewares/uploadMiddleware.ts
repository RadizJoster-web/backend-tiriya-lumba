import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_DOC_EXTS = ['.pdf'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'public/uploads';

    if (file.fieldname === 'paymentProof') {
      folder = 'public/uploads/payments';
    } else if (file.fieldname === 'cv') {
      folder = 'public/uploads/cvs';
    } else if (file.fieldname === 'profilePicture' || file.fieldname === 'profilePictures') {
      folder = 'public/uploads/profiles';
    }

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileExt = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${fileExt}`);
  },
});

const fileFilter = (
  req: any,
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
    fileSize: 5 * 1024 * 1024, // Maksimal 5 MB
  },
});

/**
 * Validasi Magic Bytes setelah file tersimpan di disk.
 * Jika isi berkas tidak cocok dengan ekstensi/mimetype, file langsung dihapus.
 */
function checkMagicBytes(filePath: string, expectedType: 'image' | 'pdf'): boolean {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(16);
    fs.readSync(fd, buffer, 0, 16, 0);
    fs.closeSync(fd);

    if (expectedType === 'pdf') {
      // PDF: %PDF- (25 50 44 46 2D)
      return buffer.toString('utf8', 0, 4) === '%PDF';
    }

    // JPEG: FF D8 FF
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    const isPng =
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47;
    // WEBP: RIFF....WEBP
    const isWebp =
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP';

    return isJpeg || isPng || isWebp;
  } catch {
    return false;
  }
}

export const validateMagicBytesMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const filesMap = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  if (!filesMap) return next();

  for (const fieldname of Object.keys(filesMap)) {
    const files = filesMap[fieldname] || [];
    const expectedType = fieldname === 'cv' ? 'pdf' : 'image';

    for (const file of files) {
      // Normalisasi path agar selalu forward slash
      file.path = file.path.replace(/\\/g, '/');

      const isValid = checkMagicBytes(file.path, expectedType);
      if (!isValid) {
        // Hapus file berbahaya dari disk
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch {
          // ignore
        }
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
