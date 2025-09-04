export interface EmailTemplateParams {
  recipientName: string;
  recipientEmail: string;
  recipientCompany?: string;
}

export interface SupportResponseParams {
  recipientName: string;
  ticketId: string;
  originalSubject: string;
}

export function generateInvestmentEmailTemplate(params: EmailTemplateParams): string {
  const { recipientName, recipientCompany } = params;
  const currentYear = new Date().getFullYear();
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background-color: #f8f9fa;
          }
          .container {
            background-color: #ffffff;
            margin: 20px auto;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #bf8e01 0%, #f4d03f 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content {
            padding: 30px;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #bf8e01 0%, #d4a524 100%);
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
          }
          .property-highlight {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #bf8e01;
          }
          .benefits {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
          }
          .benefit-item {
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 8px;
            text-align: center;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
            border-top: 1px solid #e0e0e0;
          }
          .stats {
            display: flex;
            justify-content: space-around;
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .stat-item {
            text-align: center;
          }
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #bf8e01;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏢 Exclusive Investment Opportunity</h1>
            <p>Access Premium Commercial Real Estate with Just $1,000</p>
          </div>

          <div class="content">
            <p>Dear ${recipientName},</p>

            <p>I hope this message finds you well. My name is Cameron Razaghi, Founder & CEO of Commertize, and I'm reaching out because we've identified you as someone who would benefit from our exclusive commercial real estate tokenization platform.</p>

            <div class="property-highlight">
              <h3>🎯 Current Featured Opportunity</h3>
              <p><strong>Gateway Logistics Center</strong> - Premium Industrial Property</p>
              <div class="stats">
                <div class="stat-item">
                  <div class="stat-number">9.2%</div>
                  <div>Target Yield</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">$1,000</div>
                  <div>Min. Investment</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">87%</div>
                  <div>Already Funded</div>
                </div>
              </div>
              <p>This institutional-grade property offers stable cash flow with Fortune 500 tenants and long-term leases.</p>
            </div>

            <h3>Why Commertize?</h3>
            <div class="benefits">
              <div class="benefit-item">
                <h4>🔐 Blockchain Security</h4>
                <p>Your ownership is secured by smart contracts with full transparency</p>
              </div>
              <div class="benefit-item">
                <h4>💰 Monthly Distributions</h4>
                <p>Receive rental income directly to your wallet every month</p>
              </div>
              <div class="benefit-item">
                <h4>🌐 24/7 Liquidity</h4>
                <p>Trade your property tokens anytime on our marketplace</p>
              </div>
              <div class="benefit-item">
                <h4>📊 Professional Vetting</h4>
                <p>Every property analyzed by our expert team</p>
              </div>
            </div>

            <p><strong>What makes this exclusive?</strong></p>
            <ul>
              <li>Access to institutional-grade properties previously requiring $10M+ minimums</li>
              <li>Fractional ownership starting at just $1,000</li>
              <li>Direct property tokens (not REIT shares)</li>
              <li>Real-time portfolio tracking and analytics</li>
              <li>No management fees for early adopters</li>
            </ul>

            ${recipientCompany ? `<p>Given ${recipientCompany}'s involvement in the investment space, I believe you'll appreciate the transparency and efficiency that blockchain technology brings to commercial real estate investing.</p>` : ''}

            <div style="text-align: center;">
              <a href="https://commertize.com/invest?utm_source=email&utm_campaign=investment" class="cta-button">
                View Investment Opportunities →
              </a>
            </div>

            <p><strong>Limited Time Offer:</strong> The first 50 investors get lifetime zero management fees and early access to our premium property pipeline.</p>

            <p>I'd love to show you exactly how this works with a personalized 15-minute demo. You can see the platform, explore properties, and ask any questions you have.</p>

            <p>Are you available for a brief call this week? I can work around your schedule.</p>

            <p>Best regards,<br>
            <strong>Cameron Razaghi</strong><br>
            Founder & CEO, Commertize<br>
            📞 <a href="tel:+19498688863">+1 (949) 868-8863</a><br>
            📧 <a href="mailto:cameron@commertize.com">cameron@commertize.com</a></p>

            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 30px;">
              <p style="margin: 0; font-size: 14px; text-align: center;"><strong>P.S.</strong> We're launching our mobile app next month. Early platform users get exclusive beta access and additional benefits.</p>
            </div>
          </div>

          <div class="footer">
            <p>© ${currentYear} Commertize. All rights reserved.</p>
            <p>This email contains information about investment opportunities. Please invest responsibly.</p>
            <p><a href="https://commertize.com/unsubscribe" style="color: #bf8e01;">Unsubscribe</a> | <a href="https://commertize.com/privacy" style="color: #bf8e01;">Privacy Policy</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function generatePartnershipEmailTemplate(params: EmailTemplateParams): string {
  const { recipientName, recipientCompany } = params;
  const currentYear = new Date().getFullYear();
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background-color: #f8f9fa;
          }
          .container {
            background-color: #ffffff;
            margin: 20px auto;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content {
            padding: 30px;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
          }
          .case-study {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #3498db;
          }
          .benefits {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
          }
          .benefit-item {
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 8px;
            text-align: center;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
            border-top: 1px solid #e0e0e0;
          }
          .stats {
            display: flex;
            justify-content: space-around;
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .stat-item {
            text-align: center;
          }
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #3498db;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🤝 Strategic Partnership Opportunity</h1>
            <p>Tokenize Your Commercial Properties & Access Global Investors</p>
          </div>

          <div class="content">
            <p>Dear ${recipientName},</p>

            <p>I hope this email finds you well. I'm Cameron Razaghi, Founder & CEO of Commertize, and I'm reaching out to discuss an exciting partnership opportunity that could transform how ${recipientCompany || 'your organization'} raises capital and manages commercial real estate investments.</p>

            <div class="case-study">
              <h3>🎯 Recent Success Story</h3>
              <p><strong>Regional Office Complex Partner</strong></p>
              <div class="stats">
                <div class="stat-item">
                  <div class="stat-number">$2.3M</div>
                  <div>Raised in 45 Days</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">450+</div>
                  <div>Individual Investors</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">90%</div>
                  <div>Owner Retained</div>
                </div>
              </div>
              <p>Property sponsor maintained full operational control while accessing our network of 10,000+ accredited investors.</p>
            </div>

            <h3>Partnership Benefits for ${recipientCompany || 'Property Sponsors'}</h3>
            <div class="benefits">
              <div class="benefit-item">
                <h4>🌍 Global Investor Access</h4>
                <p>Tap into our network of 10,000+ accredited investors worldwide</p>
              </div>
              <div class="benefit-item">
                <h4>🔧 Maintain Control</h4>
                <p>Keep 90%+ ownership and full operational control</p>
              </div>
              <div class="benefit-item">
                <h4>💡 Zero Upfront Costs</h4>
                <p>We only get paid when you successfully raise capital</p>
              </div>
              <div class="benefit-item">
                <h4>⚡ Fast Deployment</h4>
                <p>Token launches typically in 30-45 days</p>
              </div>
            </div>

            <p><strong>How Our Partnership Works:</strong></p>
            <ol>
              <li><strong>Property Analysis:</strong> We evaluate your asset and create a comprehensive tokenization strategy</li>
              <li><strong>Smart Contract Deployment:</strong> Our team handles all blockchain and legal compliance</li>
              <li><strong>Investor Marketing:</strong> Professional marketing campaign to our investor network</li>
              <li><strong>Capital Distribution:</strong> Funds transferred directly to you as tokens are purchased</li>
              <li><strong>Ongoing Support:</strong> We manage investor relations and token trading</li>
            </ol>

            <h3>Ideal Partnership Properties:</h3>
            <ul>
              <li>Commercial value: $2M - $50M</li>
              <li>Stabilized properties with strong NOI</li>
              <li>Office, Industrial, Retail, or Multi-family</li>
              <li>Looking for recapitalization or expansion capital</li>
              <li>Sponsors wanting to maintain operational control</li>
            </ul>

            <p><strong>Our Fee Structure:</strong> No upfront costs. We typically charge 3-5% of capital raised plus ongoing management fees. You keep all operational control and management fees from your property.</p>

            <div style="text-align: center;">
              <a href="https://commertize.com/partners?utm_source=email&utm_campaign=partnership" class="cta-button">
                Schedule Partnership Discussion →
              </a>
            </div>

            <p>I'd love to provide a free tokenization analysis for one of your properties to show you exactly how this would work and what kind of investor interest you might see.</p>

            <p>Would you be available for a 30-minute call this week to discuss how Commertize could help ${recipientCompany || 'your organization'} access new capital sources?</p>

            <p>Best regards,<br>
            <strong>Cameron Razaghi</strong><br>
            Founder & CEO, Commertize<br>
            📞 <a href="tel:+19498688863">+1 (949) 868-8863</a><br>
            📧 <a href="mailto:cameron@commertize.com">cameron@commertize.com</a></p>

            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 30px;">
              <p style="margin: 0; font-size: 14px; text-align: center;"><strong>P.S.</strong> We're currently prioritizing partnerships with select sponsors. I can provide references from our current partners who would be happy to share their experience.</p>
            </div>
          </div>

          <div class="footer">
            <p>© ${currentYear} Commertize. All rights reserved.</p>
            <p>This email contains information about business partnerships and investment opportunities.</p>
            <p><a href="https://commertize.com/unsubscribe" style="color: #3498db;">Unsubscribe</a> | <a href="https://commertize.com/privacy" style="color: #3498db;">Privacy Policy</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function generateDemoEmailTemplate(params: EmailTemplateParams): string {
  const { recipientName, recipientCompany } = params;
  const currentYear = new Date().getFullYear();
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background-color: #f8f9fa;
          }
          .container {
            background-color: #ffffff;
            margin: 20px auto;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content {
            padding: 30px;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
          }
          .demo-features {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #27ae60;
          }
          .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
          }
          .feature-item {
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 8px;
            text-align: center;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
            border-top: 1px solid #e0e0e0;
          }
          .testimonial {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            font-style: italic;
            border-left: 4px solid #27ae60;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📺 See Commertize in Action</h1>
            <p>Schedule Your Personalized Platform Demo</p>
          </div>

          <div class="content">
            <p>Dear ${recipientName},</p>

            <p>Thank you for your interest in Commertize! I'm Cameron Razaghi, and I'd love to show you exactly how our commercial real estate tokenization platform works.</p>

            <p>Rather than just reading about it, let me give you a personalized walkthrough where you can see:</p>

            <div class="demo-features">
              <h3>🎥 What You'll See in the Demo</h3>
              <ul>
                <li><strong>Live Property Portfolio:</strong> Browse our current investment opportunities with real financial data</li>
                <li><strong>Investment Process:</strong> Watch how easy it is to invest $1,000+ in premium commercial properties</li>
                <li><strong>Blockchain Security:</strong> See how your ownership is secured by smart contracts</li>
                <li><strong>Monthly Distributions:</strong> View how rental income flows directly to your wallet</li>
                <li><strong>Trading Platform:</strong> Experience our 24/7 liquidity marketplace</li>
                <li><strong>Mobile App:</strong> Preview our upcoming iOS/Android apps</li>
              </ul>
            </div>

            <div class="features">
              <div class="feature-item">
                <h4>⏱️ Quick & Easy</h4>
                <p>Just 15-20 minutes of your time</p>
              </div>
              <div class="feature-item">
                <h4>🎯 Personalized</h4>
                <p>Tailored to your investment interests</p>
              </div>
              <div class="feature-item">
                <h4>📱 Any Device</h4>
                <p>Screen share via phone, tablet, or computer</p>
              </div>
              <div class="feature-item">
                <h4>❓ Ask Questions</h4>
                <p>Get answers from our founding team</p>
              </div>
            </div>

            <div class="testimonial">
              <p>"The demo completely changed my understanding of how accessible commercial real estate investing could be. I invested $5,000 the same day and now have exposure to three different properties." </p>
              <p><strong>— Sarah M., Current Investor</strong></p>
            </div>

            ${recipientCompany ? `<p>Given ${recipientCompany}'s background, I think you'll particularly appreciate how we've streamlined the traditionally complex world of commercial real estate investing while maintaining institutional-grade security and returns.</p>` : ''}

            <div style="text-align: center;">
              <a href="https://calendly.com/cameron-commertize/demo" class="cta-button">
                Schedule My Demo →
              </a>
            </div>

            <p><strong>Demo Scheduling Options:</strong></p>
            <ul>
              <li>🌅 Morning slots: 9 AM - 12 PM PT</li>
              <li>🌆 Afternoon slots: 1 PM - 5 PM PT</li>
              <li>🌙 Evening slots: 6 PM - 8 PM PT</li>
              <li>📅 Available Monday through Friday</li>
            </ul>

            <p><strong>Can't make it live?</strong> I can also record a personalized demo video just for you and send it over within 24 hours.</p>

            <p><strong>Bonus:</strong> Demo attendees get early access to our next property launch and a $50 platform credit for their first investment.</p>

            <p>Simply click the link above to choose a time that works for you, or reply to this email with your preferred time and I'll send you a calendar invite.</p>

            <p>Looking forward to showing you what we've built!</p>

            <p>Best regards,<br>
            <strong>Cameron Razaghi</strong><br>
            Founder & CEO, Commertize<br>
            📞 <a href="tel:+19498688863">+1 (949) 868-8863</a><br>
            📧 <a href="mailto:cameron@commertize.com">cameron@commertize.com</a></p>

            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 30px;">
              <p style="margin: 0; font-size: 14px; text-align: center;"><strong>P.S.</strong> If you're curious about a specific property type or investment amount, let me know and I'll make sure to show you relevant examples during our demo.</p>
            </div>
          </div>

          <div class="footer">
            <p>© ${currentYear} Commertize. All rights reserved.</p>
            <p>This email contains information about investment opportunities and platform demonstrations.</p>
            <p><a href="https://commertize.com/unsubscribe" style="color: #27ae60;">Unsubscribe</a> | <a href="https://commertize.com/privacy" style="color: #27ae60;">Privacy Policy</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function generateSupportResponseTemplate(params: SupportResponseParams): string {
  const { recipientName, ticketId, originalSubject } = params;
  const currentYear = new Date().getFullYear();
  const shortTicketId = ticketId.slice(-8);
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background-color: #f8f9fa;
          }
          .container {
            background-color: #ffffff;
            margin: 20px auto;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%);
            color: white;
            padding: 20px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
          }
          .content {
            padding: 30px;
          }
          .ticket-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #8e44ad;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
            border-top: 1px solid #e0e0e0;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 15px 0;
            text-align: center;
          }
          .support-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
          }
          .support-item {
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 8px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎫 Support Ticket Received</h1>
            <p>We're on it! Your request is being processed</p>
          </div>

          <div class="content">
            <p>Hello ${recipientName},</p>

            <p>Thank you for contacting Commertize support! We've received your message and wanted to confirm that we're working on your request.</p>

            <div class="ticket-info">
              <h3>📋 Ticket Details</h3>
              <p><strong>Ticket ID:</strong> #${shortTicketId}</p>
              <p><strong>Subject:</strong> ${originalSubject}</p>
              <p><strong>Status:</strong> Open</p>
              <p><strong>Priority:</strong> Normal</p>
              <p><strong>Created:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            </div>

            <h3>⏰ What Happens Next?</h3>
            <ul>
              <li><strong>Response Time:</strong> You'll hear from our team within 4-8 business hours</li>
              <li><strong>Expert Review:</strong> Your request is being reviewed by our specialist team</li>
              <li><strong>Status Updates:</strong> We'll keep you informed of any progress</li>
              <li><strong>Resolution Focus:</strong> We're committed to resolving your request quickly</li>
            </ul>

            <h3>🚀 Immediate Help Available</h3>
            <div class="support-options">
              <div class="support-item">
                <h4>📚 Help Center</h4>
                <p>Search our knowledge base for instant answers</p>
                <a href="https://commertize.com/help">Visit Help Center</a>
              </div>
              <div class="support-item">
                <h4>💬 Live Chat</h4>
                <p>Chat with our support team in real-time</p>
                <a href="https://commertize.com/chat">Start Live Chat</a>
              </div>
              <div class="support-item">
                <h4>📺 Video Guides</h4>
                <p>Watch tutorials and how-to videos</p>
                <a href="https://commertize.com/tutorials">Watch Tutorials</a>
              </div>
            </div>

            <p><strong>Quick Resources Based on Common Questions:</strong></p>
            <ul>
              <li>🔐 <a href="https://commertize.com/account-security">Account Security & Login Issues</a></li>
              <li>💰 <a href="https://commertize.com/investment-guide">Investment Process & Minimums</a></li>
              <li>🏢 <a href="https://commertize.com/property-details">Property Information & Due Diligence</a></li>
              <li>📱 <a href="https://commertize.com/mobile-app">Mobile App & Platform Features</a></li>
              <li>💳 <a href="https://commertize.com/payments">Payment Methods & Withdrawals</a></li>
            </ul>

            <div style="text-align: center;">
              <a href="https://commertize.com/support/ticket/${ticketId}" class="cta-button">
                Track Ticket Status →
              </a>
            </div>

            <p><strong>Need to add more information?</strong> Simply reply to this email with additional details, and it will be automatically added to your ticket.</p>

            <p><strong>Urgent Issue?</strong> If this is time-sensitive, please call our priority support line at <a href="tel:+15551234567">+1 (555) 123-4567</a> and reference ticket #${shortTicketId}.</p>

            <p>We appreciate your patience and look forward to resolving your request quickly.</p>

            <p>Best regards,<br>
            <strong>The Commertize Support Team</strong><br>
            📧 <a href="mailto:support@commertize.com">support@commertize.com</a><br>
            📞 <a href="tel:+15551234567">+1 (555) 123-4567</a></p>

            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 30px;">
              <p style="margin: 0; font-size: 14px; text-align: center;"><strong>Tip:</strong> Bookmark your ticket URL to easily check status updates anytime.</p>
            </div>
          </div>

          <div class="footer">
            <p>© ${currentYear} Commertize. All rights reserved.</p>
            <p>This is an automated response. Your ticket is being processed by our support team.</p>
            <p><a href="https://commertize.com/support" style="color: #8e44ad;">Support Center</a> | <a href="https://commertize.com/help" style="color: #8e44ad;">Help Center</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}