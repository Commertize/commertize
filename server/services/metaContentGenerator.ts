/**
 * Meta Content Generator - Facebook & Instagram Optimized Content
 * Creates platform-specific content for Meta properties
 */

import { xContentGeneratorFixed } from './xContentGeneratorFixed';

interface MetaContent {
  text: string;
  hashtags: string[];
  media?: string[];
  platform: 'facebook' | 'instagram';
  contentType: 'feed' | 'story' | 'reel';
}

class MetaContentGenerator {
  
  /**
   * Generate Facebook-optimized content
   */
  async generateFacebookContent(): Promise<MetaContent> {
    try {
      // Get base content from X generator (reuse quality content)
      const baseContent = await xContentGeneratorFixed.generateDailyContent(new Date());
      
      // Facebook-specific optimizations
      const facebookText = this.optimizeForFacebook(baseContent.text);
      const hashtags = this.getFacebookHashtags();
      
      return {
        text: facebookText,
        hashtags,
        media: baseContent.media || [],
        platform: 'facebook',
        contentType: 'feed'
      };
      
    } catch (error) {
      console.error('Failed to generate Facebook content:', error);
      return this.getFallbackFacebookContent();
    }
  }

  /**
   * Generate Instagram-optimized content
   */
  async generateInstagramContent(): Promise<MetaContent> {
    try {
      // Instagram requires visual content
      const baseContent = await xContentGeneratorFixed.generateDailyContent(new Date());
      
      // Instagram-specific optimizations
      const instagramText = this.optimizeForInstagram(baseContent.text);
      const hashtags = this.getInstagramHashtags();
      
      // Ensure we have media for Instagram
      let media = baseContent.media || [];
      if (media.length === 0) {
        const fallbackContent = await xContentGeneratorFixed.getFallbackContent('educational');
        media = fallbackContent.media || [];
      }
      
      return {
        text: instagramText,
        hashtags,
        media,
        platform: 'instagram',
        contentType: 'feed'
      };
      
    } catch (error) {
      console.error('Failed to generate Instagram content:', error);
      return this.getFallbackInstagramContent();
    }
  }

  /**
   * Generate Instagram Story content
   */
  async generateInstagramStoryContent(): Promise<MetaContent> {
    try {
      const baseContent = await xContentGeneratorFixed.getFallbackContent('engagement');
      
      // Stories are short and visual
      const storyText = this.optimizeForStories(baseContent.text);
      
      return {
        text: storyText,
        hashtags: ['#CommertizeCRE', '#RealEstate', '#Innovation'],
        media: baseContent.media || [],
        platform: 'instagram',
        contentType: 'story'
      };
      
    } catch (error) {
      console.error('Failed to generate Instagram Story content:', error);
      return this.getFallbackStoryContent();
    }
  }

  /**
   * Optimize content for Facebook's algorithm and audience
   */
  private optimizeForFacebook(text: string): string {
    // Facebook prefers longer, engaging content
    const facebookIntros = [
      "🏢 Commercial real estate professionals:",
      "🚀 The future of property investment is here:",
      "💡 Transform your real estate portfolio:",
      "📈 Smart investors are discovering:",
      "🔗 Connect traditional real estate with digital innovation:"
    ];
    
    const intro = facebookIntros[Math.floor(Math.random() * facebookIntros.length)];
    
    // Add engagement hooks
    const hooks = [
      "\n\nWhat's your take on tokenized real estate?",
      "\n\nReady to explore the future of property investment?",
      "\n\nHow is your portfolio adapting to digital transformation?",
      "\n\nThoughts on fractional ownership trends?"
    ];
    
    const hook = hooks[Math.floor(Math.random() * hooks.length)];
    
    return `${intro}\n\n${text}${hook}\n\nLearn more at Commertize.com`;
  }

  /**
   * Optimize content for Instagram's visual-first platform
   */
  private optimizeForInstagram(text: string): string {
    // Instagram prefers shorter, punchy content with lots of hashtags
    const instagramIntros = [
      "✨ Revolutionizing CRE",
      "🏗️ Building the future",
      "💎 Premium properties, accessible investing",
      "🚀 Next-gen real estate",
      "🔥 Game-changing opportunity"
    ];
    
    const intro = instagramIntros[Math.floor(Math.random() * instagramIntros.length)];
    
    // Keep it concise for Instagram
    const shortText = text.length > 100 ? text.substring(0, 97) + '...' : text;
    
    return `${intro}\n\n${shortText}\n\nDM us to learn more! 💬`;
  }

  /**
   * Optimize content for Instagram Stories (very short)
   */
  private optimizeForStories(text: string): string {
    const storyMessages = [
      "🏢 Tokenizing commercial real estate",
      "💰 Fractional property investing",
      "🚀 The future is here",
      "✨ Smart CRE investments",
      "🔗 Blockchain meets real estate"
    ];
    
    return storyMessages[Math.floor(Math.random() * storyMessages.length)];
  }

  /**
   * Facebook-optimized hashtags
   */
  private getFacebookHashtags(): string[] {
    return [
      '#CommercialRealEstate',
      '#PropertyInvestment',
      '#RealEstateTech',
      '#Innovation',
      '#Commertize'
    ];
  }

  /**
   * Instagram-optimized hashtags (more extensive)
   */
  private getInstagramHashtags(): string[] {
    return [
      '#CommercialRealEstate',
      '#CRE',
      '#PropertyInvestment',
      '#RealEstate',
      '#PropTech',
      '#Innovation',
      '#Blockchain',
      '#DigitalAssets',
      '#Investment',
      '#Portfolio',
      '#Commertize',
      '#FutureOfRealEstate',
      '#SmartInvesting',
      '#TechInnovation',
      '#PropertyTech'
    ];
  }

  /**
   * Fallback Facebook content
   */
  private getFallbackFacebookContent(): MetaContent {
    const fallbackMessages = [
      "🏢 Discover how Commertize is transforming commercial real estate investment through innovative tokenization technology. Making premium properties accessible to all investors.",
      "🚀 The future of real estate investing is here. Fractional ownership, digital transparency, and global accessibility - all powered by Commertize.",
      "💡 Traditional real estate barriers are disappearing. Join thousands of investors accessing premium commercial properties through our tokenization platform."
    ];
    
    const message = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
    
    return {
      text: message + "\n\nLearn more at Commertize.com",
      hashtags: this.getFacebookHashtags(),
      platform: 'facebook',
      contentType: 'feed'
    };
  }

  /**
   * Fallback Instagram content
   */
  private getFallbackInstagramContent(): MetaContent {
    const fallbackMessages = [
      "✨ Breaking barriers in CRE investment",
      "🏗️ Building tomorrow's portfolio today",
      "💎 Premium properties, accessible investing",
      "🚀 Your gateway to commercial real estate"
    ];
    
    const message = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
    
    return {
      text: message + "\n\nDM us to learn more! 💬",
      hashtags: this.getInstagramHashtags(),
      platform: 'instagram',
      contentType: 'feed'
    };
  }

  /**
   * Fallback Instagram Story content
   */
  private getFallbackStoryContent(): MetaContent {
    return {
      text: "🚀 Revolutionizing CRE investment",
      hashtags: ['#CommertizeCRE', '#Innovation', '#RealEstate'],
      platform: 'instagram',
      contentType: 'story'
    };
  }
}

export const metaContentGenerator = new MetaContentGenerator();
export default MetaContentGenerator;