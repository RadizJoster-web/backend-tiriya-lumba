import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rootRouter from './src/routes/routes';
import path from 'path';

// Middleware import
import { globalRateLimit } from './src/middlewares/rateLimiter';
import { errorHandler } from './src/middlewares/errorHandler';
import { protectPrivateUploads } from './src/middlewares/protectUploads';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware Config
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Izinkan Frontend memuat aset gambar dari backend
  }),
);

// CORS configuration (Strict Whitelist: Mendukung localhost, 127.0.0.1, LAN development, dan domain produksi dari .env)
// CORS diletakkan SEBELUM rate limiter agar respons status 429 tetap membawa header Access-Control-Allow-Origin ke browser
app.use(
  cors({
    origin: (origin, callback) => {
      // Izinkan request tanpa origin (seperti curl, mobile app native, atau internal server-to-server)
      if (!origin) return callback(null, true);

      const urlLanding = process.env.URL_LANDING_PAGE;
      const urlDashboard = process.env.URL_DASHBOARD_PAGE;
      if (urlLanding && origin === urlLanding) return callback(null, true);
      if (urlDashboard && origin === urlDashboard) return callback(null, true);

      try {
        const parsed = new URL(origin);
        if (
          parsed.hostname === 'localhost' ||
          parsed.hostname === '127.0.0.1' ||
          parsed.hostname.startsWith('192.168.')
        ) {
          return callback(null, true);
        }
      } catch {
        // Abaikan parse error
      }

      return callback(new Error('Akses diblokir oleh kebijakan CORS (Origin Not Allowed)'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-revalidate-secret', 'Cache-Control'],
    credentials: true,
  }),
);

// Pasang Rate Limiter Global untuk seluruh request setelah CORS
app.use(globalRateLimit);

// Rute berkas sensitif (Wajib Autentikasi JWT: Header Bearer atau HttpOnly Cookie)
app.use('/public/uploads/payments', protectPrivateUploads('payments'));
app.use('/uploads/payments', protectPrivateUploads('payments'));
app.use('/public/uploads/cvs', protectPrivateUploads('cvs'));
app.use('/uploads/cvs', protectPrivateUploads('cvs'));

// Rute berkas publik non-sensitif (Foto Profil & Aset Publik)
app.use('/public/uploads/profiles', express.static(path.join(__dirname, 'public/uploads/profiles')));
app.use('/uploads/profiles', express.static(path.join(__dirname, 'public/uploads/profiles')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Body Parser JSON & URL-Encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api', rootRouter);

// Error Handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
