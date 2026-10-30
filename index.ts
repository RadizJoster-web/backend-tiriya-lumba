import app from './src/app';

const port = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

export default app;
