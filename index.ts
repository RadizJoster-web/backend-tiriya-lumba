import express, { response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rootRouter from './src/routes/routes';

// Middleware import
import { globalRateLimit } from './src/middlewares/rateLimiter';
import { errorHandler } from './src/middlewares/errorHandler';

dotenv.config();

const app = express();
const port = 5000;

// Middleware Config
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Izinkan Frontend memuat aset gambar dari backend
  }),
);
app.use(globalRateLimit);

app.use('/public', express.static('public'));

// CORS configuration
app.use(
  cors({
    origin: [
      process.env.URL_LANDING_PAGE || 'http://localhost:3000',
      process.env.URL_DASHBOARD_PAGE || 'http://localhost:5173',
    ],
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
