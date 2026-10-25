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

export const sendResetPasswordEmail = async (
  toEmail: string,
  resetUrl: string,
) => {
  const transporter = getTransporter();
  const fromEmail =
    process.env.EMAIL_USER || process.env.SMTP_USER || 'noreply@tiryalumba.com';

  const mailOptions = {
    from: `"Tirya Lumba" <${fromEmail}>`,
    to: toEmail,
    subject: 'Atur Ulang Kata Sandi Akun - Tirya Lumba',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #1d3557; margin-bottom: 8px;">Atur Ulang Kata Sandi</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Halo, kami menerima permintaan untuk mengatur ulang kata sandi akun Tirya Lumba Anda. Klik tombol di bawah ini untuk melanjutkan:
        </p>
        <div style="margin: 24px 0; text-align: center;">
          <a href="${resetUrl}" style="background-color: #0077b6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-weight: bold; font-size: 14px; display: inline-block;">
            Atur Ulang Kata Sandi
          </a>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
          Tautan ini hanya berlaku selama <strong>15 menit</strong>. Jika Anda tidak meminta pengaturan ulang kata sandi, abaikan email ini dan akun Anda tetap aman.
        </p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 11px;">
          Jika tombol di atas tidak berfungsi, salin dan tempel tautan berikut ke peramban Anda:<br />
          <a href="${resetUrl}" style="color: #00b4d8;">${resetUrl}</a>
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
