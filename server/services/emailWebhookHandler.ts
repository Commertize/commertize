import { runeEmailAutomation } from './runeEmailAutomation';

/**
 * Email Webhook Handler Service
 * Processes incoming emails from various email providers (Zoho, Gmail, etc.)
 * and routes them to RUNE.CTZ for intelligent automation
 */

interface WebhookEmailData {
  // Common email webhook fields across providers
  from?: string;
  sender?: string;
  to?: string;
  recipient?: string;
  subject?: string;
  text?: string;
  html?: string;
  body?: string;
  messageId?: string;
  timestamp?: string;
  
  // Provider-specific fields
  [key: string]: any;
}

export class EmailWebhookHandler {
  private initialized = false;
  private supportEmails = ['support@commertize.com', 'hello@commertize.com', 'info@commertize.com'];

  initialize(): void {
    this.initialized = true;
    console.log('📧 Email Webhook Handler initialized for support@commertize.com automation');
  }

  /**
   * Universal email webhook processor
   * Handles webhooks from multiple email providers
   */
  async processEmailWebhook(
    webhookData: WebhookEmailData, 
    provider: 'zoho' | 'gmail' | 'sendgrid' | 'generic' = 'generic'
  ): Promise<{ success: boolean; message: string; ticketId?: string }> {
    
    if (!this.initialized) {
      throw new Error('Email Webhook Handler not initialized');
    }

    try {
      console.log(`📨 Processing ${provider} email webhook`);
      
      // Normalize email data based on provider
      const normalizedEmail = this.normalizeEmailData(webhookData, provider);
      
      // Check if this is for our support email
      if (!this.isSupportEmail(normalizedEmail.to || '')) {
        console.log(`⏭️ Email not for support address: ${normalizedEmail.to}`);
        return {
          success: false,
          message: 'Email not for support address'
        };
      }

      // Validate email data
      if (!normalizedEmail.from || !normalizedEmail.body) {
        console.log('⚠️ Invalid email data - missing sender or body');
        return {
          success: false,
          message: 'Invalid email data'
        };
      }

      // Process with RUNE.CTZ
      const result = await runeEmailAutomation.handleEmailWebhook(normalizedEmail);
      
      console.log(`✅ Email webhook processed: ${result.success ? 'Success' : 'Failed'}`);
      
      return result;
      
    } catch (error) {
      console.error('❌ Email webhook processing failed:', error);
      return {
        success: false,
        message: `Webhook processing error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Normalize email data from different providers into consistent format
   */
  private normalizeEmailData(data: WebhookEmailData, provider: string): WebhookEmailData {
    const normalized: WebhookEmailData = {
      from: data.from || data.sender || '',
      to: data.to || data.recipient || 'support@commertize.com',
      subject: data.subject || 'No Subject',
      body: data.text || data.html || data.body || '',
      messageId: data.messageId || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: data.timestamp || new Date().toISOString()
    };

    // Provider-specific normalizations
    switch (provider) {
      case 'zoho':
        // Zoho Mail webhook format
        normalized.from = data.fromAddress || data.from;
        normalized.body = data.textContent || data.htmlContent || data.body;
        break;
        
      case 'gmail':
        // Gmail API webhook format  
        normalized.from = data.payload?.headers?.find((h: any) => h.name === 'From')?.value || data.from;
        normalized.subject = data.payload?.headers?.find((h: any) => h.name === 'Subject')?.value || data.subject;
        break;
        
      case 'sendgrid':
        // SendGrid Inbound Parse webhook format
        normalized.from = data.from;
        normalized.body = data.text || data.html;
        normalized.to = data.to;
        break;
    }

    return normalized;
  }

  /**
   * Check if email is addressed to one of our support addresses
   */
  private isSupportEmail(toAddress: string): boolean {
    const address = toAddress.toLowerCase();
    return this.supportEmails.some(supportEmail => 
      address.includes(supportEmail.toLowerCase())
    );
  }

  /**
   * Zoho Mail specific webhook handler
   */
  async handleZohoWebhook(zohoData: any): Promise<{ success: boolean; message: string }> {
    return this.processEmailWebhook(zohoData, 'zoho');
  }

  /**
   * Gmail API webhook handler
   */
  async handleGmailWebhook(gmailData: any): Promise<{ success: boolean; message: string }> {
    return this.processEmailWebhook(gmailData, 'gmail');
  }

  /**
   * SendGrid Inbound Parse webhook handler
   */
  async handleSendGridWebhook(sendGridData: any): Promise<{ success: boolean; message: string }> {
    return this.processEmailWebhook(sendGridData, 'sendgrid');
  }

  /**
   * Generic email webhook handler for testing
   */
  async handleGenericWebhook(emailData: any): Promise<{ success: boolean; message: string }> {
    return this.processEmailWebhook(emailData, 'generic');
  }

  /**
   * Test the webhook handler with sample email
   */
  async testWebhook(): Promise<{ success: boolean; message: string }> {
    const sampleEmail = {
      from: 'test@example.com',
      to: 'support@commertize.com',
      subject: 'Test RUNE.CTZ Email Automation',
      body: 'This is a test email to verify that RUNE.CTZ can automatically respond to support inquiries. Please confirm the automation is working.',
      timestamp: new Date().toISOString()
    };

    return this.processEmailWebhook(sampleEmail, 'generic');
  }

  /**
   * Get webhook handler status and statistics
   */
  getStatus() {
    return {
      initialized: this.initialized,
      supportEmails: this.supportEmails,
      supportedProviders: ['zoho', 'gmail', 'sendgrid', 'generic'],
      runeEmailAutomation: runeEmailAutomation.getStats()
    };
  }
}

// Export singleton instance
export const emailWebhookHandler = new EmailWebhookHandler();