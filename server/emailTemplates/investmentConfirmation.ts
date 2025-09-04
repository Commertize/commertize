import { format } from "date-fns";

interface InvestmentConfirmationData {
  propertyName: string;
  propertyLocation: string;
  shares: number;
  pricePerShare: number;
  totalInvestment: number;
  userEmail: string;
  timestamp?: string;
}

export function generateInvestmentConfirmationTemplate(data: InvestmentConfirmationData): string {
  const formattedDate = data.timestamp 
    ? format(new Date(data.timestamp), 'MMMM dd, yyyy')
    : format(new Date(), 'MMMM dd, yyyy');

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
          .investment-details {
            margin: 20px 0;
            background-color: white;
            padding: 15px;
            border-radius: 5px;
            border: 1px solid #e2e8f0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 0.875rem;
            color: #718096;
          }
          .highlight {
            color: #1a365d;
            font-weight: bold;
          }
          .contact-info {
            background-color: #f0f9ff;
            border-left: 4px solid #1a365d;
            padding: 15px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Thank You for Your Investment</h1>
          <p>${formattedDate}</p>
        </div>
        <div class="content">
          <p>Dear Investor,</p>
          
          <p>Thank you for your interest in investing with Commertize. We have received your investment request for the following property:</p>

          <div class="investment-details">
            <div class="detail-row">
              <span>Property:</span>
              <span class="highlight">${data.propertyName}</span>
            </div>
            <div class="detail-row">
              <span>Location:</span>
              <span>${data.propertyLocation}</span>
            </div>
            <div class="detail-row">
              <span>Number of Shares:</span>
              <span class="highlight">${data.shares}</span>
            </div>
            <div class="detail-row">
              <span>Price per Share:</span>
              <span>$${data.pricePerShare.toLocaleString()}</span>
            </div>
            <div class="detail-row">
              <span>Total Investment:</span>
              <span class="highlight">$${data.totalInvestment.toLocaleString()}</span>
            </div>
          </div>

          <div class="contact-info">
            <p><strong>Next Steps:</strong></p>
            <p>One of our investment specialists will contact you shortly to discuss your investment and guide you through the next steps of the process.</p>
            <p>If you have any immediate questions, please don't hesitate to reach out to our investor relations team at <a href="mailto:support@commertize.com">support@commertize.com</a></p>
          </div>

          <p>We appreciate your trust in Commertize for your real estate investment needs.</p>
          
          <p>Best regards,<br>The Commertize Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Commertize. All rights reserved.</p>
          <p>This email was sent to ${data.userEmail}</p>
        </div>
      </body>
    </html>
  `;
}
