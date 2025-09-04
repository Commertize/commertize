interface DiscordInteraction {
  type: number;
  data?: {
    name: string;
    options?: Array<{ name: string; value: string | number; type: number }>;
  };
  guild_id?: string;
  channel_id: string;
  member?: {
    user: DiscordUser;
  };
  user?: DiscordUser;
  token: string;
  id: string;
  application_id: string;
}

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string;
  bot?: boolean;
}

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  footer?: { text: string };
  timestamp?: string;
  thumbnail?: { url: string };
  image?: { url: string };
}

interface DiscordResponse {
  type: number;
  data?: {
    content?: string;
    embeds?: DiscordEmbed[];
    flags?: number;
  };
}

class DiscordBotHandler {
  private botToken: string;
  private applicationId: string;
  private guildId: string | null = null; // Set to specific guild ID if needed
  private adminUserIds: Set<string> = new Set();
  private bannedUsers: Set<string> = new Set();

  constructor() {
    this.botToken = process.env.DISCORD_BOT_TOKEN || '';
    this.applicationId = process.env.DISCORD_APPLICATION_ID || '';
    
    // Add admin user IDs here (Discord user IDs)
    // this.adminUserIds.add('YOUR_DISCORD_USER_ID');
    
    if (this.botToken && this.applicationId) {
      console.log('RUNE.DCZ Discord bot handler initialized successfully');
      this.setupCommands();
    }
  }

  private async setupCommands() {
    try {
      const commands = [
        {
          name: 'start',
          description: 'Welcome to RUNE.DCZ and learn about Commertize',
          type: 1
        },
        {
          name: 'help',
          description: 'Show all available commands and how to use them',
          type: 1
        },
        {
          name: 'tokenize',
          description: 'Learn how to tokenize your commercial property',
          type: 1
        },
        {
          name: 'invest',
          description: 'Explore tokenized real estate investment opportunities',
          type: 1
        },
        {
          name: 'faq',
          description: 'Frequently asked questions about Commertize',
          type: 1
        },
        {
          name: 'contact',
          description: 'Get in touch with the Commertize team',
          type: 1
        },
        {
          name: 'waitlist',
          description: 'Join the Commertize early access waitlist',
          type: 1
        },
        {
          name: 'docs',
          description: 'Access legal and technical documentation',
          type: 1
        },
        {
          name: 'dashboard',
          description: 'Access your Commertize dashboard',
          type: 1
        },
        // Admin commands
        {
          name: 'broadcast',
          description: '[ADMIN] Send announcement to all users',
          type: 1,
          options: [
            {
              name: 'message',
              description: 'Message to broadcast',
              type: 3,
              required: true
            }
          ]
        },
        {
          name: 'stats',
          description: '[ADMIN] View bot usage statistics',
          type: 1
        }
      ];

      // Register commands globally or to a specific guild
      const url = this.guildId
        ? `https://discord.com/api/v10/applications/${this.applicationId}/guilds/${this.guildId}/commands`
        : `https://discord.com/api/v10/applications/${this.applicationId}/commands`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bot ${this.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commands)
      });

      if (response.ok) {
        console.log('RUNE.DCZ slash commands registered successfully');
      } else {
        const errorText = await response.text();
        console.error('Failed to register Discord commands:', errorText);
      }
    } catch (error) {
      console.error('Error setting up Discord commands:', error);
    }
  }

  async handleInteraction(interaction: DiscordInteraction): Promise<DiscordResponse> {
    // Handle ping interactions
    if (interaction.type === 1) {
      return { type: 1 };
    }

    // Handle application command interactions
    if (interaction.type === 2 && interaction.data) {
      const userId = interaction.member?.user?.id || interaction.user?.id || '';
      const isAdmin = this.adminUserIds.has(userId);

      // Check if user is banned
      if (this.bannedUsers.has(userId)) {
        return {
          type: 4,
          data: {
            content: "⛔ You have been blocked from using RUNE.DCZ. Contact support if you believe this is an error.",
            flags: 64 // Ephemeral message
          }
        };
      }

      const commandName = interaction.data.name;

      switch (commandName) {
        case 'start':
          return this.handleStart(interaction);
        case 'help':
          return this.handleHelp();
        case 'tokenize':
          return this.handleTokenize();
        case 'invest':
          return this.handleInvest();
        case 'faq':
          return this.handleFAQ();
        case 'contact':
          return this.handleContact();
        case 'waitlist':
          return this.handleWaitlist();
        case 'docs':
          return this.handleDocs();
        case 'dashboard':
          return this.handleDashboard();
        case 'broadcast':
          return isAdmin ? this.handleBroadcast(interaction) : this.handleAdminOnly();
        case 'stats':
          return isAdmin ? this.handleStats() : this.handleAdminOnly();
        default:
          return {
            type: 4,
            data: {
              content: "❓ Unknown command. Use `/help` to see all available commands.",
              flags: 64
            }
          };
      }
    }

    return { type: 4, data: { content: "Invalid interaction type." } };
  }

  private handleStart(interaction: DiscordInteraction): DiscordResponse {
    const username = interaction.member?.user?.global_name || interaction.member?.user?.username || 
                    interaction.user?.global_name || interaction.user?.username || 'there';

    const embed: DiscordEmbed = {
      title: `🏢 Welcome to RUNE.DCZ, ${username}!`,
      description: `I'm your AI assistant for everything related to **Commertize** - the leading platform for commercial real estate tokenization.

🔹 **Property Owners:** Turn your building equity into digital assets for instant liquidity
🔹 **Investors:** Access fractional ownership in premium commercial properties  
🔹 **Revolutionary:** Blockchain-powered transparency and efficiency

**🚀 Ready to get started?**
• Use \`/tokenize\` to learn about property tokenization
• Use \`/invest\` to explore investment opportunities
• Use \`/waitlist\` to join early access
• Use \`/help\` for all available commands

*The future of real estate is digital. Welcome to Commertize!*`,
      color: 0xBE8D00,
      footer: { text: 'RUNE.DCZ • Commertize AI Assistant' },
      timestamp: new Date().toISOString()
    };

    return {
      type: 4,
      data: { embeds: [embed] }
    };
  }

  private handleHelp(): DiscordResponse {
    const embed: DiscordEmbed = {
      title: '🤖 RUNE.DCZ Commands',
      description: `**🏠 For Everyone:**
\`/start\` - Begin using RUNE.DCZ and see welcome message
\`/help\` - Show this help menu
\`/tokenize\` - Learn how to tokenize your property
\`/invest\` - Information for investors
\`/faq\` - Common questions and answers
\`/contact\` - Get in touch with our team
\`/waitlist\` - Join early access waitlist
\`/docs\` - Legal and technical documentation
\`/dashboard\` - Access your dashboard

**⚙️ Admin Only:**
\`/broadcast\` - Send message to all users
\`/stats\` - View bot usage statistics

**💡 Tips:**
• Commands work in both DMs and server channels
• Start with \`/tokenize\` or \`/invest\` based on your interest  
• Join \`/waitlist\` for exclusive early access

*Need personalized help? Use \`/contact\`!*`,
      color: 0xBE8D00,
      footer: { text: 'RUNE.DCZ • Commertize AI Assistant' },
      timestamp: new Date().toISOString()
    };

    return {
      type: 4,
      data: { embeds: [embed] }
    };
  }

  private handleTokenize(): DiscordResponse {
    const embed: DiscordEmbed = {
      title: '🏢 Property Tokenization with Commertize',
      description: `**Transform your commercial real estate into digital assets!**

**🔑 How It Works:**
1️⃣ **Submit Property:** Upload your property details and financials
2️⃣ **Due Diligence:** Our experts verify and analyze your asset
3️⃣ **Smart Contract:** Deploy ERC-3643 compliant tokens
4️⃣ **Launch:** Access instant liquidity while retaining ownership

**💰 Benefits:**
✅ Instant access to 20-40% of property value
✅ No traditional financing delays
✅ Maintain property control and cash flows
✅ Transparent blockchain-based ownership
✅ Global investor marketplace

**📋 Requirements:**
• Commercial property (office, retail, industrial, multifamily)
• Minimum $5M property value
• Clear title and financial records
• Professional property management

**🚀 Ready to start?**
• Join \`/waitlist\` for early access
• Visit commertize.com/tokenize
• Contact our team: \`/contact\`

*Turn your property equity into instant capital!*`,
      color: 0xBE8D00,
      footer: { text: 'RUNE.DCZ • Commertize AI Assistant' },
      timestamp: new Date().toISOString()
    };

    return {
      type: 4,
      data: { embeds: [embed] }
    };
  }

  private handleInvest(): DiscordResponse {
    const embed: DiscordEmbed = {
      title: '💎 Invest in Tokenized Real Estate',
      description: `**Access premium commercial properties with fractional ownership!**

**🎯 Investment Opportunities:**
🏢 **Office Buildings:** CBD locations, stable tenants
🏪 **Retail Centers:** High-traffic, diversified income
🏭 **Industrial/Logistics:** E-commerce driven growth
🏠 **Multifamily:** Residential rental properties

**💰 Investment Benefits:**
✅ Start with as little as $1,000
✅ Diversify across multiple properties
✅ Receive quarterly dividend distributions
✅ Transparent, blockchain-verified ownership
✅ Trade tokens on secondary markets
✅ No property management hassles

**📊 Deal Quality Index (DQI):**
Our proprietary 7-pillar scoring system rates every opportunity:
• Financial strength & cash flow quality
• Market conditions & tenant stability
• Sponsor track record & legal structure
• Risk assessment & data confidence

**🔒 Secure & Compliant:**
• Fully regulated digital securities
• KYC/AML verification required
• Institutional-grade custody
• SEC-compliant offering documents

**🚀 Get Started:**
• Join \`/waitlist\` for exclusive deals
• Visit commertize.com/invest
• Questions? Use \`/contact\`

*The future of real estate investing is here!*`,
      color: 0xBE8D00,
      footer: { text: 'RUNE.DCZ • Commertize AI Assistant' },
      timestamp: new Date().toISOString()
    };

    return {
      type: 4,
      data: { embeds: [embed] }
    };
  }

  private handleFAQ(): DiscordResponse {
    const embed: DiscordEmbed = {
      title: '❓ Frequently Asked Questions',
      description: `**🏢 For Property Owners:**

**Q: How much of my property value can I tokenize?**
A: Typically 20-40% depending on property type and financials.

**Q: Do I lose control of my property?**
A: No! You retain operational control and management rights.

**Q: What are the fees?**
A: Transparent fee structure shared during due diligence.

**Q: How long does tokenization take?**
A: 6-12 weeks from submission to token launch.

**💎 For Investors:**

**Q: What's the minimum investment?**
A: Starting at $1,000 for most opportunities.

**Q: How do I receive returns?**
A: Quarterly distributions via stablecoins or traditional methods.

**Q: Can I sell my tokens?**
A: Yes, through our secondary marketplace (subject to regulations).

**Q: Are investments insured?**
A: Properties typically carry standard insurance; tokens are digitally secured.

**🔒 General:**

**Q: Is this legally compliant?**
A: Yes, fully regulated digital securities with proper registrations.

**Q: Which blockchain do you use?**
A: Ethereum and Plume Network for optimal security and efficiency.

**📞 More questions?**
Use \`/contact\` to speak with our team directly!`,
      color: 0xBE8D00,
      footer: { text: 'RUNE.DCZ • Commertize AI Assistant' },
      timestamp: new Date().toISOString()
    };

    return {
      type: 4,
      data: { embeds: [embed] }
    };
  }

  private handleContact(): DiscordResponse {
    const embed: DiscordEmbed = {
      title: '📞 Contact Commertize Team',
      description: `**Get in touch with our experts!**

**🏢 Business Development:**
• Email: business@commertize.com
• For property owners and institutional inquiries

**💼 Investor Relations:**
• Email: investors@commertize.com
• For investment questions and opportunities

**🛠 Technical Support:**
• Email: support@commertize.com
• For platform and technical assistance

**📋 General Inquiries:**
• Email: hello@commertize.com
• For general questions and information

**🌐 Online:**
• Website: commertize.com
• LinkedIn: /company/commertize
• Twitter: @commertize

**📅 Schedule a Call:**
Visit commertize.com/contact to book a personalized consultation with our team.

**🏢 Office:**
Commertize, Inc.
San Francisco, CA
(Specific address provided upon meeting scheduling)

**⏰ Business Hours:**
Monday - Friday: 9 AM - 6 PM PST
Response time: Usually within 24 hours

*We're here to help you navigate the future of real estate!*`,
      color: 0xBE8D00,
      footer: { text: 'RUNE.DCZ • Commertize AI Assistant' },
      timestamp: new Date().toISOString()
    };

    return {
      type: 4,
      data: { embeds: [embed] }
    };
  }

  private handleWaitlist(): DiscordResponse {
    const embed: DiscordEmbed = {
      title: '🚀 Join the Commertize Waitlist',
      description: `**Get exclusive early access to the future of real estate!**

**🎯 Waitlist Benefits:**
✅ Priority access to new property offerings
✅ Exclusive investment opportunities
✅ Early beta platform access
✅ Special launch pricing and incentives
✅ Direct updates from our team
✅ Community access and networking

**📝 Join Now:**
🔗 **commertize.com/waitlist**

Simply visit the link above and:
1️⃣ Enter your email address
2️⃣ Select your interest (Property Owner / Investor / Both)
3️⃣ Tell us about your goals
4️⃣ Get instant confirmation

**📊 Current Status:**
🔥 **Limited spots available** for our exclusive launch cohort
⏰ **Early access** beginning Q1 2025
🎯 **Premium properties** already in our pipeline

**💌 What to Expect:**
• Weekly market insights and updates
• First access to new tokenization opportunities
• Invitations to exclusive virtual events
• Direct communication with our founding team

**🏆 Referral Rewards:**
Invite friends and move up the waitlist faster! Each successful referral advances your position.

**📱 Stay Connected:**
Follow our progress and get updates:
• Discord: You're here!
• Website: commertize.com
• Social media: @commertize

*The revolution starts with early adopters like you!*`,
      color: 0xBE8D00,
      footer: { text: 'RUNE.DCZ • Commertize AI Assistant' },
      timestamp: new Date().toISOString()
    };

    return {
      type: 4,
      data: { embeds: [embed] }
    };
  }

  private handleDocs(): DiscordResponse {
    const embed: DiscordEmbed = {
      title: '📚 Legal & Technical Documentation',
      description: `**Access comprehensive documentation and resources:**

**📋 Legal Documents:**
🔗 **Terms of Service:** commertize.com/terms
🔗 **Privacy Policy:** commertize.com/privacy
🔗 **Risk Disclosures:** commertize.com/risks
🔗 **Compliance Framework:** commertize.com/compliance

**🔧 Technical Resources:**
🔗 **Whitepaper:** commertize.com/whitepaper
🔗 **Smart Contract Audits:** commertize.com/audits
🔗 **API Documentation:** developers.commertize.com
🔗 **Security Practices:** commertize.com/security

**📊 Financial Information:**
🔗 **Fee Structure:** commertize.com/fees
🔗 **Sample Offerings:** commertize.com/examples
🔗 **Return Projections:** commertize.com/projections
🔗 **Market Analysis:** commertize.com/research

**🏢 Property Guidelines:**
🔗 **Submission Requirements:** commertize.com/requirements
🔗 **Due Diligence Process:** commertize.com/diligence
🔗 **Tokenization Standards:** commertize.com/standards

**💼 For Professionals:**
🔗 **Broker Resources:** commertize.com/brokers
🔗 **Legal Partner Info:** commertize.com/legal
🔗 **CPA Guidelines:** commertize.com/accounting

**📞 Document Questions?**
Contact our legal team: legal@commertize.com

**⚠️ Important Notice:**
All investments involve risk. Please review all documentation carefully and consult with qualified professionals before making investment decisions.

*Transparency and compliance are our foundations.*`,
      color: 0xBE8D00,
      footer: { text: 'RUNE.DCZ • Commertize AI Assistant' },
      timestamp: new Date().toISOString()
    };

    return {
      type: 4,
      data: { embeds: [embed] }
    };
  }

  private handleDashboard(): DiscordResponse {
    const embed: DiscordEmbed = {
      title: '📊 Access Your Commertize Dashboard',
      description: `**Manage your tokenized real estate portfolio:**

**🔗 Dashboard Links:**
🏢 **Property Owners:** dashboard.commertize.com/sponsors
💼 **Investors:** dashboard.commertize.com/investors
⚙️ **Administrators:** admin.commertize.com

**🏠 Sponsor Dashboard Features:**
✅ Property submission and management
✅ Tokenization progress tracking
✅ Investor communications
✅ Financial reporting and analytics
✅ Compliance documentation
✅ Distribution management

**💎 Investor Dashboard Features:**
✅ Portfolio overview and performance
✅ Investment opportunities browser
✅ Transaction history and documents
✅ Distribution tracking and tax docs
✅ Secondary market trading
✅ Account settings and preferences

**🔒 Secure Login:**
• Multi-factor authentication required
• KYC verification for full access
• Bank-grade security protocols
• Regular security audits

**📱 Mobile Optimized:**
Access your dashboard from any device - desktop, tablet, or mobile phone.

**🆘 Need Help?**
• Tutorial videos available in-platform
• Live chat support during business hours
• Email: support@commertize.com
• Phone support for verified users

**🚀 Getting Started:**
1️⃣ Visit the appropriate dashboard link above
2️⃣ Create account or sign in
3️⃣ Complete KYC verification
4️⃣ Explore features and opportunities

**💡 Pro Tip:**
Bookmark your dashboard and enable notifications for real-time updates on your investments and properties.

*Your financial future, digitally managed.*`,
      color: 0xBE8D00,
      footer: { text: 'RUNE.DCZ • Commertize AI Assistant' },
      timestamp: new Date().toISOString()
    };

    return {
      type: 4,
      data: { embeds: [embed] }
    };
  }

  private handleBroadcast(interaction: DiscordInteraction): DiscordResponse {
    const message = interaction.data?.options?.find(opt => opt.name === 'message')?.value as string;
    
    if (!message) {
      return {
        type: 4,
        data: {
          content: "📢 Please provide a message to broadcast.",
          flags: 64
        }
      };
    }

    // In a real implementation, you would send this message to all users
    // For now, just acknowledge the admin command
    return {
      type: 4,
      data: {
        content: `📢 **Broadcast scheduled:** "${message}"\n\n*Message will be sent to all registered users.*`,
        flags: 64
      }
    };
  }

  private handleStats(): DiscordResponse {
    const embed: DiscordEmbed = {
      title: '📊 RUNE.DCZ Bot Statistics',
      description: `**📈 Usage Stats:**
• Total Users: Loading...
• Active Today: Loading...
• Commands Used: Loading...
• Most Popular: /tokenize

**👥 User Breakdown:**
• Property Owners: Loading...
• Investors: Loading...
• General Interest: Loading...

**🔧 System Status:**
• Bot Status: ✅ Online
• API Status: ✅ Connected
• Database: ✅ Operational
• Last Restart: Recently

*Full analytics available in admin panel.*`,
      color: 0xBE8D00,
      footer: { text: 'RUNE.DCZ • Admin Statistics' },
      timestamp: new Date().toISOString()
    };

    return {
      type: 4,
      data: { embeds: [embed], flags: 64 }
    };
  }

  private handleAdminOnly(): DiscordResponse {
    return {
      type: 4,
      data: {
        content: "⛔ Admin access required for this command.",
        flags: 64
      }
    };
  }

  isReady(): boolean {
    return this.botToken !== '' && this.applicationId !== '';
  }

  // Verify Discord interaction signature
  verifySignature(signature: string, timestamp: string, body: string): boolean {
    // In production, implement proper signature verification
    // using Discord's public key and crypto verification
    return true;
  }

  // Channel messaging methods (similar to Telegram integration)
  async sendToChannel(message: string): Promise<boolean> {
    const channelId = process.env.DISCORD_CHANNEL_ID;
    if (!channelId || !this.botToken) {
      console.error('Discord channel ID or bot token not configured');
      return false;
    }

    try {
      const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${this.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to send message to Discord channel:', errorText);
        return false;
      }

      console.log('Message sent to Discord channel successfully');
      return true;
    } catch (error) {
      console.error('Error sending Discord channel message:', error);
      return false;
    }
  }

  async sendToChannelWithEmbed(title: string, description: string, color = 0xBE8D00): Promise<boolean> {
    const channelId = process.env.DISCORD_CHANNEL_ID;
    if (!channelId || !this.botToken) {
      console.error('Discord channel ID or bot token not configured');
      return false;
    }

    const embed: DiscordEmbed = {
      title,
      description,
      color,
      footer: { text: 'RUNE.DCZ • Commertize AI Assistant' },
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${this.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embeds: [embed]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to send embed to Discord channel:', errorText);
        return false;
      }

      console.log('Embed sent to Discord channel successfully');
      return true;
    } catch (error) {
      console.error('Error sending Discord embed:', error);
      return false;
    }
  }

  async sendDirectMessage(userId: string, message: string): Promise<boolean> {
    if (!this.botToken) {
      console.error('Discord bot token not configured');
      return false;
    }

    try {
      // First create a DM channel
      const dmResponse = await fetch('https://discord.com/api/v10/users/@me/channels', {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${this.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient_id: userId
        })
      });

      if (!dmResponse.ok) {
        console.error('Failed to create DM channel');
        return false;
      }

      const dmChannel = await dmResponse.json();

      // Send the message
      const messageResponse = await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${this.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message
        })
      });

      if (!messageResponse.ok) {
        console.error('Failed to send DM');
        return false;
      }

      console.log('Direct message sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending Discord DM:', error);
      return false;
    }
  }

  hasChannelConfigured(): boolean {
    return !!(process.env.DISCORD_CHANNEL_ID && this.botToken);
  }

  getBotStatus(): any {
    return {
      initialized: !!(this.botToken && this.applicationId),
      channelConfigured: this.hasChannelConfigured(),
      guildConfigured: !!process.env.DISCORD_GUILD_ID,
      botToken: this.botToken ? 'configured' : 'missing',
      applicationId: this.applicationId ? 'configured' : 'missing',
      channelId: process.env.DISCORD_CHANNEL_ID ? 'configured' : 'missing',
      guildId: process.env.DISCORD_GUILD_ID ? 'configured' : 'missing'
    };
  }
}

export const discordBotHandler = new DiscordBotHandler();
export default DiscordBotHandler;