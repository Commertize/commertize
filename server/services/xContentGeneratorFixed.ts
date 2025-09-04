import OpenAI from 'openai';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { xPostTracker } from './xPostTracker';

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

class XContentGeneratorFixed {
  
  async generateDailyContent(date: Date): Promise<GeneratedContent> {
    try {
      const now = new Date();
      const day = now.getDay(); // 0=Sunday, 1=Monday, etc.
      const hour = now.getHours(); // UTC hour
      const ptHour = (hour - 8 + 24) % 24; // Convert to PT
      
      // ALWAYS GENERATE IMAGES: User prefers beautiful building images over videos
      const shouldGenerateVideo = false;
      
      console.log(`📅 X Content: ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][day]} ${ptHour}:00 PT - Video: ${shouldGenerateVideo ? 'YES' : 'NO'}`);
      
      // Enhanced Content Pillars based on user strategy
      const contentTypes = [
        'educational', 'market_insight', 'platform_update', 'engagement',
        'thought_leadership', 'compliance_trust', 'innovation',
        'tokenization_education', 'defi_education', 'market_data', 
        'visionary_prediction', 'cre_memes', 'bts_product', 
        'walkthrough_scenario', 'engagement_question', 'newsjacking', 
        'macro_trends', 'case_studies', 'regulatory_update',
        'success_stories', 'industry_trends', 'tech_insights',
        'investor_focus', 'property_spotlight', 'market_analysis',
        'commertize_brand_moment',  // Special branded posts
        'commertize_transformation', // Before vs After messaging
        'archaic_vs_modern', // Archaic vs Modern language hooks
        'modernization_force', // Positioning as CRE modernizer
        'ai_modernization', // AI as the modernization engine
        'transformation_scenario', // Real-world transformation stories
        'industry_evolution', // Industry upgrade positioning
        'accessibility_revolution' // Opening CRE to everyone
      ];
      
      // More sophisticated content type selection to ensure variety
      const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      const hourOffset = Math.floor(ptHour / 4); // Change based on time of day
      const varietyIndex = (dayOfYear * 3 + hourOffset + day) % contentTypes.length;
      const contentType = contentTypes[varietyIndex];
      
      // Generate content with OpenAI (fallback to gpt-4o if gpt-5 fails)
      let response;
      try {
        response = await openai.chat.completions.create({
          model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Generate X/Twitter content for Commertize - commercial real estate tokenization platform.

CONTENT TYPE: ${contentType}
MEDIA TYPE: ${shouldGenerateVideo ? 'video' : 'image'}
TIME: ${now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PT
VARIETY REQUIREMENT: This content must be completely unique and different from previous posts. Be creative with angles, examples, and messaging.

CRITICAL HASHTAG REQUIREMENT: EVERY post must include #Commertize as the first hashtag, followed by excellent relevant hashtags:

MANDATORY HASHTAGS IN EVERY POST:
1. #Commertize (ALWAYS FIRST - this is our brand hashtag)
2. Choose 2-3 additional hashtags from these categories:

CORE HASHTAGS (pick 1-2): #Tokenization #RealWorldAssets #CommercialRealEstate #CRE #RWA

CONTEXTUAL HASHTAGS (pick 1 based on content): #AI #DeFi #PropTech #Blockchain #Web3 #FinTech #Innovation #SmartInvesting #DigitalTransformation #FutureOfFinance #PropTech #InvestmentTech #RealEstateTech

EXAMPLE: #Commertize #Tokenization #CommercialRealEstate #PropTech

Use 3-4 hashtags total, always starting with #Commertize.

CONTENT PILLAR GUIDELINES:

tokenization_education: Explain concepts in plain English (What is tokenization? How CRE token vaults work)
defi_education: Compare Tokenized CRE vs REITs, DeFi vs TradFi, "Did you know?" threads
market_data: CRE foreclosures, high rates, liquidity crunch, DeFi/RWA growth stats with charts
visionary_prediction: "The future of real estate is programmable" - bold positioning
cre_memes: CRE + crypto memes, "What's the funniest building you'd tokenize?"
bts_product: Dashboard screenshots, UI mockups, "Building at intersection of real estate & DeFi"
walkthrough_scenario: Example deals, token flow explanations, real-world problem solving
engagement_question: "If you could tokenize ANY property, which one?" Interactive polls
newsjacking: Comment on CRE/crypto news with hot takes and Commertize positioning
macro_trends: Comment on market events like rate hikes, REIT challenges, or refinancing crises → show how tokenization solves liquidity issues
regulatory_update: Explain Reg D 506(c), stablecoin regulations, position as compliant
success_stories: Highlight tokenization wins, property owner success stories
industry_trends: Comment on commercial real estate market shifts and opportunities
tech_insights: Explain blockchain technology benefits for real estate
investor_focus: Content specifically for investors seeking CRE exposure
property_spotlight: Showcase specific types of properties perfect for tokenization
market_analysis: Deep dive into current CRE market conditions and tokenization solutions
commertize_transformation: Before vs After comparisons showing old CRE vs new CRE with Commertize
archaic_vs_modern: Use consistent language hooks like "From archaic to algorithmic", "From opaque to transparent"
modernization_force: Position Commertize as the modernization engine transforming CRE industry

STRATEGIC MESSAGING FRAMEWORKS:
- Before vs After: "Paper contracts → Smart contracts", "Months of waiting → Weeks to close", "Zero liquidity → 24/7 trading"
- Archaic vs Modern: "From gatekept to accessible", "From opaque to transparent", "From locked to liquid"
- Modernization Language: "The new way to capitalize CRE", "Modern infrastructure for an outdated industry", "Commertize = CRE without friction"
- AI Engine: Position RUNE.CTZ as the "AI whisperer" of CRE with valuations, compliance, and recommendations
- Transformation Stories: Real scenarios like "Hotel owner raised $3M in weeks, not years"

CRITICAL VARIETY REQUIREMENTS:
- Each post must offer a FRESH perspective - never repeat the same angle
- Use different examples, scenarios, and data points each time
- Vary your tone: sometimes educational, sometimes provocative, sometimes inspiring
- Rotate between different stakeholder perspectives (owners, investors, developers)

REQUIREMENTS:
- Professional yet engaging tone  
- Under 280 characters including hashtags
- Include Commertize.com call-to-action
- Use hashtags: #Tokenization #RealWorldAssets #CommercialRealEstate plus one contextual
- Create ${shouldGenerateVideo ? 'video_prompt for animation' : 'image_prompt for DALL-E'}

Return JSON with: text, cta, ${shouldGenerateVideo ? 'video_prompt' : 'image_prompt'}, media_type`
          }
        ],
          response_format: { type: "json_object" },
          max_completion_tokens: 400
        });
      } catch (gptError) {
        console.log('⚠️ GPT model failed, using fallback content with DALL-E images');
        // Still try to generate images even if text generation fails
        const fallback = await this.getFallbackContent('market_insight');
        if (fallback.imagePrompt) {
          const imageFile = await this.generatePostImage(fallback.imagePrompt, 'market_insight');
          if (imageFile) {
            fallback.media = [imageFile];
          }
        }
        return fallback;
      }

      const content = JSON.parse(response.choices[0].message.content || '{}');
      
      // Always use image for X posts (user preference - beautiful buildings over videos)
      content.media_type = 'image';
      
      // Check for duplicates
      if (xPostTracker.isDuplicate(content.text)) {
        console.log('🚫 Duplicate detected, using fallback');
        return this.getFallbackContent(contentType);
      }
      
      // Record this post to prevent future duplicates
      xPostTracker.recordPost(content.text, content.media_type);
      
      // Generate media based on type
      let mediaFiles: string[] = [];
      
      if (content.media_type === 'image') {
        try {
          // Use GPT-generated prompt or fallback to default commercial real estate prompt
          const imagePrompt = content.image_prompt || 
            'Professional commercial real estate office building with modern architecture, glass facade, and blockchain technology elements in the background. Clean, sophisticated design for social media.';
          
          const imageFile = await this.generatePostImage(imagePrompt, contentType);
          if (imageFile) {
            mediaFiles = [imageFile];
            console.log(`✅ Generated DALL-E image: ${imageFile.split('/').pop()}`);
          }
        } catch (error) {
          console.error('❌ Image generation failed:', error);
        }
      }
      
      // Note: Video generation removed to prevent API quota issues
      // Videos will only be generated on proper schedule via dedicated video service
      
      return {
        text: content.text,
        cta: content.cta,
        imagePrompt: content.image_prompt,
        mediaType: content.media_type,
        videoPrompt: content.video_prompt,
        media: mediaFiles
      };
      
    } catch (error) {
      console.error('Failed to generate X content:', error);
      console.log('⚠️ OpenAI quota reached - using pre-generated content with enhanced image prompts');
      return this.getFallbackContent('educational');
    }
  }

  async generatePostImage(imagePrompt: string, contentType: string): Promise<string | null> {
    try {
      const colorSchemes = [
        'modern blue and silver (#2563eb, #64748b)', 
        'professional teal and gray (#0d9488, #475569)',
        'sophisticated navy and gold (#1e40af, #f59e0b)'
      ];
      
      const randomColor = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
      
      const enhancedPrompt = `${imagePrompt}. Professional commercial real estate and blockchain theme. Clean design for social media. Brand colors: ${randomColor}. High quality, modern appearance.`;
      
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      const imageUrl = response.data?.[0]?.url;
      if (!imageUrl) return null;

      // Download and save image
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      
      const fileName = `x-post-${contentType}-${Date.now()}.png`;
      const imagePath = path.join(process.cwd(), 'public', 'generated-images', fileName);
      
      // Ensure directory exists
      const dir = path.dirname(imagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Add Commertize logo if available
      const logoPath = path.join(process.cwd(), 'public', 'assets', 'commertize-logo.png');
      
      if (fs.existsSync(logoPath)) {
        const baseImage = sharp(Buffer.from(imageBuffer));
        const logo = sharp(logoPath);
        
        const logoResized = await logo
          .resize(180, null, { withoutEnlargement: true, fit: 'inside' })
          .png()
          .toBuffer();
        
        const { width: baseWidth, height: baseHeight } = await baseImage.metadata();
        const { width: logoWidth, height: logoHeight } = await sharp(logoResized).metadata();
        
        const left = (baseWidth || 1024) - (logoWidth || 180) - 20;
        const top = (baseHeight || 1024) - (logoHeight || 60) - 20;
        
        const finalImage = await baseImage
          .composite([{
            input: logoResized,
            left: Math.max(0, left),
            top: Math.max(0, top)
          }])
          .png()
          .toBuffer();
        
        fs.writeFileSync(imagePath, finalImage);
        console.log(`Generated image with logo: ${fileName}`);
      } else {
        fs.writeFileSync(imagePath, Buffer.from(imageBuffer));
        console.log(`Generated image: ${fileName}`);
      }
      
      return imagePath;
      
    } catch (error) {
      console.error('Failed to generate post image:', error);
      return null;
    }
  }

  async getFallbackContent(contentType: string): Promise<GeneratedContent> {
    const fallbacks = {
      educational: {
        text: "Commercial real estate investment is evolving. Tokenization makes premium properties accessible to more investors with fractional ownership and instant liquidity. Discover the future at Commertize.com #Commertize #Tokenization #RealWorldAssets #Innovation",
        cta: "Learn more at Commertize.com",
        imagePrompt: "Modern commercial building with digital tokenization overlay, professional real estate photography"
      },
      tokenization_education: {
        text: "What is tokenization? Simply put: your building becomes digital shares that trade 24/7. Property owners get instant liquidity, investors get access to premium CRE. The new way to capitalize real estate at Commertize.com #Commertize #Tokenization #RealWorldAssets #Education",
        cta: "Learn how at Commertize.com",
        imagePrompt: "Educational infographic showing building transformation into digital tokens with clear, simple visuals"
      },
      defi_education: {
        text: "Tokenized CRE vs REITs: REITs = buy shares in a company that owns buildings. Tokenized CRE = own shares IN the building itself. Direct ownership, instant liquidity, programmable income. Commertize.com #Commertize #Tokenization #RealWorldAssets #DeFi",
        cta: "Compare options at Commertize.com",
        imagePrompt: "Side-by-side comparison chart showing traditional REITs vs tokenized real estate with clear advantages"
      },
      market_data: {
        text: "Did you know? $2.8 trillion in CRE debt needs refinancing by 2025, but lending has dropped 70%. Negative equity = foreclosure wave. Tokenization offers liquidity without traditional financing. Commertize.com #Commertize #Tokenization #RealWorldAssets #MarketData",
        cta: "See solutions at Commertize.com",
        imagePrompt: "Professional market data visualization showing CRE refinancing crisis with charts and statistics"
      },
      commertize_brand_moment: {
        text: "Commercial Real Estate Tokenized. Fractionalized. Globalized. Democratized. Optimized. Digitized. Revolutionized. Commertized. #Commertize #Revolution #Tokenization #CRE",
        cta: "Join the revolution at Commertize.com",
        imagePrompt: "Bold, dynamic graphic showing transformation steps with modern commercial buildings and digital elements, powerful brand moment visualization"
      },
      ai_modernization: {
        text: "AI isn't just for tech. At Commertize, AI powers: 🔍 Deal analysis 📊 Risk modeling 👤 Investor matching ✅ Compliance monitoring. Old CRE was opinion-based. New CRE is data-driven. #Commertize #AI #RWA",
        cta: "Experience AI-driven CRE at Commertize.com",
        imagePrompt: "AI dashboard interface showing real estate analytics, deal scoring, and automated compliance checks"
      },
      transformation_scenario: {
        text: "Imagine raising $3M on your hotel in weeks, not years. That's the Commertize way. Tokenization turns property into digital capital. Investors get access. Sponsors get liquidity. Everyone wins. #Commertize #Tokenization #RWA",
        cta: "See how at Commertize.com",
        imagePrompt: "Modern hotel with digital tokenization visualization showing rapid capital raising process"
      },
      visionary_prediction: {
        text: "Bold prediction: By 2030, most CRE transactions won't touch a bank. Properties will be programmable assets with instant liquidity, automated income distribution, and global investor access. The future starts at Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate #Future",
        cta: "Build the future at Commertize.com",
        imagePrompt: "Futuristic cityscape with digital buildings and blockchain networks, visionary technology concept"
      },
      cre_memes: {
        text: "What's the funniest building you'd tokenize? 🏢😂 Empire State Building? Your local Wendy's? That one office building that's been 'under construction' for 10 years? Drop your picks below! Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate #Memes",
        cta: "Tokenize anything at Commertize.com",
        imagePrompt: "Humorous illustration of famous buildings with digital tokens floating around them, meme-style design"
      },
      bts_product: {
        text: "Behind the scenes: Building at the intersection of real estate & DeFi 🚀 Dashboard mockups, smart contract testing, token vault architecture. Creating the infrastructure for programmable real estate. Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate #BTS",
        cta: "See our progress at Commertize.com",
        imagePrompt: "Screenshot of Commertize dashboard interface with property analytics, clean UI design, professional mockup"
      },
      walkthrough_scenario: {
        text: "Real scenario: Hotel needs $5M for renovations. Traditional loan = 18 months, high rates. Commertize solution: Tokenize → raise capital in 30 days → investors get rental income shares. Speed vs bureaucracy. Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate #CaseStudy",
        cta: "See how at Commertize.com",
        imagePrompt: "Step-by-step flow diagram showing tokenization process from property to investor, clean infographic style"
      },
      industry_evolution: {
        text: "Every outdated industry eventually upgrades. Banking → FinTech. Cars → EVs. Media → Streaming. Now it's CRE's turn. Commertize = the modernization of commercial real estate. #Commertize #Innovation #RWA",
        cta: "Join the evolution at Commertize.com",
        imagePrompt: "Evolution timeline showing industry transformations leading to real estate tokenization"
      },
      accessibility_revolution: {
        text: "Most investors can't touch CRE. It's slow, exclusive, and full of friction. Commertize opens the gates: ✅ Fractional access ✅ Transparent data ✅ Liquid markets. Welcome to the future. #Commertize #Accessibility #RWA",
        cta: "Access CRE at Commertize.com",
        imagePrompt: "Open gates showing pathway from traditional exclusive CRE to accessible tokenized markets"
      },
      engagement_question: {
        text: "If you could tokenize ANY property in the world, which one would you choose? 🏢 Burj Khalifa? Times Square office? Your dream beach resort? Tag us with your picks - best answer gets our whitepaper! Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate #Question",
        cta: "Share your pick at Commertize.com",
        imagePrompt: "Collage of famous world properties with interactive question marks, engaging social media style"
      },
      newsjacking: {
        text: "CRE lending drops 70% while $2.8T needs refinancing by 2025 → Traditional funding is broken. Tokenization creates instant liquidity without waiting for banks. The solution is already here. Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate #News",
        cta: "See the solution at Commertize.com",
        imagePrompt: "News headline layout showing CRE funding crisis with tokenization solution overlay, professional news design"
      },
      regulatory_update: {
        text: "Reg D 506(c) in simple terms: Accredited investors can invest in private securities (like tokenized real estate) with proper verification. It's the legal framework that makes CRE tokenization compliant and secure. Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate #Compliance",
        cta: "Learn compliance at Commertize.com",
        imagePrompt: "Professional legal document visualization with SEC regulations and compliance checkmarks"
      },
      old_vs_new_systems: {
        text: "Obsolete CRE systems: 🐢 slow, 🔒 illiquid, 📝 paper-heavy. Commertize CRE systems: ⚡ fast, 🌐 liquid, 🤖 AI-driven. The future isn't coming — it's here. #Commertize #Innovation #RWA",
        cta: "Experience the future at Commertize.com",
        imagePrompt: "Side-by-side comparison of old vs new CRE systems with emojis and modern design elements"
      },
      market_insight: {
        text: "Traditional real estate financing is getting more complex. Property owners need flexible solutions for accessing capital. Tokenization offers a new path to liquidity. Explore options at Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate #FinTech",
        cta: "Learn more at Commertize.com",
        imagePrompt: "Market analysis graphic with commercial real estate trends and financial data visualization"
      },
      platform_update: {
        text: "We're making tokenized property tracking easier with real-time updates and transparent reporting. See what modern property ownership looks like at Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate #PropTech",
        cta: "Explore at Commertize.com",
        imagePrompt: "Modern dashboard interface showing property analytics and real-time updates"
      },
      engagement: {
        text: "🚀 Experience the future of commercial real estate with tokenization. Transform your property into digital shares for instant liquidity. Join the revolution at Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate #PropTech",
        cta: "Visit Commertize.com",
        imagePrompt: "Professional commercial real estate building with Commertize branding and tokenization concept"
      },
      thought_leadership: {
        text: "The real estate industry is experiencing a digital transformation. Tokenization creates new opportunities for both property owners and investors to access capital and diversify portfolios. Commertize.com #Tokenization #RealWorldAssets #CommercialRealEstate #Innovation",
        cta: "Learn more at Commertize.com",
        imagePrompt: "Sophisticated real estate professional analyzing digital property data and blockchain technology"
      },
      commertize_transformation: {
        text: "Paper contracts. Months of waiting. Zero liquidity. That's the old CRE. Commertize is the new CRE: tokenized, efficient, and always on. #Commertize #RWA #CommercialRealEstate",
        cta: "Experience the future at Commertize.com",
        imagePrompt: "Split-screen comparison showing old paper documents vs modern digital tokenization interface"
      },
      archaic_vs_modern: {
        text: "From archaic to algorithmic. From opaque to transparent. From gatekept to accessible. Commertize is rewriting the playbook for commercial real estate. #Commertize #Tokenization #RWA",
        cta: "Join the revolution at Commertize.com",
        imagePrompt: "Modern vs traditional office buildings side by side with transformation arrows and digital overlays"
      },
      modernization_force: {
        text: "The $16T commercial real estate market is <1% digitized. Commertize is here to change that. From locked to liquid. From slow to instant. The future isn't coming — it's here. #Commertize #RWA #PropTech",
        cta: "Build the future at Commertize.com",
        imagePrompt: "Futuristic commercial building with digital transformation elements and blockchain network visualization"
      }
    };
    
    const fallback = fallbacks[contentType as keyof typeof fallbacks] || fallbacks.educational;
    
    // Try to generate a simple fallback image
    let mediaFiles: string[] = [];
    
    try {
      // Create a simple branded image using Commertize logo
      const logoPath = path.join(process.cwd(), 'public', 'assets', 'commertize-logo.png');
      
      if (fs.existsSync(logoPath)) {
        const fileName = `x-fallback-${contentType}-${Date.now()}.png`;
        const outputPath = path.join(process.cwd(), 'public', 'generated-images', fileName);
        
        // Ensure directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // Create a simple branded background with logo
        const background = sharp({
          create: {
            width: 1024,
            height: 1024,
            channels: 4,
            background: { r: 37, g: 99, b: 235, alpha: 1 } // Commertize blue
          }
        });
        
        const logo = await sharp(logoPath)
          .resize(400, null, { withoutEnlargement: true, fit: 'inside' })
          .png()
          .toBuffer();
        
        const image = await background
          .composite([{
            input: logo,
            gravity: 'center'
          }])
          .png()
          .toBuffer();
        
        fs.writeFileSync(outputPath, image);
        mediaFiles = [outputPath];
        console.log(`✅ Generated fallback branded image: ${fileName}`);
      }
    } catch (error) {
      console.error('Failed to generate fallback image:', error);
    }
    
    return {
      text: fallback.text,
      cta: fallback.cta,
      imagePrompt: fallback.imagePrompt,
      mediaType: 'image',
      media: mediaFiles
    };
  }
}

export const xContentGeneratorFixed = new XContentGeneratorFixed();
export default XContentGeneratorFixed;