import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates
  },
});

export async function sendSummaryEmail(emails: string[], summary: string) {
  try {
    // Check if email configuration is available
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('Email configuration is missing. Please set up SMTP settings in your .env.local file.');
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      bcc: emails.join(', '),
      subject: 'Meeting Summary - AI Generated',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">
            Meeting Summary
          </h2>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <pre style="white-space: pre-wrap; font-family: inherit; margin: 0;">${summary}</pre>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This summary was generated using AI-powered meeting notes summarizer.
          </p>
        </div>
      `,
      text: `Meeting Summary\n\n${summary}\n\nThis summary was generated using AI-powered meeting notes summarizer.`,
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Missing credentials')) {
        throw new Error('Email credentials are missing. Please check your SMTP settings.');
      } else if (error.message.includes('self-signed certificate')) {
        throw new Error('SSL certificate issue. Email service may be temporarily unavailable.');
      } else if (error.message.includes('ENOTFOUND')) {
        throw new Error('SMTP server not found. Please check your SMTP host setting.');
      } else if (error.message.includes('configuration is missing')) {
        throw error; // Re-throw our custom configuration error
      }
    }
    
    throw new Error('Failed to send email. Please check your email configuration.');
  }
}