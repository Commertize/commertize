interface DiscordPostData {
  content: string;
  embeds?: DiscordEmbed[];
  files?: string[];
}

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  image?: { url: string };
  thumbnail?: { url: string };
  footer?: { text: string };
  timestamp?: string;
}

class DiscordApiService {
  private webhookUrl: string | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeWebhook();
  }

  private initializeWebhook() {
    try {
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

      if (!webhookUrl) {
        console.log('Discord webhook URL not provided - Discord integration disabled');
        return;
      }

      this.webhookUrl = webhookUrl;
      this.isInitialized = true;
      console.log('Discord API client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Discord API client:', error);
    }
  }

  async sendMessage(data: DiscordPostData): Promise<any> {
    if (!this.isInitialized || !this.webhookUrl) {
      throw new Error('Discord API client not initialized');
    }

    try {
      const payload = {
        content: data.content,
        embeds: data.embeds || [],
        username: 'Commertize',
        avatar_url: 'https://commertize.com/assets/commertize-logo.png'
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Discord API error: ${response.status} ${errorText}`);
      }

      console.log('Discord message sent successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to send Discord message:', error);
      throw error;
    }
  }

  async sendEmbed(title: string, description: string, imageUrl?: string, color = 0xBE8D00): Promise<any> {
    const embed: DiscordEmbed = {
      title,
      description,
      color,
      footer: { text: 'Commertize - Commercial Real Estate Tokenization' },
      timestamp: new Date().toISOString()
    };

    if (imageUrl) {
      embed.image = { url: imageUrl };
    }

    return await this.sendMessage({
      content: '',
      embeds: [embed]
    });
  }

  async sendAnnouncement(content: string, imageUrl?: string): Promise<any> {
    const embed: DiscordEmbed = {
      title: '📢 Commertize Update',
      description: content,
      color: 0xBE8D00,
      footer: { text: 'Join the future of real estate at Commertize.com' },
      timestamp: new Date().toISOString()
    };

    if (imageUrl) {
      embed.thumbnail = { url: imageUrl };
    }

    return await this.sendMessage({
      content: '@everyone',
      embeds: [embed]
    });
  }

  isReady(): boolean {
    return this.isInitialized && this.webhookUrl !== null;
  }
}

export const discordApiService = new DiscordApiService();
export default DiscordApiService;