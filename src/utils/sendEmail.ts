import nodemailer from 'nodemailer/lib/nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, // true untuk port 465, false untuk port lainnya
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOtpEmail = async (toEmail: string, otpCode: string) => {
  const mailOptions = {
    from: `"Tirya Lumba" <${process.env.EMAIL_USER}>`,
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
