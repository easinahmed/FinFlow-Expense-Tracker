import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

export const sendVerificationEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: `"FinFlow" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Your FinFlow Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #6366f1;">Welcome to FinFlow!</h2>
        <p>You have registered an account to FinFlow Expense Tracker.</p>
        <p>Here is your 6-digit verification code to activate your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="background-color: #f3f4f6; color: #111827; padding: 16px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px;">
            ${otp}
          </span>
        </div>
        <p>This verification code will expire in 24 hours.</p>
        <p>If you did not register for this account, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email: ', error);
    throw new Error('Failed to send verification email');
  }
};
