import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporterInstance: ReturnType<typeof nodemailer.createTransport> | null =
  null;

const getTransporter = () => {
  if (transporterInstance) return transporterInstance;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  transporterInstance = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  return transporterInstance;
};

export const sendOtpEmail = async (toEmail: string, otpCode: string) => {
  const transporter = getTransporter();
  const fromEmail =
    process.env.EMAIL_USER || process.env.SMTP_USER || 'noreply@tiryalumba.com';

  const mailOptions = {
    from: `"Tirya Lumba" <${fromEmail}>`,
    to: toEmail,
    subject: 'Kode Verifikasi OTP - Tirya Lumba',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2>Verifikasi Akun Tirya Lumba</h2>
        <p>Terima kasih telah mendaftar. Gunakan kode OTP di bawah ini untuk memverifikasi akun Anda:</p>
        <h1 style="color: #0284c7; letter-spacing: 4px;">${otpCode}</h1>
        <p>Kode ini berlaku selama <strong>5 menit</strong>. Jangan berikan kode ini kepada siapapun.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
