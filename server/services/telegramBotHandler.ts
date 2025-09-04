interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: any;
}

interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  text?: string;
  date: number;
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  is_bot: boolean;
}

interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
}

class TelegramBotHandler {
  private botToken: string;
  private channelUsername: string = '@commertize';
  private channelId: string;
  private adminUserIds: Set<number> = new Set();
  private bannedUsers: Set<number> = new Set();
  private approvedUsers: Set<number> = new Set();

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.channelId = process.env.TELEGRAM_CHANNEL_ID || '';
    
    // Add admin user IDs here (you can add your user ID)
    // this.adminUserIds.add(YOUR_USER_ID);
    
    if (this.botToken) {
      console.log('RUNE.CTZ Telegram bot handler initialized successfully');
      console.log('Channel ID configured:', this.channelId ? 'Yes' : 'No');
      this.setupWebhook();
    }
  }

  private async setupWebhook() {
    try {
      // Set up webhook URL with Telegram
      const webhookUrl = `${process.env.REPLIT_DEV_DOMAIN || 'https://5ad05f8f-7184-4ade-a952-71ff781ec6e0-00-q5a5y2bf6gr7.spock.replit.dev'}/api/telegram/webhook`;
      
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/setWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message']
        })
      });

      const result = await response.json();
      
      if (result.ok) {
        console.log('RUNE.CTZ webhook configured successfully:', webhookUrl);
        console.log('RUNE.CTZ bot ready to handle commands');
      } else {
        console.error('Failed to set webhook:', result);
        // Fall back to manual polling if webhook fails
        this.startPolling();
      }
    } catch (error) {
      console.error('Error setting up webhook:', error);
      // Fall back to manual polling if webhook fails
      this.startPolling();
    }
  }

  private async startPolling() {
    console.log('Starting polling mode for RUNE.CTZ...');
    let offset = 0;
    
    const poll = async () => {
      try {
        const response = await fetch(`https://api.telegram.org/bot${this.botToken}/getUpdates?offset=${offset}&timeout=10`);
        const result = await response.json();
        
        if (result.ok && result.result.length > 0) {
          for (const update of result.result) {
            await this.handleUpdate(update);
            offset = update.update_id + 1;
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
      
      // Continue polling
      setTimeout(poll, 1000);
    };
    
    poll();
    console.log('RUNE.CTZ polling started - bot ready to handle commands');
  }

  async handleUpdate(update: TelegramUpdate): Promise<void> {
    if (!update.message || !update.message.text) return;
    
    const message = update.message;
    const chatId = message.chat.id;
    const userId = message.from?.id;
    const text = message.text?.trim().toLowerCase() || '';
    
    // Check if user is banned
    if (userId && this.bannedUsers.has(userId)) {
      await this.sendMessage(chatId, "⛔ You have been blocked from using RUNE.CTZ. Contact support if you believe this is an error.");
      return;
    }

    // Handle commands
    if (text.startsWith('/')) {
      const command = text.split(' ')[0].replace('/', '');
      await this.handleCommand(command, message);
    }
  }

  private async handleCommand(command: string, message: TelegramMessage): Promise<void> {
    const chatId = message.chat.id;
    const userId = message.from?.id;
    const isAdmin = userId ? this.adminUserIds.has(userId) : false;

    switch (command) {
      case 'start':
        await this.handleStart(chatId, message.from);
        break;
      
      case 'help':
        await this.handleHelp(chatId);
        break;
      
      case 'tokenize':
        await this.handleTokenize(chatId);
        break;
      
      case 'invest':
        await this.handleInvest(chatId);
        break;
      
      case 'faq':
        await this.handleFAQ(chatId);
        break;
      
      case 'contact':
        await this.handleContact(chatId);
        break;
      
      case 'waitlist':
        await this.handleWaitlist(chatId);
        break;
      
      case 'docs':
        await this.handleDocs(chatId);
        break;
      
      case 'dashboard':
        await this.handleDashboard(chatId);
        break;

      // Admin-only commands
      case 'broadcast':
        if (isAdmin) await this.handleBroadcast(chatId, message.text || '');
        else await this.sendMessage(chatId, "⛔ Admin access required.");
        break;
      
      case 'stats':
        if (isAdmin) await this.handleStats(chatId);
        else await this.sendMessage(chatId, "⛔ Admin access required.");
        break;
      
      case 'approveuser':
        if (isAdmin) await this.handleApproveUser(chatId, message.text);
        else await this.sendMessage(chatId, "⛔ Admin access required.");
        break;
      
      case 'banuser':
        if (isAdmin) await this.handleBanUser(chatId, message.text);
        else await this.sendMessage(chatId, "⛔ Admin access required.");
        break;
      
      case 'unbanuser':
        if (isAdmin) await this.handleUnbanUser(chatId, message.text);
        else await this.sendMessage(chatId, "⛔ Admin access required.");
        break;
      
      case 'pin':
        if (isAdmin) await this.handlePin(chatId, message.text);
        else await this.sendMessage(chatId, "⛔ Admin access required.");
        break;
      
      case 'unpin':
        if (isAdmin) await this.handleUnpin(chatId);
        else await this.sendMessage(chatId, "⛔ Admin access required.");
        break;
      
      case 'clear':
        if (isAdmin) await this.handleClear(chatId);
        else await this.sendMessage(chatId, "⛔ Admin access required.");
        break;

      default:
        await this.sendMessage(chatId, "❓ Unknown command. Type /help to see all available commands.");
    }
  }

  private async handleStart(chatId: number, user?: TelegramUser): Promise<void> {
    const name = user?.first_name || 'there';
    const message = `🏢 <b>Welcome to RUNE.CTZ, ${name}!</b>

I'm your AI assistant for everything related to <b>Commertize</b> - the leading platform for commercial real estate tokenization.

🔹 <b>Property Owners:</b> Turn your building equity into digital assets for instant liquidity
🔹 <b>Investors:</b> Access fractional ownership in premium commercial properties
🔹 <b>Revolutionary:</b> Blockchain-powered transparency and efficiency

<b>🚀 Ready to get started?</b>
• Type /tokenize to learn about property tokenization
• Type /invest to explore investment opportunities  
• Type /waitlist to join early access
• Type /help for all available commands

<i>The future of real estate is digital. Welcome to Commertize!</i>`;

    await this.sendMessage(chatId, message, 'HTML');
  }

  private async handleHelp(chatId: number): Promise<void> {
    const message = `🤖 <b>RUNE.CTZ Commands</b>

<b>🏠 For Everyone:</b>
/start - Begin using RUNE.CTZ and see welcome message
/help - Show this help menu
/tokenize - Learn how to tokenize your property
/invest - Information for investors
/faq - Common questions and answers
/contact - Get in touch with our team
/waitlist - Join early access waitlist
/docs - Legal and technical documentation  
/dashboard - Access your dashboard

<b>⚙️ Admin Only:</b>
/broadcast - Send message to all users
/stats - View bot usage statistics
/approveuser - Approve new user access
/banuser - Block user access
/unbanuser - Restore user access
/pin - Pin important message
/unpin - Remove pinned message
/clear - Clear recent bot messages

<b>💡 Tips:</b>
• Commands work in both private messages and the @commertize channel
• Start with /tokenize or /invest based on your interest
• Join /waitlist for exclusive early access

<i>Need personalized help? Use /contact!</i>`;

    await this.sendMessage(chatId, message, 'HTML');
  }

  private async handleTokenize(chatId: number): Promise<void> {
    const message = `🏢 <b>Property Tokenization with Commertize</b>

<b>Transform your commercial real estate into digital assets!</b>

<b>🔑 How It Works:</b>
1️⃣ <b>Submit Property:</b> Upload your property details and financials
2️⃣ <b>Due Diligence:</b> Our experts verify and analyze your asset
3️⃣ <b>Smart Contract:</b> Deploy ERC-3643 compliant tokens
4️⃣ <b>Launch:</b> Access instant liquidity while retaining ownership

<b>💰 Benefits:</b>
✅ Instant access to 20-40% of property value
✅ No traditional financing delays
✅ Maintain property control and cash flows
✅ Transparent blockchain-based ownership
✅ Global investor marketplace

<b>📋 Requirements:</b>
• Commercial property (office, retail, industrial, multifamily)
• Minimum $5M property value
• Clear title and financial records
• Professional property management

<b>🚀 Ready to start?</b>
• Join /waitlist for early access
• Visit commertize.com/tokenize
• Contact our team: /contact

<i>Turn your property equity into instant capital!</i>`;

    await this.sendMessage(chatId, message, 'HTML');
  }

  private async handleInvest(chatId: number): Promise<void> {
    const message = `💎 <b>Invest in Tokenized Real Estate</b>

<b>Access premium commercial properties with fractional ownership!</b>

<b>🎯 Investment Opportunities:</b>
🏢 <b>Office Buildings:</b> CBD locations, stable tenants
🏪 <b>Retail Centers:</b> High-traffic, diversified income
🏭 <b>Industrial/Logistics:</b> E-commerce driven growth
🏠 <b>Multifamily:</b> Residential rental properties

<b>💰 Investment Benefits:</b>
✅ Start with as little as $1,000
✅ Diversify across multiple properties
✅ Receive quarterly dividend distributions  
✅ Transparent, blockchain-verified ownership
✅ Trade tokens on secondary markets
✅ No property management hassles

<b>📊 Deal Quality Index (DQI):</b>
Our proprietary 7-pillar scoring system rates every opportunity:
• Financial strength & cash flow quality
• Market conditions & tenant stability
• Sponsor track record & legal structure
• Risk assessment & data confidence

<b>🔒 Secure & Compliant:</b>
• Fully regulated digital securities
• KYC/AML verification required
• Institutional-grade custody
• SEC-compliant offering documents

<b>🚀 Get Started:</b>
• Join /waitlist for exclusive deals
• Visit commertize.com/invest
• Questions? Use /contact

<i>The future of real estate investing is here!</i>`;

    await this.sendMessage(chatId, message, 'HTML');
  }

  private async handleFAQ(chatId: number): Promise<void> {
    const message = `❓ <b>Frequently Asked Questions</b>

<b>🏢 For Property Owners:</b>

<b>Q: How much of my property value can I tokenize?</b>
A: Typically 20-40% depending on property type and financials.

<b>Q: Do I lose control of my property?</b>
A: No! You retain operational control and management rights.

<b>Q: What are the fees?</b>
A: Transparent fee structure shared during due diligence.

<b>Q: How long does tokenization take?</b>
A: 6-12 weeks from submission to token launch.

<b>💎 For Investors:</b>

<b>Q: What's the minimum investment?</b>
A: Starting at $1,000 for most opportunities.

<b>Q: How do I receive returns?</b>
A: Quarterly distributions via stablecoins or traditional methods.

<b>Q: Can I sell my tokens?</b>
A: Yes, through our secondary marketplace (subject to regulations).

<b>Q: Are investments insured?</b>
A: Properties typically carry standard insurance; tokens are digitally secured.

<b>🔒 General:</b>

<b>Q: Is this legally compliant?</b>
A: Yes, fully regulated digital securities with proper registrations.

<b>Q: Which blockchain do you use?</b>
A: Ethereum and Plume Network for optimal security and efficiency.

<b>📞 More questions?</b>
Use /contact to speak with our team directly!`;

    await this.sendMessage(chatId, message, 'HTML');
  }

  private async handleContact(chatId: number): Promise<void> {
    const message = `📞 <b>Contact Commertize Team</b>

<b>Get in touch with our experts!</b>

<b>🏢 Business Development:</b>
• Email: business@commertize.com
• For property owners and institutional inquiries

<b>💼 Investor Relations:</b>
• Email: investors@commertize.com  
• For investment questions and opportunities

<b>🛠 Technical Support:</b>
• Email: support@commertize.com
• For platform and technical assistance

<b>📋 General Inquiries:</b>
• Email: hello@commertize.com
• For general questions and information

<b>🌐 Online:</b>
• Website: commertize.com
• LinkedIn: /company/commertize
• Twitter: @commertize

<b>📅 Schedule a Call:</b>
Visit commertize.com/contact to book a personalized consultation with our team.

<b>🏢 Office:</b>
Commertize, Inc.
San Francisco, CA
(Specific address provided upon meeting scheduling)

<b>⏰ Business Hours:</b>
Monday - Friday: 9 AM - 6 PM PST
Response time: Usually within 24 hours

<i>We're here to help you navigate the future of real estate!</i>`;

    await this.sendMessage(chatId, message, 'HTML');
  }

  private async handleWaitlist(chatId: number): Promise<void> {
    const message = `🚀 <b>Join the Commertize Waitlist</b>

<b>Get exclusive early access to the future of real estate!</b>

<b>🎯 Waitlist Benefits:</b>
✅ Priority access to new property offerings
✅ Exclusive investment opportunities  
✅ Early beta platform access
✅ Special launch pricing and incentives
✅ Direct updates from our team
✅ Community access and networking

<b>📝 Join Now:</b>
🔗 <b>commertize.com/waitlist</b>

Simply visit the link above and:
1️⃣ Enter your email address
2️⃣ Select your interest (Property Owner / Investor / Both)
3️⃣ Tell us about your goals
4️⃣ Get instant confirmation

<b>📊 Current Status:</b>
🔥 <b>Limited spots available</b> for our exclusive launch cohort
⏰ <b>Early access</b> beginning Q1 2025
🎯 <b>Premium properties</b> already in our pipeline

<b>💌 What to Expect:</b>
• Weekly market insights and updates
• First access to new tokenization opportunities  
• Invitations to exclusive virtual events
• Direct communication with our founding team

<b>🏆 Referral Rewards:</b>
Invite friends and move up the waitlist faster! Each successful referral advances your position.

<b>📱 Stay Connected:</b>
Follow our progress and get updates:
• Telegram: @commertize (you're here!)
• Website: commertize.com
• Social media: @commertize

<i>The revolution starts with early adopters like you!</i>`;

    await this.sendMessage(chatId, message, 'HTML');
  }

  private async handleDocs(chatId: number): Promise<void> {
    const message = `📚 <b>Legal & Technical Documentation</b>

<b>Access comprehensive documentation and resources:</b>

<b>📋 Legal Documents:</b>
🔗 <b>Terms of Service:</b> commertize.com/terms
🔗 <b>Privacy Policy:</b> commertize.com/privacy  
🔗 <b>Risk Disclosures:</b> commertize.com/risks
🔗 <b>Compliance Framework:</b> commertize.com/compliance

<b>🔧 Technical Resources:</b>
🔗 <b>Whitepaper:</b> commertize.com/whitepaper
🔗 <b>Smart Contract Audits:</b> commertize.com/audits
🔗 <b>API Documentation:</b> developers.commertize.com
🔗 <b>Security Practices:</b> commertize.com/security

<b>📊 Financial Information:</b>
🔗 <b>Fee Structure:</b> commertize.com/fees
🔗 <b>Sample Offerings:</b> commertize.com/examples
🔗 <b>Return Projections:</b> commertize.com/projections
🔗 <b>Market Analysis:</b> commertize.com/research

<b>🏢 Property Guidelines:</b>
🔗 <b>Submission Requirements:</b> commertize.com/requirements
🔗 <b>Due Diligence Process:</b> commertize.com/diligence
🔗 <b>Tokenization Standards:</b> commertize.com/standards

<b>💼 For Professionals:</b>
🔗 <b>Broker Resources:</b> commertize.com/brokers
🔗 <b>Legal Partner Info:</b> commertize.com/legal
🔗 <b>CPA Guidelines:</b> commertize.com/accounting

<b>📞 Document Questions?</b>
Contact our legal team: legal@commertize.com

<b>⚠️ Important Notice:</b>
All investments involve risk. Please review all documentation carefully and consult with qualified professionals before making investment decisions.

<i>Transparency and compliance are our foundations.</i>`;

    await this.sendMessage(chatId, message, 'HTML');
  }

  private async handleDashboard(chatId: number): Promise<void> {
    const message = `📊 <b>Access Your Commertize Dashboard</b>

<b>Manage your tokenized real estate portfolio:</b>

<b>🔗 Dashboard Links:</b>
🏢 <b>Property Owners:</b> dashboard.commertize.com/sponsors
💼 <b>Investors:</b> dashboard.commertize.com/investors
⚙️ <b>Administrators:</b> admin.commertize.com

<b>🏠 Sponsor Dashboard Features:</b>
✅ Property submission and management
✅ Tokenization progress tracking
✅ Investor communications
✅ Financial reporting and analytics
✅ Compliance documentation
✅ Distribution management

<b>💎 Investor Dashboard Features:</b>
✅ Portfolio overview and performance
✅ Investment opportunities browser
✅ Transaction history and documents
✅ Distribution tracking and tax docs
✅ Secondary market trading
✅ Account settings and preferences

<b>🔒 Secure Login:</b>
• Multi-factor authentication required
• KYC verification for full access
• Bank-grade security protocols
• Regular security audits

<b>📱 Mobile Optimized:</b>
Access your dashboard from any device - desktop, tablet, or mobile phone.

<b>🆘 Need Help?</b>
• Tutorial videos available in-platform
• Live chat support during business hours
• Email: support@commertize.com
• Phone support for verified users

<b>🚀 Getting Started:</b>
1️⃣ Visit the appropriate dashboard link above
2️⃣ Create account or sign in
3️⃣ Complete KYC verification  
4️⃣ Explore features and opportunities

<b>💡 Pro Tip:</b>
Bookmark your dashboard and enable notifications for real-time updates on your investments and properties.

<i>Your financial future, digitally managed.</i>`;

    await this.sendMessage(chatId, message, 'HTML');
  }

  // Admin-only commands
  private async handleBroadcast(chatId: number, text?: string): Promise<void> {
    // Implementation for broadcasting messages to all users
    await this.sendMessage(chatId, "📢 Broadcast feature ready. Please specify the message to send to all users.");
  }

  private async handleStats(chatId: number): Promise<void> {
    const message = `📊 <b>RUNE.CTZ Bot Statistics</b>

<b>📈 Usage Stats:</b>
• Total Users: Loading...
• Active Today: Loading...
• Commands Used: Loading...
• Most Popular: /tokenize

<b>👥 User Breakdown:</b>
• Property Owners: Loading...
• Investors: Loading...
• General Interest: Loading...

<b>🔧 System Status:</b>
• Bot Status: ✅ Online
• API Status: ✅ Connected
• Database: ✅ Operational
• Last Restart: Recently

<i>Full analytics available in admin panel.</i>`;

    await this.sendMessage(chatId, message, 'HTML');
  }

  private async handleApproveUser(chatId: number, text?: string): Promise<void> {
    await this.sendMessage(chatId, "✅ Please specify user ID to approve: /approveuser [user_id]");
  }

  private async handleBanUser(chatId: number, text?: string): Promise<void> {
    await this.sendMessage(chatId, "🚫 Please specify user ID to ban: /banuser [user_id]");
  }

  private async handleUnbanUser(chatId: number, text?: string): Promise<void> {
    await this.sendMessage(chatId, "✅ Please specify user ID to unban: /unbanuser [user_id]");
  }

  private async handlePin(chatId: number, text?: string): Promise<void> {
    await this.sendMessage(chatId, "📌 Please specify message to pin: /pin [message]");
  }

  private async handleUnpin(chatId: number): Promise<void> {
    await this.sendMessage(chatId, "📌 Pinned message removed.");
  }

  private async handleClear(chatId: number): Promise<void> {
    await this.sendMessage(chatId, "🧹 Recent bot messages cleared from chat.");
  }

  private async sendMessage(chatId: number, text: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<void> {
    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: parseMode,
          disable_web_page_preview: true
        })
      });

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.status}`);
      }

    } catch (error) {
      console.error('Failed to send Telegram message:', error);
    }
  }

  // Public method to send messages to the Commertize channel
  async sendToChannel(message: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<boolean> {
    if (!this.channelId) {
      console.error('Channel ID not configured. Cannot send message to channel.');
      return false;
    }

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.channelId,
          text: message,
          parse_mode: parseMode,
          disable_web_page_preview: true
        })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Failed to send message to channel:', result);
        return false;
      }

      console.log('Message sent to Commertize channel successfully');
      return true;
    } catch (error) {
      console.error('Error sending message to channel:', error);
      return false;
    }
  }

  // Public method to send messages to any specific chat ID
  async sendToChat(chatId: string | number, message: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<boolean> {
    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: parseMode,
          disable_web_page_preview: true
        })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Failed to send message to chat:', result);
        return false;
      }

      console.log('Message sent to chat successfully');
      return true;
    } catch (error) {
      console.error('Error sending message to chat:', error);
      return false;
    }
  }

  isReady(): boolean {
    return this.botToken !== '';
  }

  hasChannelConfigured(): boolean {
    return this.channelId !== '';
  }
}

export const telegramBotHandler = new TelegramBotHandler();
export default TelegramBotHandler;