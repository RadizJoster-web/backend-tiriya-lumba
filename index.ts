import express from 'express';
import cors from 'cors';

const app = express();
const port = 5000;

app.use(express.json());

app.use(
  cors({
    // Landing Page
    origin: [
      process.env.URL_LANDING_PAGE || 'http://localhost:3000',
      process.env.URL_DASHBOARD_PAGE || 'http://localhost:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
