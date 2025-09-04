import OpenAI from 'openai';
import { sendEmail } from './emailService';
import { supportAutomationService } from './supportAutomationService';
import { CommertizerX } from './commertizerX';
import { generateSupportResponseTemplate } from '../emailTemplates/supportEmailTemplates';
import { nanoid } from 'nanoid';

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface EmailAnalysis {
  category: 'investment_inquiry' | 'property_question' | 'technical_support' | 'general_support' | 'partnership' | 'complaint' | 'feature_request';
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  topics: string[];
  suggestedResponse: string;
  followUpActions: string[];
}

interface IncomingEmail {
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  messageId?: string;
}

export class RuneEmailAutomation {
  private initialized = false;
  private supportEmail = 'support@commertize.com';

  initialize(): void {
    this.initialized = true;
    console.log('🤖 RUNE.CTZ Email Automation initialized - 100% automated support');
  }

  async processIncomingEmail(email: IncomingEmail): Promise<{ success: boolean; ticketId?: string; response?: string }> {
    if (!this.initialized) {
      throw new Error('RUNE.CTZ Email Automation not initialized');
    }

    try {
      console.log(`🔍 RUNE.CTZ analyzing email from: ${email.from}`);
      
      // Step 1: AI Analysis of the email
      const analysis = await this.analyzeEmail(email);
      
      // Step 2: Create support ticket
      const ticket = await supportAutomationService.handleSupportTicket(
        email.from, 
        email.subject, 
        email.body
      );

      // Step 3: Generate intelligent AI response
      const intelligentResponse = await this.generateIntelligentResponse(email, analysis);
      
      // Step 4: Send the AI-powered response
      await this.sendIntelligentResponse(email, intelligentResponse, ticket.id);
      
      // Step 5: Log the interaction for CommertizerX
      CommertizerX.logAction(ticket.id, `RUNE.CTZ processed email: ${analysis.category} (${analysis.priority} priority)`);
      
      console.log(`✅ RUNE.CTZ automated response sent for ticket: ${ticket.id}`);
      
      return {
        success: true,
        ticketId: ticket.id,
        response: intelligentResponse
      };
      
    } catch (error) {
      console.error('❌ RUNE.CTZ email processing failed:', error);
      
      // Fallback to basic template response
      const basicTicket = await supportAutomationService.handleSupportTicket(
        email.from,
        email.subject,
        email.body
      );
      
      return {
        success: false,
        ticketId: basicTicket.id
      };
    }
  }

  private async analyzeEmail(email: IncomingEmail): Promise<EmailAnalysis> {
    const analysisPrompt = `
Analyze this customer support email and provide a structured analysis:

From: ${email.from}
Subject: ${email.subject}
Body: ${email.body}

Please analyze and respond with JSON in this exact format:
{
  "category": "investment_inquiry|property_question|technical_support|general_support|partnership|complaint|feature_request",
  "sentiment": "positive|neutral|negative|urgent", 
  "priority": "low|medium|high|urgent",
  "topics": ["list", "of", "key", "topics"],
  "suggestedResponse": "A professional, helpful response addressing their specific concerns",
  "followUpActions": ["action1", "action2"]
}

Context: Commertize is a commercial real estate tokenization platform that allows fractional ownership of properties through blockchain technology.
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: analysisPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      // Validate and set defaults
      return {
        category: analysis.category || 'general_support',
        sentiment: analysis.sentiment || 'neutral',
        priority: analysis.priority || 'medium',
        topics: analysis.topics || [],
        suggestedResponse: analysis.suggestedResponse || 'Thank you for contacting Commertize. We will review your inquiry and respond shortly.',
        followUpActions: analysis.followUpActions || []
      };
    } catch (error) {
      console.error('AI email analysis failed:', error);
      
      // Fallback analysis
      return {
        category: 'general_support',
        sentiment: 'neutral',
        priority: 'medium',
        topics: [],
        suggestedResponse: 'Thank you for contacting Commertize. We have received your inquiry and will respond within 24 hours.',
        followUpActions: ['Manual review required']
      };
    }
  }

  private async generateIntelligentResponse(email: IncomingEmail, analysis: EmailAnalysis): Promise<string> {
    const responsePrompt = `
Generate a professional, personalized email response for this customer inquiry:

Original Email:
From: ${email.from}
Subject: ${email.subject}
Body: ${email.body}

Analysis:
Category: ${analysis.category}
Sentiment: ${analysis.sentiment}
Priority: ${analysis.priority}
Topics: ${analysis.topics.join(', ')}

Generate a professional email response that:
1. Acknowledges their specific inquiry
2. Provides helpful information relevant to their question
3. Maintains a professional but friendly tone
4. Includes next steps or call-to-action if appropriate
5. Signs off as "The Commertize Team"

Context about Commertize:
- Commercial real estate tokenization platform
- Enables fractional ownership through blockchain
- Minimum investments typically start at $1,000
- Properties include office buildings, retail spaces, warehouses
- Platform handles KYC/AML compliance
- Investment returns through rental income and appreciation
- 24/7 customer support available

Keep response concise but comprehensive, around 150-250 words.
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: responsePrompt }],
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0].message.content || analysis.suggestedResponse;
    } catch (error) {
      console.error('AI response generation failed:', error);
      return analysis.suggestedResponse;
    }
  }

  private async sendIntelligentResponse(email: IncomingEmail, response: string, ticketId: string): Promise<void> {
    const emailHtml = this.generateResponseEmailTemplate(email, response, ticketId);
    
    await sendEmail({
      to: email.from,
      from: this.supportEmail,
      subject: `Re: ${email.subject} [Ticket #${ticketId.slice(-8)}]`,
      html: emailHtml,
      text: response
    });
  }

  private generateResponseEmailTemplate(email: IncomingEmail, response: string, ticketId: string): string {
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
      .response-text {
        background-color: white;
        padding: 15px;
        border-radius: 5px;
        margin: 15px 0;
        border-left: 4px solid #1a365d;
      }
      .footer {
        text-align: center;
        margin-top: 20px;
        font-size: 0.875rem;
        color: #718096;
      }
      .ticket-info {
        background-color: #f0f9ff;
        padding: 10px;
        border-radius: 4px;
        margin: 15px 0;
        font-size: 0.9em;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>Commertize Support</h1>
      <p>Automated by RUNE.CTZ AI</p>
    </div>
    <div class="content">
      <div class="ticket-info">
        <strong>Ticket ID:</strong> ${ticketId.slice(-8)} | <strong>Status:</strong> Open
      </div>
      
      <div class="response-text">
        ${response.replace(/\n/g, '<br>')}
      </div>
      
      <p><strong>Next Steps:</strong></p>
      <ul>
        <li>This ticket has been logged in our system for tracking</li>
        <li>If you need immediate assistance, please call our support line</li>
        <li>For investment questions, you can also explore our <a href="https://commertize.com/marketplace">property marketplace</a></li>
      </ul>
      
      <p>Best regards,<br>The Commertize Team<br><em>Powered by RUNE.CTZ AI</em></p>
    </div>
    <div class="footer">
      <p>📧 support@commertize.com | 🌐 commertize.com</p>
      <p>© ${new Date().getFullYear()} Commertize. All rights reserved.</p>
    </div>
  </body>
</html>
    `;
  }

  // Webhook endpoint handler for incoming emails
  async handleEmailWebhook(emailData: any): Promise<{ success: boolean; message: string }> {
    try {
      // Parse email data (format depends on email provider webhook)
      const incomingEmail: IncomingEmail = {
        from: emailData.from || emailData.sender,
        to: emailData.to || 'support@commertize.com',
        subject: emailData.subject || 'No Subject',
        body: emailData.text || emailData.html || emailData.body || '',
        timestamp: new Date().toISOString(),
        messageId: emailData.messageId || nanoid()
      };

      // Process the email with RUNE.CTZ
      const result = await this.processIncomingEmail(incomingEmail);
      
      return {
        success: result.success,
        message: result.success ? 
          `RUNE.CTZ processed email and created ticket ${result.ticketId}` :
          'Email processed with fallback system'
      };
    } catch (error) {
      console.error('Email webhook processing error:', error);
      return {
        success: false,
        message: 'Failed to process incoming email'
      };
    }
  }

  // Get automation statistics
  getStats() {
    return {
      initialized: this.initialized,
      supportEmail: this.supportEmail,
      aiModel: 'gpt-5',
      capabilities: [
        'Intelligent email analysis',
        'Context-aware responses', 
        'Automatic ticket creation',
        'Priority classification',
        'Sentiment analysis',
        'Follow-up action suggestions'
      ]
    };
  }
}

// Export singleton instance
export const runeEmailAutomation = new RuneEmailAutomation();