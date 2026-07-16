import nodemailer from 'nodemailer';

const createTransporter = () => {
  // If SMTP configurations are omitted/mocked, return a dummy transporter
  if (
    !process.env.SMTP_HOST ||
    process.env.SMTP_USER === 'mock_email@gmail.com'
  ) {
    console.log('Using simulated local email log delivery service.');
    return {
      sendMail: async (options) => {
        console.log(`\n--- SIMULATED EMAIL DELIVERED ---`);
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Body:\n${options.text || options.html}`);
        console.log(`---------------------------------\n`);
        return { messageId: 'simulated-id-12345' };
      },
    };
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const transporter = createTransporter();

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"CareerOS AI Portal" <${process.env.SMTP_USER || 'noreply@careeros.com'}>`,
      to,
      subject,
      text,
      html,
    });
    return info;
  } catch (error) {
    console.error('Mail Service Delivery Failed:', error);
    // Silent fail to prevent crash, returning simulated placeholder
    return { messageId: 'failed-fallback-12345' };
  }
};
