interface TelegramPostData {
  text: string;
  media?: string[];
  parse_mode?: 'HTML' | 'Markdown';
  disable_web_page_preview?: boolean;
}

class TelegramApiService {
  private botToken: string | null = null;
  private channelId: string | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeBot();
  }

  private initializeBot() {
    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const channelId = process.env.TELEGRAM_CHANNEL_ID;

      if (!botToken || !channelId) {
        console.log('Telegram credentials not provided - Telegram integration disabled');
        return;
      }

      this.botToken = botToken;
      this.channelId = channelId;
      this.isInitialized = true;
      console.log('Telegram API client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Telegram API client:', error);
    }
  }

  async sendMessage(data: TelegramPostData): Promise<any> {
    if (!this.isInitialized || !this.botToken || !this.channelId) {
      throw new Error('Telegram API client not initialized');
    }

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      
      const payload = {
        chat_id: this.channelId,
        text: data.text,
        parse_mode: data.parse_mode || 'HTML',
        disable_web_page_preview: data.disable_web_page_preview || false
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(`Telegram API error: ${result.description || 'Unknown error'}`);
      }

      console.log('Telegram message sent successfully:', result.result.message_id);
      return result;
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
      throw error;
    }
  }

  async sendPhoto(photoPath: string, caption: string): Promise<any> {
    if (!this.isInitialized || !this.botToken || !this.channelId) {
      throw new Error('Telegram API client not initialized');
    }

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendPhoto`;
      const formData = new FormData();
      
      // Read the image file
      const fs = await import('fs');
      const photoBuffer = fs.readFileSync(photoPath);
      
      formData.append('chat_id', this.channelId);
      formData.append('photo', new Blob([photoBuffer]), 'image.png');
      formData.append('caption', caption);
      formData.append('parse_mode', 'HTML');

      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(`Telegram API error: ${result.description || 'Unknown error'}`);
      }

      console.log('Telegram photo sent successfully:', result.result.message_id);
      return result;
    } catch (error) {
      console.error('Failed to send Telegram photo:', error);
      throw error;
    }
  }

  async getChannelInfo(): Promise<any> {
    if (!this.isInitialized || !this.botToken || !this.channelId) {
      return null;
    }

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/getChat`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.channelId
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(`Telegram API error: ${result.description || 'Unknown error'}`);
      }

      return {
        title: result.result.title,
        members: result.result.members_count || 0,
        description: result.result.description || ''
      };
    } catch (error) {
      console.error('Failed to get Telegram channel info:', error);
      return null;
    }
  }

  isReady(): boolean {
    return this.isInitialized && this.botToken !== null && this.channelId !== null;
  }
}

export const telegramApiService = new TelegramApiService();
export default TelegramApiService;