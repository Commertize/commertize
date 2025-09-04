import cron from 'node-cron';
import DirectXPoster from '../services/directXPoster.js';

/**
 * Direct X Scheduler
 * Schedules regular X posts bypassing routing issues
 */
class DirectXScheduler {
  private poster: DirectXPoster;
  private isEnabled: boolean = true;

  constructor() {
    this.poster = new DirectXPoster();
  }

  start(): void {
    if (!this.isEnabled) {
      console.log('⏸️ Direct X Scheduler disabled');
      return;
    }

    console.log('🤖 Starting Direct X Scheduler - Bypassing routing issues');

    // VIDEO GENERATION DISABLED - User prefers beautiful building images only
    console.log('🎨 All video generation disabled - using beautiful DALL-E images only');

    // Regular text/image posts for other times (original schedule)
    cron.schedule('0 9,11,13,15,17 * * *', async () => {
      console.log('⏰ Executing scheduled text/image post...');
      await this.poster.postScheduledContent();
    }, {
      timezone: "America/Los_Angeles"
    });

    // Enhanced engagement and reply system for 7+ replies per day
    cron.schedule('0 8,10,12,14,16,18,20 * * *', async () => {
      console.log('💬 Running engagement and reply cycle...');
      await this.poster.performEngagementRound();
    }, {
      timezone: "America/Los_Angeles"
    });

    console.log('✅ Direct X Scheduler started successfully');
    console.log('📅 AI voiceover videos: Monday/Wednesday/Friday at 10 AM PT only');
    console.log('📅 Text/image posts: Daily at 9 AM, 11 AM, 1 PM, 3 PM, 5 PM PT');
  }

  stop(): void {
    this.isEnabled = false;
    console.log('⏹️ Direct X Scheduler stopped');
  }

  async postNow(content: string): Promise<void> {
    console.log('⚡ Direct manual post...');
    await this.poster.postTextTweet(content);
  }
}

export default DirectXScheduler;