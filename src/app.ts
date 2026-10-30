import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';
import rootRouter from './routes/routes';
import { corsConfig } from './utils/corsConfig';
import { globalRateLimit } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import { protectPrivateUploads } from './middlewares/protectUploads';

const app = express();

// Kepercayaan pada proxy layer (Vercel Serverless / Cloudflare CDN)
app.set('trust proxy', 1);

// Proteksi Header HTTP
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

// CORS diletakkan sebelum rate limiter dan routes
app.use(cors(corsConfig));

// Pasang Rate Limiter Global
app.use(globalRateLimit);

// Rute berkas sensitif & statis (kompatibilitas backward)
app.use('/public/uploads/payments', protectPrivateUploads('payments'));
app.use('/uploads/payments', protectPrivateUploads('payments'));
app.use('/public/uploads/cvs', protectPrivateUploads('cvs'));
app.use('/uploads/cvs', protectPrivateUploads('cvs'));
app.use('/public/uploads/profiles', express.static(path.join(__dirname, '../public/uploads/profiles')));
app.use('/uploads/profiles', express.static(path.join(__dirname, '../public/uploads/profiles')));
app.use('/public', express.static(path.join(__dirname, '../public')));

// Parser Request Body & Cookie
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routing Utama
app.use('/api', rootRouter);

// Handler Error Terpusat
app.use(errorHandler);

export default app;
export { app };
