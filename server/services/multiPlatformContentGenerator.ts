import OpenAI from 'openai';
import { xContentGenerator } from './xContentGenerator';

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface PlatformContent {
  text: string;
  hashtags: string[];
  platform: 'telegram' | 'discord' | 'facebook' | 'instagram' | 'x';
  media?: string[];
  embeds?: any[];
}

interface MultiPlatformPost {
  telegram?: PlatformContent;
  discord?: PlatformContent;
  facebook?: PlatformContent;
  instagram?: PlatformContent;
  x?: PlatformContent;
  [key: string]: PlatformContent | undefined;
}

class MultiPlatformContentGenerator {
  
  private getPlatformSpecificPrompt(platform: string, baseContent: string): string {
    const platformGuides: { [key: string]: string } = {
      telegram: `
        Adapt this content for Telegram channel:
        - Use 📱 emojis naturally throughout
        - Format with bold **text** and italic _text_ 
        - Include clear call-to-action with clickable link
        - Telegram allows longer posts (up to 4096 characters)
        - More casual, community-focused tone
      `,
      discord: `
        Adapt this content for Discord community:
        - Use Discord-friendly emojis like :rocket: :chart_with_upwards_trend: :money_with_wings:
        - Engaging community tone, like talking to fellow crypto/real estate enthusiasts  
        - Mention @everyone for important announcements
        - Create discussion-worthy content that encourages replies
        - Focus on community building and engagement
      `,
      facebook: `
        Adapt this content for Facebook business page:
        - Professional yet approachable tone
        - Longer form content works well (Facebook favors longer posts)
        - Include engaging questions to drive comments
        - Business-focused language appealing to property owners and investors
        - Clear value proposition and call-to-action
      `,
      instagram: `
        Adapt this content for Instagram business account:
        - Visual-first approach - content must work with images
        - Trendy, modern language that appeals to younger investors
        - Use relevant emojis strategically
        - Instagram-style hashtags (more hashtags allowed than other platforms)
        - Shorter, punchier sentences that work well with visuals
        - Stories-friendly format
      `
    };

    return `
      ${platformGuides[platform] || ''}
      
      Original content: "${baseContent}"
      
      Platform-specific requirements:
      - Maintain Commertize brand voice: professional real estate company doing tokenization
      - Always include strong call-to-action directing to Commertize.com
      - Use our strategic hashtags: #Tokenization #RealWorldAssets #CommercialRealEstate plus contextual ones
      - No disclaimers or legal language
      - Focus on conversion and driving signups
      
      Return JSON with: text, hashtags (array), and any platform-specific formatting needs.
    `;
  }

  async generateMultiPlatformContent(contentType: string, topic?: string): Promise<MultiPlatformPost> {
    try {
      // Start with X content as base
      const baseContent = await xContentGenerator.generateDailyContent(new Date());
      
      // Ensure baseContent has required properties
      if (!baseContent || !baseContent.text) {
        console.error('Failed to get base content from X generator');
        return this.getFallbackMultiPlatformContent();
      }
      
      const multiPlatformPost: MultiPlatformPost = {};
      const platforms = ['telegram', 'discord', 'facebook', 'instagram'];
      
      // Generate content for each platform
      for (const platform of platforms) {
        try {
          const prompt = this.getPlatformSpecificPrompt(platform, baseContent.text);
          
          const response = await openai.chat.completions.create({
            model: "gpt-5",
            messages: [
              {
                role: "system",
                content: "You are Commertize's multi-platform social media content creator. Adapt content to work perfectly for each social media platform while maintaining brand consistency."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            response_format: { type: "json_object" },
            max_completion_tokens: 800
          });

          const platformContent = JSON.parse(response.choices[0].message.content || '{}');
          
          multiPlatformPost[platform] = {
            text: platformContent.text || baseContent.text || '',
            hashtags: platformContent.hashtags || ['#Tokenization', '#RealWorldAssets', '#CommercialRealEstate'],
            platform: platform as any,
            media: baseContent.media || []
          };
          
          // Platform-specific enhancements
          if (platform === 'discord') {
            multiPlatformPost[platform]!.embeds = [{
              title: '🏢 Commertize Update',
              description: platformContent.text,
              color: 0xBE8D00,
              footer: { text: 'Join the future of real estate investment' }
            }];
          }
          
        } catch (error) {
          console.error(`Failed to generate ${platform} content:`, error);
          // Fallback to adapted base content
          multiPlatformPost[platform] = this.getFallbackContent(platform, baseContent.text);
        }
      }
      
      // Include original X content
      multiPlatformPost.x = {
        text: baseContent.text || '',
        hashtags: this.extractHashtags(baseContent.text || ''),
        platform: 'x',
        media: baseContent.media || []
      };
      
      return multiPlatformPost;
      
    } catch (error) {
      console.error('Failed to generate multi-platform content:', error);
      return this.getFallbackMultiPlatformContent();
    }
  }

  async generatePlatformSpecificPost(platform: string, contentType: string): Promise<PlatformContent> {
    try {
      const baseContent = await xContentGenerator.generateDailyContent(new Date());
      const prompt = this.getPlatformSpecificPrompt(platform, baseContent.text);
      
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `You are creating content specifically for ${platform}. Make it perfect for that platform's audience and format.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 600
      });

      const content = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        text: content.text || baseContent.text,
        hashtags: content.hashtags || ['#Tokenization', '#RealWorldAssets', '#CommercialRealEstate'],
        platform: platform as any,
        media: baseContent.media
      };
      
    } catch (error) {
      console.error(`Failed to generate ${platform} content:`, error);
      const baseContent = await xContentGenerator.generateDailyContent(new Date());
      return this.getFallbackContent(platform, baseContent.text);
    }
  }

  private extractHashtags(text: string): string[] {
    if (!text) {
      return ['#Tokenization', '#RealWorldAssets', '#CommercialRealEstate'];
    }
    const hashtagRegex = /#\w+/g;
    const matches = text.match(hashtagRegex);
    return matches || ['#Tokenization', '#RealWorldAssets', '#CommercialRealEstate'];
  }

  private getFallbackContent(platform: string, baseText: string): PlatformContent {
    const fallbacks: { [key: string]: { text: string; hashtags: string[] } } = {
      telegram: {
        text: `🏢 ${baseText}\n\n💫 Join the tokenization revolution at Commertize.com`,
        hashtags: ['#Tokenization', '#RealWorldAssets', '#CommercialRealEstate', '#PropTech']
      },
      discord: {
        text: `🚀 ${baseText}\n\nReady to revolutionize your real estate investment? Check us out! 💎`,
        hashtags: ['#Tokenization', '#RealWorldAssets', '#CommercialRealEstate', '#Web3']
      },
      facebook: {
        text: `${baseText}\n\nDiscover how Commertize is transforming commercial real estate investment through tokenization. Join property owners who are already benefiting from instant liquidity and fractional ownership opportunities.`,
        hashtags: ['#Tokenization', '#RealWorldAssets', '#CommercialRealEstate', '#RealEstateInvestment']
      },
      instagram: {
        text: `✨ ${baseText} ✨\n\n🔥 Ready to transform your portfolio? \n💎 Link in bio!`,
        hashtags: ['#Tokenization', '#RealWorldAssets', '#CommercialRealEstate', '#DigitalAssets', '#PropTech', '#Innovation', '#RealEstateInvestment']
      }
    };

    const fallback = fallbacks[platform] || fallbacks.telegram;
    
    return {
      text: fallback.text,
      hashtags: fallback.hashtags,
      platform: platform as any
    };
  }

  private getFallbackMultiPlatformContent(): MultiPlatformPost {
    const baseText = "Commercial real estate tokenization is here. Turn your property equity into digital assets for instant liquidity. Join the waitlist at Commertize.com";
    
    return {
      telegram: this.getFallbackContent('telegram', baseText),
      discord: this.getFallbackContent('discord', baseText),
      facebook: this.getFallbackContent('facebook', baseText),
      instagram: this.getFallbackContent('instagram', baseText),
      x: {
        text: `${baseText} #Tokenization #RealWorldAssets #CommercialRealEstate #DeFi`,
        hashtags: ['#Tokenization', '#RealWorldAssets', '#CommercialRealEstate', '#DeFi'],
        platform: 'x'
      }
    };
  }
}

export const multiPlatformContentGenerator = new MultiPlatformContentGenerator();
export default MultiPlatformContentGenerator;