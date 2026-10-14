import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/others';

    if (file.fieldname === 'paymentProof') {
      folder = 'uploads/payments';
    } else if (file.fieldname === 'cv') {
      folder = 'uploads/cvs';
    } else if (file.fieldname === 'profilePicture') {
      folder = 'uploads/profiles';
    }

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
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
  const allowedImages = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  const allowedDocs = ['application/pdf'];

  if (file.fieldname === 'cv') {
    // CV hanya menerima PDF
    if (allowedDocs.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format CV harus berupa PDF'));
    }
  } else {
    // Foto & Bukti Pembayaran hanya menerima Gambar
    if (allowedImages.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format file harus berupa gambar (JPG, JPEG, PNG, WEBP)'));
    }
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Maksimal 5 MB
  },
});
