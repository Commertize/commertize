import { format } from "date-fns";

interface InvestmentEmailData {
  investmentId: string;
  propertyName: string;
  propertyLocation: string;
  shares: number;
  pricePerShare: number;
  totalInvestment: number;
  userEmail: string;
  userPhone?: string; // Added phone number field
  timestamp?: string;
}

export function generateInvestmentEmailTemplate(data: InvestmentEmailData): string {
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
        </style>
      </head>
      <body>
        <div class="header">
          <h1>New Investment Notification</h1>
          <p>${formattedDate}</p>
        </div>
        <div class="content">
          <p>A new investment has been made on the Commertize platform.</p>

          <div class="investment-details">
            <div class="detail-row">
              <span>Investment ID:</span>
              <span class="highlight">${data.investmentId}</span>
            </div>
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
            <div class="detail-row">
              <span>Investor Email:</span>
              <span>${data.userEmail}</span>
            </div>
            ${data.userPhone ? `
            <div class="detail-row">
              <span>Investor Phone:</span>
              <span>${data.userPhone}</span>
            </div>
            ` : ''}
          </div>

          <p>Please review this investment and take appropriate action.</p>
        </div>
        <div class="footer">
          <p>This is an automated notification from Commertize Platform</p>
          <p>© ${new Date().getFullYear()} Commertize. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
}