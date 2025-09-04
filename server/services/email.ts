import nodemailer from 'nodemailer';
import { type Property } from '../types';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const createPropertySubmissionEmail = (property: Property) => {
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
          .benefits {
            background-color: #f9f9f9;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .benefit-item {
            margin-bottom: 10px;
            padding-left: 20px;
            position: relative;
          }
          .benefit-item:before {
            content: "•";
            color: #bf8e01;
            position: absolute;
            left: 0;
          }
          .property-details {
            margin: 20px 0;
            padding: 15px;
            border-left: 3px solid #bf8e01;
          }
          .footer {
            text-align: center;
            padding: 20px;
            font-size: 0.9em;
            color: #666;
          }
          .cta-button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #bf8e01;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Property Submission Confirmed</h1>
        </div>

        <div class="content">
          <p>Submit your commercial property and discover how we can help tokenize it for you!</p>

          <div class="property-details">
            <h3>Property Details:</h3>
            <p><strong>Name:</strong> ${property.name}</p>
            <p><strong>Location:</strong> ${property.location}</p>
            <p><strong>Type:</strong> ${property.propertyType}</p>
            <p><strong>Minimum Investment:</strong> $${property.minInvestment.toLocaleString()}</p>
          </div>

          <p>Our team at Commertize is prepared to transform your asset on our CRE Marketplace. 
          We proudly accept commercial properties from around the globe—including the U.S.—and 
          we're dedicated to helping sponsors leverage our broad network to raise capital.</p>

          <div class="benefits">
            <h3>Benefits of Property Tokenization:</h3>
            <div class="benefit-item">
              Property owners seeking to recapitalize don't have to relinquish full ownership, 
              as up to 90% of their equity can be offered to accredited investors.
            </div>
            <div class="benefit-item">
              Retain your General Partner status, maintain control over management decisions,
              and preserve your remaining interests.
            </div>
            <div class="benefit-item">
              Continue collecting management fees.
            </div>
          </div>

          <p>What happens next?</p>
          <ol>
            <li>Our team will review your property details</li>
            <li>We'll schedule a consultation to discuss tokenization strategy</li>
            <li>Upon approval, we'll begin the tokenization process</li>
            <li>Your property will be listed on our marketplace</li>
          </ol>

          <center>
            <a href="${process.env.APP_URL}/dashboard" class="cta-button">
              View Your Dashboard
            </a>
          </center>
        </div>

        <div class="footer">
          <p>If you have any questions, please contact our support team at support@commertize.com</p>
          <p>© ${new Date().getFullYear()} Commertize. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
};

export const sendPropertySubmissionEmail = async (
  to: string,
  property: Property
) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'notifications@commertize.com',
    to,
    subject: 'Property Submission Confirmation - Commertize',
    html: createPropertySubmissionEmail(property),
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};