import express, { response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rootRouter from './src/routes/routes';

// Middleware import
import { globalRateLimit } from './src/middlewares/rateLimiter';
import { errorHandler } from './src/middlewares/errorHandler';
import path from 'path';

dotenv.config();

const app = express();
const port = 5000;

// Middleware Config
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Izinkan Frontend memuat aset gambar dari backend
  }),
);
// app.use(globalRateLimit);

app.use('/public', express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// CORS configuration (Mendukung localhost, 127.0.0.1, dan domain dari .env)
app.use(
  cors({
    origin: (origin, callback) => {
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

      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// Body Parser JSON & URL-Encoded (Membuat server bisa menerima req json dan url)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api', rootRouter);

// Error Handdler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
