import bcrypt from 'bcrypt';
import { prisma } from '../../config/prisma';
import { generateOtp } from '../../utils/generateOtp';
import { sendOtpEmail } from '../../utils/sendEmail';
import { registerSchema } from './authSchema';
import { AppError } from '../../utils/appError';
import { hashToken } from '../../utils/cryptoHelper';

export const registerService = async (body: unknown) => {
  const { fullName, email, password } = registerSchema.parse(body);

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, isVerified: true },
  });

  if (existingUser && existingUser.isVerified) {
    throw new AppError(
      400,
      'Email ini sudah terdaftar dan terverifikasi. Silakan langsung login.',
    );
  }

  const otpCode = generateOtp();
  const hashedOtp = hashToken(otpCode, email);
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const hashedPassword = await bcrypt.hash(password, 10);

  if (existingUser) {
    await prisma.user.update({
      where: { email },
      data: {
        fullName,
        password: hashedPassword,
        otpCode: hashedOtp,
        otpExpiresAt,
        isVerified: false,
      },
    });
  } else {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role: 'USER',
        otpCode: hashedOtp,
        otpExpiresAt,
        isVerified: false,
      },
    });
  }

  await sendOtpEmail(email, otpCode);

  return { email };
};
