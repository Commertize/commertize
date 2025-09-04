import OpenAI from 'openai';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import videoGenerator from './videoGenerator.js';
import { xPostTracker } from './xPostTracker';

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ContentPrompt {
  type: 'educational' | 'explainer_basics' | 'market_insight' | 'cre_trends' | 
       'commertize_vision' | 'mission_statement' | 'platform_update' | 'product_features' |
       'case_studies' | 'investor_journey' | 'engagement' | 'community_poll' | 
       'thought_leadership' | 'visionary_content' | 'motivational' | 'compliance_trust' |
       'security_compliance' | 'updates_announcements' | 'weekly_recap';
  day: string;
  context?: any;
}

interface GeneratedContent {
  text: string;
  media?: string[];
  poll?: {
    options: string[];
    duration_minutes: number;
  };
  cta?: string;
  imagePrompt?: string;
  mediaType?: 'image' | 'video' | 'gif' | 'carousel';
  videoPrompt?: string;
}

class XContentGenerator {
  
  private getContentPrompt(type: ContentPrompt['type'], day: string): string {
    const baseContext = `
You are posting as Commertize, the commercial real estate tokenization platform.

Voice & Tone Guidelines:
- Professional, educational tone with moderate enthusiasm about CRE tokenization
- Clear, informative content that explains benefits without overwhelming excitement
- Sound like knowledgeable real estate professionals sharing valuable insights
- Write like the Commertize team educating property owners about new opportunities
- Conversational and authentic - avoid dry, technical, or overly analytical language
- Focus on practical benefits and real solutions for property owners
- Never sound robotic, technical, or AI-generated
- NEVER mention AI-generation, AI-created, or AI-powered content - post as if the Commertize marketing team wrote it
- EVERY text post must include compelling imagery under the hashtags

Brand Identity:
- Commertize helps property owners unlock liquidity through tokenization
- We make commercial real estate investment accessible to more people
- We solve the liquidity problem that property owners face
- Focus on practical benefits: speed, access, flexibility, transparency

Content Style:
- Share clear, educational content about CRE tokenization benefits
- Use practical examples and real-world applications that property owners understand
- Use "we" and "our" - post as the Commertize team sharing expertise
- Strong conversion focus: "Learn more at Commertize.com" or "Discover how at Commertize.com"
- Every post must drive traffic and educate about tokenization benefits
- MANDATORY: Include compelling visual imagery under every hashtag section - NO POSTS WITHOUT IMAGES
- Use moderate enthusiasm while maintaining professional tone
- Examples should be specific and relatable to property owners
- Hashtag strategy: Always include core three (#Tokenization #RealWorldAssets #CommercialRealEstate) plus 1 contextual hashtag
- Contextual hashtags: #PropTech #Innovation #Liquidity #DigitalAssets #PropertyOwners etc.
- NO repeated content - each post must be unique and fresh
`;

    const prompts = {
      // 1. Educational / Explainer Posts
      educational: `${baseContext}
Create clear educational content about real estate tokenization that helps property owners understand the benefits.
Use practical examples and straightforward explanations. Focus on how tokenization solves real problems.
MANDATORY: Always include imagePrompt for visual content.
Example: "Property owners are discovering a new way to access capital without selling their buildings. Tokenization allows you to turn a portion of your property into digital shares, giving you instant liquidity while keeping ownership. Think of it like creating shares of your building that can be traded 24/7. Learn more at Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate #PropTech"
ImagePrompt: "Stunning commercial office building or modern skyscraper with digital blockchain overlay, tokenization visualization with glowing digital elements, impressive real estate architecture with futuristic technology integration"`,

      explainer_basics: `${baseContext}
Explain tokenization basics, fractional ownership, and blockchain in real estate using simple terms.
Help people understand what tokenization means and its benefits for commercial real estate.
Example: "Think of tokenization like turning your building into shares on the stock market. Instead of selling the whole property, you can sell pieces of it for instant cash. That's the power of fractional ownership. Learn more at Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate"`,

      // 2. Market Insights
      market_insight: `${baseContext}
Share EXCITING market insights that blow people's minds! Use "Did you know?" facts that amaze followers.
Focus on incredible market opportunities and breakthrough transformations happening right now.
Show the dramatic contrast between old slow methods vs revolutionary tokenization.
Example: "🤯 MIND-BLOWING FACT: $280 TRILLION in global real estate sits TRAPPED while property owners need capital! That's about to change FOREVER! Tokenization is unlocking this massive wealth RIGHT NOW! Property owners are raising capital in DAYS instead of months! The transformation is INCREDIBLE! Ready to unlock YOUR building's potential? Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate #Revolution"`,

      cre_trends: `${baseContext}
Focus on CRE market updates including vacancy rates, cap rates, and refinancing challenges.
Share "Did you know?" facts about global real estate and tokenization opportunities.
Example: "Did you know? Over $280 trillion in global real estate sits illiquid while owners need capital. Tokenization is changing that - turning buildings into tradeable assets. The future is liquid. Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate"`,

      // 3. Commertize Vision & Mission
      commertize_vision: `${baseContext}
Share Commertize's vision and mission with our slogan "The New Way to Capitalize Commercial Real Estate".
Explain why we believe tokenization is the future and our problem/solution approach.
Example: "Banks say no. Commertize says yes. We're building the new way to capitalize commercial real estate. When traditional financing fails, tokenization succeeds. Join the revolution at Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate"`,

      mission_statement: `${baseContext}
Focus on Commertize's goals and why tokenization is the future of real estate.
Use our slogan "The New Way to Capitalize Commercial Real Estate" and problem/solution messaging.
Example: "Our mission: Make commercial real estate investment accessible to everyone. The New Way to Capitalize Commercial Real Estate isn't just our slogan - it's our promise. Discover the future at Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate"`,

      // 4. Product Features & Platform Updates
      platform_update: `${baseContext}
Share updates about platform features including minting, onboarding, vaulting, and UI improvements.
Show step-by-step processes and highlight security, compliance, and transparency.
Example: "We just made it easier to track your tokenized property's performance. Real-time updates mean you're always in the loop. See what transparency looks like at Commertize.com #RealEstate #Tokenization"`,

      product_features: `${baseContext}
Showcase platform features like dashboard previews, tokenization process, and security highlights.
Explain how minting, onboarding, or vaulting works in simple terms.
Example: "Sneak peek: Our new dashboard makes property tokenization as simple as three clicks. Upload documents, set terms, launch tokens. That's it. See the future of real estate at Commertize.com #Tokenization #RealWorldAssets #PropTech"`,

      // 5. Case Studies / Scenarios
      case_studies: `${baseContext}
Create scenarios like "Imagine tokenizing a $10M office building" or walkthrough sponsor liquidity examples.
Show hypothetical investor journeys from sign-up to earning returns.
Example: "Imagine tokenizing a $10M office building in 30 days instead of 6 months. One sponsor just raised $2M in liquidity without selling. That's the power of tokenization. See how at Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate"`,

      investor_journey: `${baseContext}
Walk through hypothetical investor or sponsor experiences with tokenization.
Show real scenarios of raising liquidity or earning returns through the platform.
Example: "Meet Sarah: She tokenized 25% of her office building and raised $800K in two weeks. Now she's expanding her portfolio while keeping ownership. That's smart real estate. Learn more at Commertize.com #Tokenization #RealWorldAssets #SmartInvesting"`,

      // 6. Community & Thought Leadership
      engagement: `${baseContext}
Ask questions to engage followers about CRE, DeFi, or tokenization adoption.
Create polls and highlight industry leaders, partnerships, or innovations.
Comment on major blockchain/real estate news.
Example: "Property owners: What's your biggest liquidity challenge? Getting capital for renovations? Portfolio diversification? Exit strategies? We're solving these problems - join the waitlist at Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate"`,

      community_poll: `${baseContext}
Create engaging questions and polls about real estate investment preferences.
Ask about tokenization adoption, investment amounts, or platform features.
Example: "Would you invest $1K into a luxury hotel if it was tokenized? A) Yes, show me how B) Maybe, tell me more C) No, too risky D) What's tokenization? We're making it possible at Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate"`,

      thought_leadership: `${baseContext}
Share thoughts about where commercial real estate is heading.
Position tokenization as the future and comment on industry innovations.
Example: "Real estate is going digital. Not just marketing or management - ownership itself. We're helping property owners lead this transformation. Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate #DigitalTransformation"`,

      // 7. Motivation / Visionary Content
      visionary_content: `${baseContext}
Share quotes about innovation, real estate, or finance. Focus on future-of-investing posts.
Use statements like "The next trillion-dollar asset class will be tokenized real estate."
Example: "The next trillion-dollar asset class will be tokenized real estate. While others debate the future, we're building it. Join the revolution at Commertize.com #Tokenization #RealWorldAssets #FutureOfFinance #Innovation"`,

      motivational: `${baseContext}
Create inspiring content about innovation in real estate and finance.
Focus on the future of investing and digital transformation.
Example: "Innovation happens when we stop accepting limitations. Why should property investment be limited to the wealthy? Tokenization changes everything. The future is accessible at Commertize.com #Tokenization #RealWorldAssets #Innovation #DigitalTransformation"`,

      // 8. Compliance & Trust Building
      compliance_trust: `${baseContext}
Emphasize transparency, KYC/AML processes, and compliance steps.
Explain why accredited investors matter and how we protect investors and sponsors.
Example: "Trust is everything in real estate. That's why we built KYC/AML compliance into every transaction. Your investments are protected, your identity verified, your interests secured. Experience true transparency at Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate"`,

      security_compliance: `${baseContext}
Highlight platform security, regulatory compliance, and investor protection measures.
Focus on transparency and why compliance matters in tokenized real estate.
Example: "Why accredited investors matter: We follow SEC regulations to protect everyone. Compliance isn't just legal - it's how we build trust in tokenized real estate. Safe, secure, compliant at Commertize.com #Tokenization #RealWorldAssets #Compliance"`,

      // Legacy content types (keeping for backward compatibility)
      updates_announcements: `${baseContext}
Share exciting news about our platform or the tokenization space.
Focus on real benefits for property owners and investors.
Example: "Big news: We're now helping property owners access liquidity in weeks, not months. See what tokenization can do for your portfolio. Get early access at Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate"`,

      weekly_recap: `${baseContext}
Wrap up the week with thoughts about real estate and tokenization trends.
Keep it conversational and forward-looking.
Example: "Another week showing why liquidity matters in real estate. More property owners are discovering tokenization as the smart way to access capital. The future of real estate is flexible. Commertize.com #RealEstate #Tokenization"`
    };

    return prompts[type] || prompts.educational;
  }

  async generateDailyContent(date: Date): Promise<GeneratedContent> {
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    const contentType = this.getContentTypeForDay(day);
    
    try {
      const prompt = this.getContentPrompt(contentType, day);
      
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: prompt
          },
          {
            role: "user", 
            content: `Generate a ${day} ${contentType.replace('_', ' ')} post for X. Include relevant CRE data, tokenization insights, and Commertize positioning. Make it engaging and professional. 

MEDIA TYPE SELECTION: Based on the content type, choose the most engaging media format (prioritize video/animation):
- Educational content: Video with animated explanations or dynamic infographics
- Market insights: Video showing animated trends and data visualization
- Announcements: Professional video announcements or animated text reveals
- Engagement posts: Animated GIFs or video content for higher engagement
- Thought leadership: Video presentations or animated quote reveals
- Platform updates: Video demos or animated feature showcases

MANDATORY: Use "video" as media_type for ALL posts unless specifically creating polls. Video content gets 6x more engagement than images.

Provide prompts for your chosen media type. Also provide an image_prompt as backup for a professional, branded image that would complement this post.

CRITICAL HASHTAG REQUIREMENT: EVERY post must include #Commertize as the first hashtag, followed by our strategic hashtag approach:

MANDATORY HASHTAGS IN EVERY POST:
1. #Commertize (ALWAYS FIRST - this is our brand hashtag)
2. Choose 2-3 additional hashtags from these categories:

CORE HASHTAGS (pick 1-2): #Tokenization #RealWorldAssets #CommercialRealEstate #CRE

CONTEXTUAL HASHTAGS (pick 1 based on content): #AI (for AI analysis), #DeFi (for liquidity topics), #PropTech (for technology), #Blockchain (for blockchain features), #Web3 (for Web3/digital transformation), #FinTech (for finance innovation), #Innovation (for new developments), #SmartInvesting (for investment topics), #DigitalTransformation (for transformation themes), #FutureOfFinance (for future trends), #RWA (real world assets)

EXAMPLE: #Commertize #Tokenization #CommercialRealEstate #PropTech

Use 3-4 hashtags total, always starting with #Commertize. 

Return the response in JSON format with 'text', 'cta', 'image_prompt', 'media_type' (image/video/gif/carousel), and 'video_prompt' (if media_type is video) fields.`
          }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 600
      });

      const content = JSON.parse(response.choices[0].message.content || '{}');
      
      // VIDEO SCHEDULING LOGIC: Only on Monday, Wednesday, Friday at 10 AM PT
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0=Sunday, 1=Monday, etc.
      const hour = now.getHours(); // UTC hour
      const ptHour = (hour - 8 + 24) % 24; // Convert to PT (rough approximation)
      
      const isVideoDay = dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5; // Mon, Wed, Fri only
      const isVideoTime = ptHour === 10; // 10 AM PT only
      
      if (content.media_type === 'video' && (!isVideoDay || !isVideoTime)) {
        console.log(`🚫 Converting video to image: Not video day/time (${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dayOfWeek]} ${ptHour}:00 PT)`);
        content.media_type = 'image';
        content.video_prompt = '';
      } else if (isVideoDay && isVideoTime && (!content.media_type || content.media_type !== 'video')) {
        console.log(`🎬 Forcing video generation for ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dayOfWeek]} 10 AM PT`);
        content.media_type = 'video';
        content.video_prompt = content.video_prompt || content.text?.substring(0, 40) || 'Commertize Tokenization';
      }
      
      // Initialize media array - will be populated based on media_type priority
      let mediaFiles: string[] = [];
      
      // Handle poll posts
      if (contentType === 'community_poll' || contentType === 'engagement') {
        // Even polls can have video/GIF content
        if (content.media_type === 'video') {
          try {
            console.log(`🎬 Generating video for poll post...`);
            const videoFile = await videoGenerator.generatePromotionalVideo({
              text: content.video_prompt || content.text,
              duration: 10,
              size: 'square',
              style: 'animated_text'
            });
            if (videoFile) {
              mediaFiles = [videoFile];
              console.log(`✅ Generated video for poll: ${videoFile.split('/').pop()}`);
            }
          } catch (error: any) {
            console.error('❌ Poll video generation failed:', error.message);
          }
        }
        
        return {
          text: content.text,
          poll: {
            options: content.poll_options || ["Yes", "No"],
            duration_minutes: 1440 // 24 hours
          },
          cta: content.cta,
          imagePrompt: content.image_prompt,
          mediaType: content.media_type,
          media: mediaFiles
        };
      }

      // Priority: Generate video/GIF based on media_type
      if (content.media_type === 'video') {
        try {
          console.log(`🎬 Generating video for X post...`);
          const videoFile = await videoGenerator.generatePromotionalVideo({
            text: content.video_prompt || content.text,
            duration: 12,
            size: 'square',
            style: 'animated_text'
          });
          if (videoFile) {
            mediaFiles = [videoFile];
            console.log(`✅ Generated video for X post: ${videoFile.split('/').pop()}`);
            console.log(`📁 Video file size: ${require('fs').statSync(videoFile).size} bytes`);
          }
        } catch (error: any) {
          console.error('❌ Video generation failed:', error.message);
          // Continue to image fallback
        }
      } else if (content.media_type === 'gif') {
        try {
          console.log(`🎨 Generating GIF for X post...`);
          const gifFile = await videoGenerator.generateSimpleGif(content.text, 4);
          if (gifFile) {
            mediaFiles = [gifFile];
            console.log(`✅ Generated GIF for X post: ${gifFile.split('/').pop()}`);
            console.log(`📁 GIF file size: ${require('fs').statSync(gifFile).size} bytes`);
          }
        } catch (error: any) {
          console.error('❌ GIF generation failed:', error.message);
          // Continue to image fallback
        }
      }
      
      // Only generate image if no video/GIF was created
      if (mediaFiles.length === 0 && content.image_prompt) {
        try {
          console.log(`🖼️ Generating fallback image...`);
          const imageFile = await this.generatePostImage(content.image_prompt, contentType);
          if (imageFile) {
            mediaFiles = [imageFile];
            console.log(`Generated fallback image for X post: ${imageFile.split('/').pop()}`);
          }
        } catch (error) {
          console.error('Failed to generate fallback image:', error);
        }
      }

      const result = {
        text: content.text,
        cta: content.cta,
        imagePrompt: content.image_prompt,
        mediaType: content.media_type,
        videoPrompt: content.video_prompt,
        media: mediaFiles
      };
      
      console.log(`📋 X Content Generated: ${content.media_type || 'image'} type, ${mediaFiles.length} files`);
      if (mediaFiles.length > 0) {
        console.log(`📁 Media file: ${mediaFiles[0].split('/').pop()}`);
      }
      
      return result;
      
    } catch (error) {
      console.error('Failed to generate X content:', error);
      return await this.getFallbackContent(contentType, day);
    }
  }

  async generatePostImage(imagePrompt: string, contentType: string): Promise<string | null> {
    try {
      // Varied color schemes for visual diversity
      const colorSchemes = [
        'modern blue and silver accents (#2563eb, #64748b)', 
        'professional teal and gray (#0d9488, #475569)',
        'sophisticated navy and gold (#1e40af, #f59e0b)',
        'elegant dark green and bronze (#065f46, #a16207)',
        'premium charcoal and copper (#374151, #ea580c)',
        'contemporary purple and platinum (#7c3aed, #71717a)'
      ];
      
      const randomColorScheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
      
      const enhancedPrompt = `${imagePrompt}. MANDATORY: Include impressive commercial buildings, digital assets visualization, or modern real estate technology. Professional, clean design suitable for social media. Show: 1) Stunning commercial office buildings/skyscrapers, OR 2) Digital tokenization/blockchain elements overlaying real estate, OR 3) Modern fintech/proptech visualization with buildings. Brand colors: ${randomColorScheme}, professional appearance. Leave space at bottom for logo overlay. High-quality, engaging social media content that showcases the intersection of real estate and digital technology.`;
      
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      const imageUrl = response.data?.[0]?.url;
      if (!imageUrl) return null;

      // Download the generated image
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      
      const fileName = `x-post-${contentType}-${Date.now()}.png`;
      const imagePath = path.join(process.cwd(), 'public', 'generated-images', fileName);
      
      // Ensure directory exists
      const dir = path.dirname(imagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Composite the Commertize logo onto the image
      const logoPath = path.join(process.cwd(), 'public', 'assets', 'commertize-logo.png');
      
      if (fs.existsSync(logoPath)) {
        // Load the base image and logo
        const baseImage = sharp(Buffer.from(imageBuffer));
        const logo = sharp(logoPath);
        
        // Resize logo to be prominent and visible on the image
        const logoResized = await logo
          .resize(200, null, { 
            withoutEnlargement: true,
            fit: 'inside'
          })
          .png()
          .toBuffer();
        
        // Get dimensions of both base image and resized logo
        const { width: baseWidth, height: baseHeight } = await baseImage.metadata();
        const { width: logoWidth, height: logoHeight } = await sharp(logoResized).metadata();
        
        // Calculate safe positioning with proper padding (25px from edges)
        const padding = 25;
        const left = (baseWidth || 1024) - (logoWidth || 200) - padding;
        const top = (baseHeight || 1024) - (logoHeight || 65) - padding;
        
        // Position logo with calculated coordinates to ensure it stays within bounds
        const finalImage = await baseImage
          .composite([{
            input: logoResized,
            left: Math.max(0, left),  // Ensure left position is not negative
            top: Math.max(0, top)     // Ensure top position is not negative
          }])
          .png()
          .toBuffer();
        
        fs.writeFileSync(imagePath, finalImage);
        console.log(`Generated image with Commertize logo: ${fileName}`);
      } else {
        // Fallback: save without logo if logo file not found
        fs.writeFileSync(imagePath, Buffer.from(imageBuffer));
        console.log(`Generated image without logo (logo file not found): ${fileName}`);
      }
      
      return imagePath;
      
    } catch (error) {
      console.error('Failed to generate post image:', error);
      return null;
    }
  }

  async generateEngagementResponse(mention: any): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `You are RUNE.CTZ, AI analyst for Commertize CRE tokenization platform. 
            Respond professionally to X mentions/replies. Keep responses helpful, concise, and on-brand.
            Focus on CRE tokenization education when relevant. Always stay professional and factual.`
          },
          {
            role: "user",
            content: `Respond to this X mention: "${mention.text}"`
          }
        ],
        max_completion_tokens: 200
      });

      return response.choices[0].message.content || "Thanks for engaging! Learn more about CRE tokenization at Commertize.com";
    } catch (error) {
      console.error('Failed to generate engagement response:', error);
      return "Thanks for your interest in CRE tokenization! Learn more at Commertize.com";
    }
  }

  async generateMarketInsight(topic: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `You are RUNE.CTZ, AI analyst specializing in CRE and tokenization trends.
            Generate concise market insights that position Commertize's tokenization solutions.
            Keep under 280 characters for X posts.`
          },
          {
            role: "user",
            content: `Generate a market insight about: ${topic}`
          }
        ],
        max_completion_tokens: 150
      });

      return response.choices[0].message.content || "CRE markets evolving rapidly. Tokenization provides the liquidity solutions property owners need. Learn more at Commertize.com";
    } catch (error) {
      console.error('Failed to generate market insight:', error);
      return "CRE tokenization is transforming how we think about real estate liquidity. Discover the future at Commertize.com";
    }
  }

  private getContentTypeForDay(day: string): ContentPrompt['type'] {
    // Expanded schedule to rotate through all 8 comprehensive topic categories
    const contentTypes: ContentPrompt['type'][] = [
      'educational', 'explainer_basics', 'market_insight', 'cre_trends',
      'commertize_vision', 'mission_statement', 'platform_update', 'product_features',
      'case_studies', 'investor_journey', 'engagement', 'community_poll', 
      'thought_leadership', 'visionary_content', 'motivational', 'compliance_trust',
      'security_compliance', 'updates_announcements', 'weekly_recap'
    ];
    
    // Use day of year to create consistent but varied rotation
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const typeIndex = dayOfYear % contentTypes.length;
    
    // Primary schedule with enhanced variety
    const schedule: Record<string, ContentPrompt['type']> = {
      'Monday': contentTypes[typeIndex % 5] || 'market_insight', // Market focus to start week
      'Tuesday': contentTypes[(typeIndex + 1) % 6] || 'educational', // Education mid-week
      'Wednesday': contentTypes[(typeIndex + 2) % 7] || 'platform_update', // Platform updates
      'Thursday': contentTypes[(typeIndex + 3) % 8] || 'thought_leadership', // Leadership content
      'Friday': contentTypes[(typeIndex + 4) % 9] || 'community_poll', // Engagement to end week
      'Saturday': contentTypes[(typeIndex + 5) % 10] || 'case_studies', // Weekend scenarios
      'Sunday': contentTypes[(typeIndex + 6) % 11] || 'weekly_recap' // Sunday reflection
    };

    return schedule[day] || 'educational';
  }

  async getFallbackContent(type: ContentPrompt['type'], day: string): Promise<GeneratedContent> {
    const fallbacks = {
      educational: {
        text: "Need quick access to your property's value without selling? We turn buildings into digital shares for instant liquidity. Tokenization makes your real estate work harder for you. Join the waitlist at Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate #DeFi",
        cta: "Learn more at Commertize.com",
        imagePrompt: "Stunning modern commercial office building or luxury skyscraper with digital tokenization overlay, impressive architecture with blockchain network visualization and glowing digital elements"
      },
      updates_announcements: {
        text: "Exciting update: We're helping property owners unlock capital faster than ever. No more waiting months for traditional financing. Join the tokenization revolution at Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate #Innovation",
        cta: "Learn more at Commertize.com",
        imagePrompt: "Impressive commercial real estate development with digital transformation elements, modern high-rise buildings with tokenization and blockchain technology overlay, professional fintech visualization"
      },
      engagement: {
        text: "Property owners: What's your biggest challenge accessing capital? Slow bank approvals? High interest rates? Limited options? Tell us what you're dealing with! Learn more at Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate",
        cta: "Learn more at Commertize.com",
        imagePrompt: "Professional commercial real estate scene with impressive office buildings, digital asset visualization, modern property investment concept with blockchain and cryptocurrency elements"
      },
      thought_leadership: {
        text: "Real estate ownership is evolving. We're not just talking about digital marketing - we mean digital ownership itself. Property tokenization is here to stay. Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate #Web3",
        cta: "Commertize.com",
        imagePrompt: "Futuristic real estate concept with digital property visualization, blockchain networks connecting buildings, thought leadership design"
      },
      market_insight: {
        text: "Traditional financing is getting more complex. Property owners need flexible solutions for accessing capital. Tokenization offers a new path to liquidity. Learn more at Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate #FinTech",
        cta: "Learn more at Commertize.com",
        imagePrompt: "Market analysis graphic with financial charts and commercial real estate trends, professional fintech design with data visualization"
      },
      platform_update: {
        text: "We just made tracking your tokenized property easier. Real-time updates, transparent reporting, complete control. See what modern property ownership looks like at Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate #PropTech",
        cta: "See what's possible at Commertize.com",
        imagePrompt: "Modern dashboard interface showing property analytics and real-time updates, clean UI design with commercial real estate data"
      },
      community_poll: {
        text: "Property owners: If you could unlock 20% of your building's value instantly, what would you use it for?",
        poll: {
          options: ["Property improvements", "New acquisitions", "Debt reduction", "Portfolio diversification"],
          duration_minutes: 1440
        },
        cta: "Learn more at Commertize.com",
        imagePrompt: "Professional commercial office building with digital transformation elements, tokenization visualization, modern real estate technology concept with blockchain overlay"
      },
      weekly_recap: {
        text: "Another week, same story: property owners want more flexibility with their capital. Tokenization gives them options traditional financing can't match. The future of real estate is flexible. Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate #FutureOfFinance",
        cta: "Commertize.com",
        imagePrompt: "Impressive commercial real estate skyline with digital asset overlay, futuristic city buildings with blockchain network visualization, modern financial technology concept"
      }
    };

    const selectedFallback = fallbacks[type as keyof typeof fallbacks] || fallbacks.educational;
    
    // Generate image with Commertize logo for fallback content
    let mediaFiles: string[] = [];
    if (selectedFallback.imagePrompt) {
      try {
        const imageFile = await this.generatePostImage(selectedFallback.imagePrompt, type);
        if (imageFile) {
          mediaFiles = [imageFile];
          console.log(`Generated fallback image with Commertize logo: ${imageFile.split('/').pop()}`);
        }
      } catch (error) {
        console.error('Failed to generate fallback image:', error);
      }
    }
    
    return {
      ...selectedFallback,
      media: mediaFiles
    };
  }
}

export const xContentGenerator = new XContentGenerator();
export default XContentGenerator;