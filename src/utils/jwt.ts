import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  location?: string | null;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL: JWT_SECRET environment variable is not defined.');
  }

  const tokenExpiresIn: SignOptions['expiresIn'] =
    payload.role === 'ADMIN' || payload.role === 'POOL_MANAGER' ? '2h' : '30d';

  const tokenOptions: SignOptions = {
    expiresIn: tokenExpiresIn,
    algorithm: 'HS256',
  };

  const accessToken = jwt.sign(
    { userId: payload.userId, email: payload.email, role: payload.role },
    secret,
    tokenOptions,
  );

  return accessToken;
};
