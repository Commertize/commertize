import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs';
import path from 'path';

interface XPostData {
  text: string;
  media?: string[];
  poll?: {
    options: string[];
    duration_minutes: number;
  };
}

interface XEngagementData {
  mentions: any[];
  directMessages: any[];
  replies: any[];
}

class XApiService {
  private client: TwitterApi | null = null;
  private isInitialized = false;
  
  // Rate limiting tracking
  private dailyPostCount = 0;
  private dailyActionCount = 0;
  private lastResetDate = new Date().toDateString();
  
  // Rate limits based on X API tiers - BASIC PLAN
  private readonly RATE_LIMITS = {
    DAILY_POSTS: 100, // Basic tier limit (3,000/month ≈ 100/day)
    DAILY_ACTIONS: 500, // Combined likes, follows, retweets per day
    HOURLY_POSTS: 15, // More generous hourly limit for Basic
    POSTS_PER_MINUTE: 1 // Never more than 1 post per minute
  };
  
  private lastPostTime = 0;

  constructor() {
    this.initializeClient();
    this.resetDailyCountsIfNeeded();
  }

  private initializeClient() {
    try {
      const apiKey = process.env.X_API_KEY;
      const apiSecret = process.env.X_API_SECRET;
      const accessToken = process.env.X_ACCESS_TOKEN;
      const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;

      if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
        console.log('X API credentials not provided - X integration disabled');
        return;
      }

      this.client = new TwitterApi({
        appKey: apiKey,
        appSecret: apiSecret,
        accessToken: accessToken,
        accessSecret: accessTokenSecret,
      });

      this.isInitialized = true;
      console.log('X API client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize X API client:', error);
    }
  }

  isReady(): boolean {
    return this.isInitialized && this.client !== null;
  }

  async postTweet(data: XPostData): Promise<any> {
    if (!this.isInitialized || !this.client) {
      console.error('❌ X API client not initialized - missing credentials');
      throw new Error('X API client not initialized');
    }

    // Check rate limits before posting
    this.resetDailyCountsIfNeeded();
    
    if (this.dailyPostCount >= this.RATE_LIMITS.DAILY_POSTS) {
      console.warn(`❌ Daily post limit reached (${this.RATE_LIMITS.DAILY_POSTS}). Skipping tweet.`);
      throw new Error(`Daily posting limit of ${this.RATE_LIMITS.DAILY_POSTS} reached`);
    }

    // Ensure minimum time between posts (1 minute)
    const now = Date.now();
    const timeSinceLastPost = now - this.lastPostTime;
    const minimumInterval = 60 * 1000; // 1 minute

    if (timeSinceLastPost < minimumInterval) {
      const waitTime = minimumInterval - timeSinceLastPost;
      console.log(`⏳ Rate limiting: waiting ${Math.round(waitTime/1000)}s before next post`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    try {
      const tweetData: any = { text: data.text };

      // Add media if provided
      if (data.media && data.media.length > 0) {
        console.log(`📸 Uploading ${data.media.length} media file(s) for tweet`);
        const mediaIds = await this.uploadMedia(data.media);
        if (mediaIds.length > 0) {
          tweetData.media = { media_ids: mediaIds };
          console.log(`✅ Media attached to tweet: ${mediaIds.length} files`);
        } else {
          console.log('⚠️ No media IDs returned - posting text-only tweet');
        }
      }

      // Add poll if provided
      if (data.poll) {
        tweetData.poll = {
          options: data.poll.options,
          duration_minutes: data.poll.duration_minutes
        };
      }

      const tweet = await this.client.v2.tweet(tweetData);
      
      // Update rate limiting counters
      this.dailyPostCount++;
      this.lastPostTime = Date.now();
      
      console.log(`✅ Tweet posted successfully: ${tweet.data.id} (${this.dailyPostCount}/${this.RATE_LIMITS.DAILY_POSTS} daily)`);
      return tweet;
    } catch (error) {
      console.error('Failed to post tweet:', error);
      throw error;
    }
  }

  async uploadMedia(mediaPaths: string[]): Promise<string[]> {
    if (!this.client) {
      throw new Error('X API client not initialized');
    }

    const mediaIds: string[] = [];
    
    for (const mediaPath of mediaPaths) {
      try {
        // Resolve absolute path
        const absolutePath = path.isAbsolute(mediaPath) ? mediaPath : path.resolve(process.cwd(), mediaPath);
        
        // Check if file exists
        if (fs.existsSync(absolutePath)) {
          const isVideo = this.isVideoFile(absolutePath);
          console.log(`📤 Uploading ${isVideo ? 'video' : 'image'}: ${path.basename(absolutePath)}`);
          
          if (isVideo) {
            // Use chunked upload for videos
            const mediaId = await this.uploadVideoMedia(absolutePath);
            mediaIds.push(mediaId);
            console.log(`✅ Video uploaded successfully: ${path.basename(absolutePath)} (ID: ${mediaId})`);
          } else {
            // Standard upload for images
            const mediaId = await this.client.v1.uploadMedia(absolutePath);
            mediaIds.push(mediaId);
            console.log(`✅ Image uploaded successfully: ${path.basename(absolutePath)} (ID: ${mediaId})`);
          }
        } else {
          console.error(`❌ Media file not found: ${absolutePath}`);
          console.error(`   Original path: ${mediaPath}`);
          console.error(`   Current working directory: ${process.cwd()}`);
        }
      } catch (error) {
        console.error(`Failed to upload media ${mediaPath}:`, error);
      }
    }

    return mediaIds;
  }

  private isVideoFile(filePath: string): boolean {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.gif'];
    const ext = path.extname(filePath).toLowerCase();
    return videoExtensions.includes(ext);
  }

  private async uploadVideoMedia(videoPath: string): Promise<string> {
    if (!this.client) {
      throw new Error('X API client not initialized');
    }

    try {
      // Get file stats
      const stats = fs.statSync(videoPath);
      const totalBytes = stats.size;
      
      // Check file size limits (512MB for Basic plan)
      const maxSize = 512 * 1024 * 1024; // 512MB
      if (totalBytes > maxSize) {
        throw new Error(`Video file too large: ${totalBytes} bytes (max: ${maxSize} bytes)`);
      }

      // Determine media type
      const ext = path.extname(videoPath).toLowerCase();
      const mediaType = ext === '.gif' ? 'image/gif' : 
                       ext === '.mp4' ? 'video/mp4' : 
                       ext === '.mov' ? 'video/quicktime' : 'video/mp4';

      // Use standard upload for smaller files/GIFs, chunked for videos
      if (ext === '.gif' || totalBytes < 5 * 1024 * 1024) { // < 5MB
        return await this.client.v1.uploadMedia(videoPath);
      } else {
        // Chunked upload for larger videos
        return await this.client.v1.uploadMedia(videoPath, {
          type: 'chunked',
          mediaCategory: 'tweet_video'
        });
      }
    } catch (error) {
      console.error(`Failed to upload video ${videoPath}:`, error);
      throw error;
    }
  }

  async getMentions(since_id?: string): Promise<any[]> {
    if (!this.isInitialized || !this.client) {
      return [];
    }

    try {
      const mentions = await this.client.v2.userMentionTimeline('me', {
        max_results: 50,
        since_id: since_id,
        'tweet.fields': ['created_at', 'author_id', 'conversation_id']
      });

      return mentions.data?.data || [];
    } catch (error) {
      console.error('Failed to get mentions:', error);
      return [];
    }
  }

  async replyToTweet(tweetId: string, replyText: string): Promise<any> {
    if (!this.isInitialized || !this.client) {
      throw new Error('X API client not initialized');
    }

    try {
      const reply = await this.client.v2.tweet({
        text: replyText,
        reply: { in_reply_to_tweet_id: tweetId }
      });

      console.log('Reply posted successfully:', reply.data.id);
      return reply;
    } catch (error) {
      console.error('Failed to reply to tweet:', error);
      throw error;
    }
  }

  async likeTweet(tweetId: string): Promise<boolean> {
    if (!this.isInitialized || !this.client) {
      return false;
    }

    this.resetDailyCountsIfNeeded();
    
    if (this.dailyActionCount >= this.RATE_LIMITS.DAILY_ACTIONS) {
      console.warn(`❌ Daily action limit reached (${this.RATE_LIMITS.DAILY_ACTIONS}). Skipping like.`);
      return false;
    }

    try {
      await this.client.v2.like('me', tweetId);
      this.dailyActionCount++;
      console.log(`✅ Tweet liked (${this.dailyActionCount}/${this.RATE_LIMITS.DAILY_ACTIONS} daily actions)`);
      return true;
    } catch (error) {
      console.error('Failed to like tweet:', error);
      return false;
    }
  }

  async retweetPost(tweetId: string): Promise<boolean> {
    if (!this.isInitialized || !this.client) {
      return false;
    }

    try {
      await this.client.v2.retweet('me', tweetId);
      return true;
    } catch (error) {
      console.error('Failed to retweet:', error);
      return false;
    }
  }

  async searchTweets(query: string, maxResults = 10): Promise<any[]> {
    if (!this.isInitialized || !this.client) {
      return [];
    }

    try {
      const searchResults = await this.client.v2.search(query, {
        max_results: maxResults,
        'tweet.fields': ['created_at', 'author_id', 'public_metrics'],
        'user.fields': ['username', 'public_metrics']
      });

      return searchResults.data?.data || [];
    } catch (error) {
      console.error('Failed to search tweets:', error);
      return [];
    }
  }

  async followUser(userId: string): Promise<boolean> {
    if (!this.isInitialized || !this.client) {
      return false;
    }

    this.resetDailyCountsIfNeeded();
    
    if (this.dailyActionCount >= this.RATE_LIMITS.DAILY_ACTIONS) {
      console.warn(`❌ Daily action limit reached (${this.RATE_LIMITS.DAILY_ACTIONS}). Skipping follow.`);
      return false;
    }

    try {
      await this.client.v2.follow('me', userId);
      this.dailyActionCount++;
      console.log(`✅ Successfully followed user: ${userId} (${this.dailyActionCount}/${this.RATE_LIMITS.DAILY_ACTIONS} daily actions)`);
      return true;
    } catch (error) {
      console.error('Failed to follow user:', error);
      return false;
    }
  }

  async getUserByUsername(username: string): Promise<any> {
    if (!this.isInitialized || !this.client) {
      return null;
    }

    try {
      const user = await this.client.v2.userByUsername(username, {
        'user.fields': ['public_metrics', 'description', 'verified']
      });
      return user.data;
    } catch (error) {
      console.error(`Failed to get user ${username}:`, error);
      return null;
    }
  }

  async getAccountMetrics(): Promise<any> {
    if (!this.isInitialized || !this.client) {
      return null;
    }

    try {
      const user = await this.client.v2.me({
        'user.fields': ['public_metrics', 'created_at', 'description']
      });

      return {
        followers: user.data.public_metrics?.followers_count || 0,
        following: user.data.public_metrics?.following_count || 0,
        tweets: user.data.public_metrics?.tweet_count || 0,
        listed: user.data.public_metrics?.listed_count || 0
      };
    } catch (error) {
      console.error('Failed to get account metrics:', error);
      return null;
    }
  }

  private resetDailyCountsIfNeeded(): void {
    const currentDate = new Date().toDateString();
    if (currentDate !== this.lastResetDate) {
      this.dailyPostCount = 0;
      this.dailyActionCount = 0;
      this.lastResetDate = currentDate;
      console.log('🔄 Daily rate limits reset');
    }
  }

  getRateLimitStatus(): any {
    this.resetDailyCountsIfNeeded();
    return {
      dailyPosts: {
        used: this.dailyPostCount,
        limit: this.RATE_LIMITS.DAILY_POSTS,
        remaining: this.RATE_LIMITS.DAILY_POSTS - this.dailyPostCount
      },
      dailyActions: {
        used: this.dailyActionCount,
        limit: this.RATE_LIMITS.DAILY_ACTIONS,
        remaining: this.RATE_LIMITS.DAILY_ACTIONS - this.dailyActionCount
      },
      resetDate: this.lastResetDate
    };
  }

  updateRateLimits(newLimits: Partial<typeof this.RATE_LIMITS>): void {
    Object.assign(this.RATE_LIMITS, newLimits);
    console.log('✅ Rate limits updated:', this.RATE_LIMITS);
  }

  isReady(): boolean {
    return this.isInitialized && this.client !== null;
  }
}

export const xApiService = new XApiService();
export default XApiService;