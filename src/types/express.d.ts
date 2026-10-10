import { Role } from '@prisma/client';

// Cari tau buat apa??
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: Role;
        locationId?: string | null;
      };
    }
  }
}

export {}; // Menandakan file ini sebagai ES Module
