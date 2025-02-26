import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendVerificationEmail = async (to: string, verificationLink: string) => {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject: 'Confirme seu email - Sistema de Votação Oscar',
      html: `
        <h2>Bem-vindo ao Sistema de Votação do Oscar!</h2>
        <p>Por favor, clique no link abaixo para confirmar seu email:</p>
        <a href="${verificationLink}">Confirmar Email</a>
        <p>Se você não solicitou esta verificação, ignore este email.</p>
      `,
    });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw new Error('Falha ao enviar email de verificação');
  }
};