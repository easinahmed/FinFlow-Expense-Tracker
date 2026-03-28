import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verificationLink = `${appUrl}/api/auth/verify?token=${token}`;

  const mailOptions = {
    from: `"FinFlow" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Verify your email address - FinFlow',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to FinFlow!</h2>
        <p>You have registered an account to FinFlow Expense Tracker.</p>
        <p>Please click the button below to verify your email address and activate your account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
        </div>
        <p>Or you can copy and paste this link into your browser:</p>
        <p><a href="${verificationLink}">${verificationLink}</a></p>
        <p>This verification link will expire in 24 hours.</p>
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
