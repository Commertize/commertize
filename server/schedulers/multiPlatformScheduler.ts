import cron from 'node-cron';
import { telegramApiService } from '../services/telegramApiService';
import { discordApiService } from '../services/discordApiService';
import { metaApiService } from '../services/metaApiService';
import { metaContentGenerator } from '../services/metaContentGenerator';
import { multiPlatformContentGenerator } from '../services/multiPlatformContentGenerator';
import { xScheduler } from './xScheduler';

interface PlatformStatus {
  telegram: boolean;
  discord: boolean;
  facebook: boolean;
  instagram: boolean;
}

class MultiPlatformScheduler {
  private isRunning = false;

  start() {
    if (this.isRunning) {
      console.log('Multi-platform scheduler already running');
      return;
    }

    console.log('Starting multi-platform social media scheduler...');

    // Morning cross-platform posts: 9:30 AM PT (after X posts)
    cron.schedule('30 17 * * *', async () => {
      await this.postMorningContentAllPlatforms();
    });

    // Afternoon cross-platform posts: 3:30 PM PT (after X posts)
    cron.schedule('30 23 * * *', async () => {
      await this.postAfternoonContentAllPlatforms();
    });

    // Telegram community updates: Every 3 hours during active hours
    cron.schedule('0 */3 8-20 * * *', async () => {
      await this.postTelegramCommunityUpdate();
    });

    // Discord community engagement: Every 4 hours
    cron.schedule('0 */4 * * *', async () => {
      await this.postDiscordEngagement();
    });

    // Facebook business updates: Twice daily (10 AM and 4 PM PT)
    cron.schedule('0 18,0 * * *', async () => {
      await this.postFacebookBusinessUpdate();
    });

    // Weekend special content: Saturday 10 AM PT
    cron.schedule('0 18 * * 6', async () => {
      await this.postWeekendSpecialContent();
    });

    this.isRunning = true;
    console.log('Multi-platform scheduler started successfully');
    console.log('- Cross-platform posts: 9:30 AM & 3:30 PM PT daily');
    console.log('- Telegram updates: Every 3 hours (8 AM - 8 PM PT)');  
    console.log('- Discord engagement: Every 4 hours');
    console.log('- Facebook posts: 10 AM & 4 PM PT daily');
    console.log('- Facebook focus: No Instagram (user preference)');
    console.log('- Weekend special: Saturday 10 AM PT');

    // Note: Initial posting removed to prevent immediate duplicate posts
  }

  async postMorningContentAllPlatforms() {
    try {
      console.log('Generating morning content for all platforms...');
      const content = await multiPlatformContentGenerator.generateMultiPlatformContent('morning');
      
      // Post to all available platforms simultaneously
      const promises = [];
      
      if (telegramApiService.isReady() && content.telegram) {
        promises.push(this.postToTelegram(content.telegram));
      }
      
      if (discordApiService.isReady() && content.discord) {
        promises.push(this.postToDiscord(content.discord));
      }
      
      if (metaApiService.isReady() && content.facebook) {
        promises.push(this.postToFacebook(content.facebook));
      }
      
      if (metaApiService.isInstagramReady() && content.instagram) {
        promises.push(this.postToInstagram(content.instagram));
      }
      
      await Promise.allSettled(promises);
      console.log('Morning cross-platform posting completed');
      
    } catch (error) {
      console.error('Failed to post morning content to all platforms:', error);
    }
  }

  async postAfternoonContentAllPlatforms() {
    try {
      console.log('Generating afternoon content for all platforms...');
      const content = await multiPlatformContentGenerator.generateMultiPlatformContent('afternoon');
      
      // Post to all available platforms simultaneously
      const promises = [];
      
      if (telegramApiService.isReady() && content.telegram) {
        promises.push(this.postToTelegram(content.telegram));
      }
      
      if (discordApiService.isReady() && content.discord) {
        promises.push(this.postToDiscord(content.discord));
      }
      
      if (metaApiService.isReady() && content.facebook) {
        promises.push(this.postToFacebook(content.facebook));
      }
      
      if (metaApiService.isInstagramReady() && content.instagram) {
        promises.push(this.postToInstagram(content.instagram));
      }
      
      await Promise.allSettled(promises);
      console.log('Afternoon cross-platform posting completed');
      
    } catch (error) {
      console.error('Failed to post afternoon content to all platforms:', error);
    }
  }

  async postTelegramCommunityUpdate() {
    if (!telegramApiService.isReady()) {
      return;
    }

    try {
      console.log('Posting Telegram community update...');
      const content = await multiPlatformContentGenerator.generatePlatformSpecificPost('telegram', 'community_update');
      await this.postToTelegram(content);
    } catch (error) {
      console.error('Failed to post Telegram community update:', error);
    }
  }

  async postDiscordEngagement() {
    if (!discordApiService.isReady()) {
      return;
    }

    try {
      console.log('Posting Discord engagement content...');
      const content = await multiPlatformContentGenerator.generatePlatformSpecificPost('discord', 'engagement');
      await this.postToDiscord(content);
    } catch (error) {
      console.error('Failed to post Discord engagement:', error);
    }
  }

  async postFacebookBusinessUpdate() {
    if (!metaApiService.isReady()) {
      console.log('Meta API not configured - skipping Facebook post');
      return;
    }

    try {
      console.log('Posting Facebook business update...');
      
      const content = await metaContentGenerator.generateFacebookContent();
      
      const postData = {
        message: `${content.text}\n\n${content.hashtags.join(' ')}`,
        link: 'https://commertize.com',
        media: content.media,
        platform: 'facebook' as const
      };
      
      await metaApiService.postToFacebook(postData);
      console.log('✅ Facebook business update posted successfully');
      
    } catch (error) {
      console.error('Failed to post Facebook update:', error);
    }
  }

  // Instagram posting removed - focusing on Facebook only per user preference

  async postWeekendSpecialContent() {
    try {
      console.log('Posting weekend special content...');
      const content = await multiPlatformContentGenerator.generateMultiPlatformContent('weekend_special');
      
      // Weekend posts go to all platforms
      const promises = [];
      
      if (telegramApiService.isReady() && content.telegram) {
        promises.push(this.postToTelegram(content.telegram));
      }
      
      if (discordApiService.isReady() && content.discord) {
        promises.push(this.postToDiscord(content.discord));
      }
      
      if (metaApiService.isReady() && content.facebook) {
        promises.push(this.postToFacebook(content.facebook));
      }
      
      if (metaApiService.isInstagramReady() && content.instagram) {
        promises.push(this.postToInstagram(content.instagram));
      }
      
      await Promise.allSettled(promises);
      console.log('Weekend special content posted across platforms');
      
    } catch (error) {
      console.error('Failed to post weekend special content:', error);
    }
  }

  // Platform-specific posting methods
  private async postToTelegram(content: any) {
    try {
      if (content.media && content.media.length > 0) {
        await telegramApiService.sendPhoto(content.media[0], content.text);
      } else {
        await telegramApiService.sendMessage({
          text: `${content.text}\n\n${content.hashtags.join(' ')}`,
          parse_mode: 'HTML'
        });
      }
      console.log('✅ Telegram post successful');
    } catch (error) {
      console.error('❌ Telegram posting failed:', error);
    }
  }

  private async postToDiscord(content: any) {
    try {
      if (content.embeds) {
        await discordApiService.sendMessage({
          content: content.text,
          embeds: content.embeds
        });
      } else {
        await discordApiService.sendEmbed(
          '🏢 Commertize Update',
          `${content.text}\n\n${content.hashtags.join(' ')}`,
          content.media?.[0]
        );
      }
      console.log('✅ Discord post successful');
    } catch (error) {
      console.error('❌ Discord posting failed:', error);
    }
  }

  private async postToFacebook(content: any) {
    try {
      await metaApiService.postToFacebook({
        message: `${content.text}\n\n${content.hashtags.join(' ')}`,
        platform: 'facebook'
      });
      console.log('✅ Facebook post successful');
    } catch (error) {
      console.error('❌ Facebook posting failed:', error);
    }
  }

  private async postToInstagram(content: any) {
    try {
      if (content.media && content.media.length > 0) {
        await metaApiService.postToInstagram({
          message: `${content.text}\n\n${content.hashtags.join(' ')}`,
          media: content.media,
          platform: 'instagram'
        });
        console.log('✅ Instagram post successful');
      } else {
        console.log('⏭️  Instagram post skipped (requires media)');
      }
    } catch (error) {
      console.error('❌ Instagram posting failed:', error);
    }
  }

  async postCustomContent(platforms: string[], text: string, media?: string[]) {
    const promises = [];
    
    for (const platform of platforms) {
      try {
        const content = await multiPlatformContentGenerator.generatePlatformSpecificPost(platform, 'custom');
        content.text = text;
        if (media) content.media = media;
        
        switch (platform) {
          case 'telegram':
            if (telegramApiService.isReady()) promises.push(this.postToTelegram(content));
            break;
          case 'discord':
            if (discordApiService.isReady()) promises.push(this.postToDiscord(content));
            break;
          case 'facebook':
            if (metaApiService.isReady()) promises.push(this.postToFacebook(content));
            break;
          case 'instagram':
            if (metaApiService.isInstagramReady()) promises.push(this.postToInstagram(content));
            break;
        }
      } catch (error) {
        console.error(`Failed to post to ${platform}:`, error);
      }
    }
    
    await Promise.allSettled(promises);
  }

  getPlatformStatus(): PlatformStatus {
    return {
      telegram: telegramApiService.isReady(),
      discord: discordApiService.isReady(),
      facebook: metaApiService.isReady(),
      instagram: metaApiService.isInstagramReady()
    };
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      platforms: this.getPlatformStatus(),
      scheduledPosts: [
        { time: '9:30 AM PT', type: 'Cross-platform Morning Content' },
        { time: '3:30 PM PT', type: 'Cross-platform Afternoon Content' },
        { time: 'Every 3hrs (8AM-8PM)', type: 'Telegram Community Updates' },
        { time: 'Every 4hrs', type: 'Discord Engagement' },
        { time: '10AM & 4PM PT', type: 'Facebook Business Updates' },
        { time: '12PM & 6PM PT', type: 'Instagram Visual Content' },
        { time: 'Saturday 10AM PT', type: 'Weekend Special Content' }
      ]
    };
  }

  stop() {
    this.isRunning = false;
    console.log('Multi-platform scheduler stopped');
  }
}

export const multiPlatformScheduler = new MultiPlatformScheduler();
export default MultiPlatformScheduler;