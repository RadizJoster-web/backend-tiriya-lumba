import bcrypt from 'bcrypt';
import { prisma } from '../../config/prisma';
import { generateOtp } from '../../utils/generateOtp';
import { sendOtpEmail } from '../../utils/sendEmail';
import { registerSchema } from './authSchema';

export const registerService = async (body: unknown) => {
  const { fullName, email, password } = registerSchema.parse(body);

  const otpCode = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      otpCode,
      otpExpiresAt,
      isVerified: false,
    },
    create: {
      email,
      password: hashedPassword,
      fullName,
      role: 'USER',
      otpCode,
      otpExpiresAt,
      isVerified: false,
    },
  });

  await sendOtpEmail(email, otpCode);

  return { email };
};
