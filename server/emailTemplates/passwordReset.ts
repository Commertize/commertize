export const generatePasswordResetTemplate = ({
  userName,
  userEmail,
  resetLink,
}: {
  userName: string;
  userEmail: string;
  resetLink: string;
}) => {
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
            background-color: #f6f3ec;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #ffffff;
            padding: 20px;
            border: 1px solid #e0e0e0;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #bf8e01;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 20px;
            font-size: 0.9em;
            color: #666;
          }
          .info {
            background-color: #f9f9f9;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            border-left: 3px solid #bf8e01;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://commertize.com/logo.png" alt="Commertize" style="max-width: 200px; margin-bottom: 20px;">
          <h1>Reset Your Password</h1>
        </div>

        <div class="content">
          <p>Hello${userName ? ` ${userName}` : ''},</p>

          <p>We received a request to reset your password for your Commertize account (${userEmail}). Click the button below to create a new password:</p>

          <center>
            <a href="${resetLink}" class="button" style="color: white;">
              Reset Password
            </a>
          </center>

          <div class="info">
            <p><strong>Important:</strong></p>
            <ul>
              <li>This password reset link will expire in 1 hour.</li>
              <li>If you didn't request this password reset, please ignore this email or contact our support team.</li>
              <li>For your security, please create a strong password that you haven't used before.</li>
            </ul>
          </div>

          <p>Best regards,<br>The Commertize Team</p>
        </div>

        <div class="footer">
          <p>If you have any questions, please contact our support team at support@commertize.com</p>
          <p>© ${new Date().getFullYear()} Commertize. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
};