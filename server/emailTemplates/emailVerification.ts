import { format } from "date-fns";

interface EmailVerificationData {
  userName: string;
  userEmail: string;
  verificationLink: string;
}

export function generateEmailVerificationTemplate(data: EmailVerificationData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #1a365d;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #f8fafc;
            padding: 20px;
            border: 1px solid #e2e8f0;
            border-radius: 0 0 5px 5px;
          }
          .button {
            display: inline-block;
            background-color: #1a365d;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 0.875rem;
            color: #718096;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to Commertize</h1>
        </div>
        <div class="content">
          <p>Hello ${data.userName},</p>
          
          <p>Welcome to Commertize. Please verify your email address by clicking the link below:</p>
          
          <p style="text-align: center;">
            <a href="${data.verificationLink}" class="button">
              Verify Email Address
            </a>
          </p>
          
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p style="word-break: break-all;">${data.verificationLink}</p>
          
          <p>This link will expire in 24 hours for security reasons.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Commertize. All rights reserved.</p>
          <p>This email was sent to ${data.userEmail}</p>
        </div>
      </body>
    </html>
  `;
}
