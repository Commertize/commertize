/**
 * Meta API Service - Facebook & Instagram Posting
 * Handles automated content posting to Meta platforms
 */

import fetch from 'node-fetch';

interface MetaPostData {
  message: string;
  link?: string;
  media?: string[];
  platform: 'facebook' | 'instagram';
  story?: boolean;
}

interface MetaResponse {
  success: boolean;
  postId?: string;
  error?: string;
}

class MetaApiService {
  private pageAccessToken: string | null = null;
  private instagramBusinessAccountId: string | null = null;
  private facebookPageId: string | null = null;

  constructor() {
    this.pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN || null;
    this.instagramBusinessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || null;
    this.facebookPageId = process.env.FACEBOOK_PAGE_ID || null;
  }

  isReady(): boolean {
    // Focus on Facebook only per user preference
    return !!(this.pageAccessToken && this.facebookPageId);
  }

  isInstagramReady(): boolean {
    return !!(this.pageAccessToken && this.instagramBusinessAccountId);
  }

  /**
   * Post to Facebook Page
   */
  async postToFacebook(data: MetaPostData): Promise<MetaResponse> {
    if (!this.isReady()) {
      throw new Error('Meta API not configured for Facebook posting');
    }

    try {
      const endpoint = `https://graph.facebook.com/v18.0/${this.facebookPageId}/feed`;
      
      const postData: any = {
        message: data.message,
        access_token: this.pageAccessToken
      };

      if (data.link) {
        postData.link = data.link;
      }

      // Handle media attachments
      if (data.media && data.media.length > 0) {
        // For single image
        if (data.media.length === 1) {
          postData.url = data.media[0];
          delete postData.message; // Use caption instead for photo posts
          postData.caption = data.message;
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });

      const result = await response.json() as any;

      if (result.error) {
        throw new Error(`Facebook API Error: ${result.error.message}`);
      }

      console.log(`✅ Facebook post published successfully: ${result.id}`);
      return {
        success: true,
        postId: result.id
      };

    } catch (error) {
      console.error('Facebook posting failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Post to Instagram Business Account
   */
  async postToInstagram(data: MetaPostData): Promise<MetaResponse> {
    if (!this.isInstagramReady()) {
      throw new Error('Meta API not configured for Instagram posting');
    }

    try {
      // Instagram requires media for posts
      if (!data.media || data.media.length === 0) {
        throw new Error('Instagram posts require media attachments');
      }

      // Step 1: Create media container
      const mediaEndpoint = `https://graph.facebook.com/v18.0/${this.instagramBusinessAccountId}/media`;
      
      const mediaData = {
        image_url: data.media[0], // Use first media item
        caption: data.message,
        access_token: this.pageAccessToken
      };

      const mediaResponse = await fetch(mediaEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mediaData)
      });

      const mediaResult = await mediaResponse.json() as any;

      if (mediaResult.error) {
        throw new Error(`Instagram Media API Error: ${mediaResult.error.message}`);
      }

      // Step 2: Publish the media container
      const publishEndpoint = `https://graph.facebook.com/v18.0/${this.instagramBusinessAccountId}/media_publish`;
      
      const publishData = {
        creation_id: mediaResult.id,
        access_token: this.pageAccessToken
      };

      const publishResponse = await fetch(publishEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(publishData)
      });

      const publishResult = await publishResponse.json() as any;

      if (publishResult.error) {
        throw new Error(`Instagram Publish API Error: ${publishResult.error.message}`);
      }

      console.log(`✅ Instagram post published successfully: ${publishResult.id}`);
      return {
        success: true,
        postId: publishResult.id
      };

    } catch (error) {
      console.error('Instagram posting failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Post to Instagram Story
   */
  async postToInstagramStory(data: MetaPostData): Promise<MetaResponse> {
    if (!this.isInstagramReady()) {
      throw new Error('Meta API not configured for Instagram Stories');
    }

    try {
      if (!data.media || data.media.length === 0) {
        throw new Error('Instagram Stories require media attachments');
      }

      const storyEndpoint = `https://graph.facebook.com/v18.0/${this.instagramBusinessAccountId}/media`;
      
      const storyData = {
        image_url: data.media[0],
        media_type: 'STORIES',
        access_token: this.pageAccessToken
      };

      const response = await fetch(storyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(storyData)
      });

      const result = await response.json() as any;

      if (result.error) {
        throw new Error(`Instagram Story API Error: ${result.error.message}`);
      }

      // Publish the story
      const publishData = {
        creation_id: result.id,
        access_token: this.pageAccessToken
      };

      const publishResponse = await fetch(`https://graph.facebook.com/v18.0/${this.instagramBusinessAccountId}/media_publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(publishData)
      });

      const publishResult = await publishResponse.json() as any;

      if (publishResult.error) {
        throw new Error(`Instagram Story Publish Error: ${publishResult.error.message}`);
      }

      console.log(`✅ Instagram Story published successfully: ${publishResult.id}`);
      return {
        success: true,
        postId: publishResult.id
      };

    } catch (error) {
      console.error('Instagram Story posting failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get Meta account analytics
   */
  async getAnalytics(): Promise<any> {
    if (!this.isReady()) {
      return null;
    }

    try {
      // Get Facebook page insights
      const fbInsightsEndpoint = `https://graph.facebook.com/v18.0/${this.facebookPageId}/insights?metric=page_engaged_users,page_post_engagements,page_fans&access_token=${this.pageAccessToken}`;
      
      const fbResponse = await fetch(fbInsightsEndpoint);
      const fbData = await fbResponse.json() as any;

      let instagramData = null;
      
      // Get Instagram insights if configured
      if (this.isInstagramReady()) {
        const igInsightsEndpoint = `https://graph.facebook.com/v18.0/${this.instagramBusinessAccountId}/insights?metric=impressions,reach,profile_views&period=day&access_token=${this.pageAccessToken}`;
        
        const igResponse = await fetch(igInsightsEndpoint);
        instagramData = await igResponse.json() as any;
      }

      return {
        facebook: fbData.data || [],
        instagram: instagramData?.data || []
      };

    } catch (error) {
      console.error('Failed to fetch Meta analytics:', error);
      return null;
    }
  }

  getStatus() {
    return {
      facebookReady: this.isReady(),
      instagramReady: this.isInstagramReady(),
      hasPageToken: !!this.pageAccessToken,
      hasFacebookPageId: !!this.facebookPageId,
      hasInstagramAccountId: !!this.instagramBusinessAccountId
    };
  }
}

export const metaApiService = new MetaApiService();
export default MetaApiService;