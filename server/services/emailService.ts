import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Nodemailer transporter for Zoho Mail (existing)
const transporter = nodemailer.createTransport({
  host: process.env.ZOHO_SMTP_HOST,
  port: Number(process.env.ZOHO_SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.ZOHO_SMTP_USER,
    pass: process.env.ZOHO_SMTP_PASSWORD,
  },
  logger: false,
  debug: false
});

export interface EmailParams {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  // Use SendGrid if available, otherwise fall back to Nodemailer
  if (process.env.SENDGRID_API_KEY) {
    return sendWithSendGrid(params);
  } else {
    return sendWithNodemailer(params);
  }
}

async function sendWithSendGrid(params: EmailParams): Promise<boolean> {
  try {
    const msg = {
      to: params.to,
      from: params.from || process.env.ZOHO_SMTP_USER || 'noreply@commertize.com',
      subject: params.subject,
      text: params.text,
      html: params.html,
      attachments: params.attachments?.map(att => ({
        filename: att.filename,
        content: Buffer.from(att.content).toString('base64'),
        type: att.contentType || 'application/octet-stream',
        disposition: 'attachment'
      }))
    };

    await sgMail.send(msg);
    console.log(`Email sent successfully via SendGrid to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    // Fall back to Nodemailer if SendGrid fails
    return sendWithNodemailer(params);
  }
}

async function sendWithNodemailer(params: EmailParams): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: params.from || process.env.ZOHO_SMTP_USER || 'noreply@commertize.com',
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
      attachments: params.attachments
    });

    console.log(`Email sent successfully via Nodemailer to ${params.to}:`, info.messageId);
    return true;
  } catch (error) {
    console.error('Nodemailer email error:', error);
    return false;
  }
}

// Test email connectivity
export async function testEmailService(): Promise<{
  sendgrid: boolean;
  nodemailer: boolean;
  activeService: 'sendgrid' | 'nodemailer' | 'none';
}> {
  const result = {
    sendgrid: false,
    nodemailer: false,
    activeService: 'none' as 'sendgrid' | 'nodemailer' | 'none'
  };

  // Test SendGrid
  if (process.env.SENDGRID_API_KEY) {
    try {
      // SendGrid doesn't have a simple ping, so we'll just check if the API key is set
      result.sendgrid = true;
      result.activeService = 'sendgrid';
    } catch (error) {
      console.error('SendGrid test failed:', error);
    }
  }

  // Test Nodemailer
  try {
    await transporter.verify();
    result.nodemailer = true;
    if (result.activeService === 'none') {
      result.activeService = 'nodemailer';
    }
  } catch (error) {
    console.error('Nodemailer test failed:', error);
  }

  return result;
}