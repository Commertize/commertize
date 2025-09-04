import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import OpenAI from 'openai';
import path from 'path';
import { xPostTracker } from './xPostTracker';
import { db } from '../../db/index.js';
import { newsArticles } from '../../db/schema.js';
import { desc, eq } from 'drizzle-orm';

/**
 * Direct X Poster Service
 * Bypasses routing issues to post directly to X
 */
class DirectXPoster {
  private client: TwitterApi;
  private lastTweetIdByAccount: Map<string, string> = new Map();
  private priorityAccounts = [
    // Major RWA/Tokenization companies
    'RealBlocks',
    'tangible_co',
    'lofty_ai', 
    'securitize',
    'polymath_net',
    'harbor_trade',
    'centrifuge_io',
    'goldfinch_fi',
    'maple_finance',
    'truefihq',
    'creditdaofi',
    
    // DeFi protocols with RWA focus
    'MakerDAO',
    'AaveAave',
    'compoundfinance',
    'Uniswap',
    'synthetix_io',
    
    // Major CRE/PropTech accounts
    'CBRE',
    'cstargroup',
    'JLL_RealEstate',
    'cushwake',
    'HFFsecurities',
    'eastdil',
    'greenstinvest',
    'MetaProp_NYC',
    'PropTechVC',
    'REINnovate',
    
    // Crypto/Blockchain leaders discussing RWA
    'VitalikButerin',
    'justinsuntron',
    'CZ_Binance',
    'brian_armstrong',
    'haydenzadams',
    'StaniKulechov',
    'ethereumJoseph',
    'defiprime',
    'DeFiPulse',
    'TheRealWorld_RW'
  ];
  
  constructor() {
    this.client = new TwitterApi({
      appKey: process.env.X_API_KEY!,
      appSecret: process.env.X_API_SECRET!,
      accessToken: process.env.X_ACCESS_TOKEN!,
      accessSecret: process.env.X_ACCESS_TOKEN_SECRET!,
    });
  }

  async postTextTweet(text: string): Promise<{ success: boolean; tweetId?: string; url?: string; error?: string }> {
    try {
      console.log('🚀 Posting direct text tweet to X...');
      const result = await this.client.v2.tweet({ text });
      
      const tweetId = result.data.id;
      const url = `https://twitter.com/intent/status/${tweetId}`;
      
      console.log(`✅ Tweet posted successfully: ${tweetId}`);
      return { success: true, tweetId, url };
    } catch (error: any) {
      console.error('❌ Failed to post tweet:', error.message);
      return { success: false, error: error.message };
    }
  }

  async postWithImage(text: string, imagePath: string): Promise<{ success: boolean; tweetId?: string; url?: string; error?: string }> {
    try {
      if (!fs.existsSync(imagePath)) {
        throw new Error(`Image file not found: ${imagePath}`);
      }

      console.log('📤 Uploading image to X...');
      const mediaId = await this.client.v1.uploadMedia(imagePath);
      
      console.log('🚀 Posting tweet with image...');
      const result = await this.client.v2.tweet({
        text,
        media: { media_ids: [mediaId] }
      });
      
      const tweetId = result.data.id;
      const url = `https://twitter.com/intent/status/${tweetId}`;
      
      console.log(`✅ Tweet with image posted successfully: ${tweetId}`);
      return { success: true, tweetId, url };
    } catch (error: any) {
      console.error('❌ Failed to post tweet with image:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch recent news articles to include in posts
   */
  async getRecentArticles(limit: number = 3): Promise<any[]> {
    try {
      const articles = await db.select({
        id: newsArticles.id,
        title: newsArticles.title,
        slug: newsArticles.slug,
        summary: newsArticles.summary,
        category: newsArticles.category,
        publishedAt: newsArticles.publishedAt
      })
      .from(newsArticles)
      .orderBy(desc(newsArticles.publishedAt))
      .limit(limit);
      
      return articles;
    } catch (error) {
      console.error('Failed to fetch recent articles:', error);
      return [];
    }
  }

  /**
   * Create X post content with article link
   */
  async createPostWithArticle(article: any): Promise<string> {
    const domain = process.env.REPLIT_DOMAIN || 'commertize.com';
    const articleUrl = `https://${domain}/news/${article.slug}`;
    
    const postTemplates = [
      `📰 LATEST INSIGHT: ${article.title.length > 100 ? article.title.substring(0, 100) + '...' : article.title}

💡 Key insights on ${article.category} market trends and how tokenization is transforming commercial real estate.

Read the full analysis: ${articleUrl}

#Commertize #${article.category} #CommercialRealEstate #Tokenization`,

      `🔥 NEW ANALYSIS: ${article.title.length > 100 ? article.title.substring(0, 100) + '...' : article.title}

🏢 Understanding the future of commercial real estate through data-driven insights and market intelligence.

Discover more: ${articleUrl}

#Commertize #MarketInsights #${article.category} #PropTech`,

      `⚡ FRESH INTELLIGENCE: ${article.title.length > 100 ? article.title.substring(0, 100) + '...' : article.title}

📊 Deep dive into ${article.category.toLowerCase()} trends shaping the commercial real estate tokenization landscape.

Full report: ${articleUrl}

#Commertize #${article.category} #RealWorldAssets #Innovation`
    ];

    return postTemplates[Math.floor(Math.random() * postTemplates.length)];
  }

  async postScheduledContent(): Promise<void> {
    // 30% chance to include a news article link
    let includeArticle = Math.random() < 0.3;
    let selectedContent = '';

    if (includeArticle) {
      console.log('📰 Attempting to include news article in post...');
      const recentArticles = await this.getRecentArticles(5);
      
      if (recentArticles.length > 0) {
        // Select a random recent article
        const randomArticle = recentArticles[Math.floor(Math.random() * recentArticles.length)];
        selectedContent = await this.createPostWithArticle(randomArticle);
        console.log(`📰 Selected article: ${randomArticle.title.substring(0, 50)}...`);
      } else {
        console.log('📰 No articles found, using standard content');
        includeArticle = false; // Fall back to standard content
      }
    }

    // If no article or fallback needed, use standard content options
    if (!includeArticle || !selectedContent) {
      const contentOptions = [
      "🏢 Revolutionary Real Estate Investment\n\nTransform how you invest in premium commercial properties! Blockchain technology enables fractional ownership with instant global liquidity.\n\n🚀 Breakthrough Innovation\n💰 Democratized Investment\n⚡ 24/7 Global Trading\n🌍 Worldwide Property Access\n🔒 Blockchain Security\n\nExplore the future at Commertize.com\n\n#Commertize #Tokenization #Revolution #CRE",
      
      "💎 Premium Properties, Instant Access\n\nImagine owning shares of luxury office towers and retail centers with just a few clicks! Revolutionary blockchain makes property investment accessible to everyone.\n\n🏢 Exclusive Buildings\n⚡ Instant Liquidity\n🌍 Global Marketplace\n💰 Fractional Ownership\n\nDiscover more at Commertize.com\n\n#Commertize #RealWorldAssets #Innovation #PropTech",
      
      "🌟 The Future of Property Investment\n\nBreaking barriers! Own premium commercial real estate globally with revolutionary tokenization technology. Experience instant trading and transparent ownership.\n\n🚀 Groundbreaking Technology\n💰 Accessible Investment\n⚡ Lightning-Fast Trading\n🔒 Secure & Transparent\n\nJoin the revolution at Commertize.com\n\n#Commertize #Tokenization #PropTech #Innovation",
      
      "⚡ Investment Revolution Happening Now\n\nWitness the transformation of commercial real estate! Premium properties, fractional ownership, instant global liquidity - all powered by blockchain innovation.\n\n🏢 World-Class Properties\n💎 Fractional Ownership\n🌍 Global Opportunities\n⚡ Instant Settlement\n\nExplore today at Commertize.com\n\n#Commertize #Blockchain #InvestmentRevolution #CRE",
      
      "🔥 Exclusive Property Access Unlocked\n\nBreakthrough technology democratizes premium commercial real estate! Own shares of exclusive buildings with secure smart contracts and automated returns.\n\n💰 Exclusive Opportunities\n🔒 Smart Contract Security\n⚡ Automated Distributions\n🌍 Global Portfolio Access\n\nStart your journey at Commertize.com\n\n#Commertize #SmartContracts #ExclusiveAccess #Innovation",
      
      "🎯 Smart Real Estate Investing\n\nSkip the traditional barriers! Property owners are tokenizing their assets to unlock instant liquidity while investors gain access to premium commercial real estate.\n\n💡 Smarter Solutions\n🌐 Global Reach\n📈 Better Returns\n🔐 Blockchain Secured\n\nSee how at Commertize.com\n\n#Commertize #Tokenization #RealWorldAssets #CommercialRealEstate",
      
      "🚀 Property Tokenization Simplified\n\nWhat if you could invest in commercial real estate as easily as buying stocks? Now you can! Fractional ownership meets blockchain technology.\n\n✨ Simple Process\n🏢 Premium Buildings\n💰 Flexible Investment\n⚡ Instant Trades\n\nDiscover at Commertize.com\n\n#Commertize #PropTech #DigitalAssets #Innovation",
      
      "💫 Redefining Real Estate Ownership\n\nCommercial property investment is evolving. Tokenization breaks down barriers, creating opportunities for everyone to own pieces of premium real estate.\n\n🌟 Democratized Access\n🔗 Blockchain Power\n📊 Transparent Returns\n🌍 Global Markets\n\nJoin us at Commertize.com\n\n#Commertize #FutureOfFinance #Tokenization #CRE",

      // SPECIAL BRANDED MOMENTS
      "⚡ Commercial Real Estate\n\nTokenized.\nFractionalized.\nGlobalized.\nDemocratized.\nOptimized.\nDigitized.\nRevolutionized.\nCommertized.\n\n🏢✨ Experience the transformation\n\nCommertize.com\n\n#Commertize #Revolution #Tokenization #CRE",

      "🚀 Commertize Everything.\n\n💫 The Future is Here\n🌍 Global Real Estate Access\n⚡ Instant Liquidity\n🔗 Blockchain Powered\n\nCommertize.com\n\n#Commertize #Innovation #RealWorldAssets #Future",

        "🔥 Traditional Barriers?\n\nEliminated.\n\nGlobal Access?\n\nActivated.\n\nInstant Liquidity?\n\nDelivered.\n\nReal Estate?\n\nCommertized.\n\n⚡ Commertize.com\n\n#Commertize #DigitalTransformation #PropTech #Innovation"
      ];

      // Enhanced content selection to avoid recent duplicates
      let attempts = 0;
      const maxAttempts = contentOptions.length;

      do {
        const randomIndex = Math.floor(Math.random() * contentOptions.length);
        selectedContent = contentOptions[randomIndex];
        attempts++;
      } while (xPostTracker.isDuplicate(selectedContent) && attempts < maxAttempts);

      // If all options are duplicates, use timestamp-based variation
      if (xPostTracker.isDuplicate(selectedContent)) {
        const timestamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        selectedContent = selectedContent.replace('Commertize.com', `Commertize.com - ${timestamp} Update`);
      }
    }

    // Record the post to prevent future duplicates
    xPostTracker.recordPost(selectedContent, 'image');
    
    // Post with beautiful DALL-E image (no video generation)
    const result = await this.postWithBeautifulImage(selectedContent);
    
    if (result.success) {
      console.log(`✅ Scheduled image post successful: ${result.url}`);
    } else {
      console.error(`❌ Scheduled image post failed, trying text: ${result.error}`);
      // Fallback to text-only post
      const textResult = await this.postTextTweet(selectedContent);
      if (textResult.success) {
        console.log(`✅ Fallback text post successful: ${textResult.url}`);
      } else {
        console.error(`❌ All posting failed: ${textResult.error}`);
      }
    }
  }

  async postWithBeautifulImage(text: string): Promise<{ success: boolean; tweetId?: string; url?: string; error?: string }> {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const timestamp = Date.now();
      const imagePath = `./public/generated-images/x-post-beautiful-${timestamp}.png`;
      
      console.log('🎨 Creating beautiful DALL-E image for X post...');
      
      // Diverse building and digital asset prompts for variety
      const imagePrompts = [
        'Professional modern commercial office building with glass facade, urban business district, digital blockchain overlay, futuristic architecture, golden hour lighting, high quality, cinematic',
        'Luxury retail shopping center with contemporary architecture, digital asset visualization floating above, blockchain elements, professional photography, vibrant lighting',
        'Futuristic smart building with AI technology integration, holographic real estate data, blockchain network visualization, modern architecture, professional lighting',
        'International commercial real estate portfolio, world map with property markers, digital tokens floating, global investment concept, premium quality',
        'Modern PropTech office building with digital displays showing real estate data, blockchain visualization, contemporary architecture, professional photography',
        'Luxury investment portfolio visualization with commercial buildings, gold and blue financial graphics, digital asset tokens, premium quality rendering',
        'Premium office tower in business district, digital blockchain network overlay, tokenization concept, modern architecture, cinematic lighting, high resolution'
      ];
      
      const selectedPrompt = imagePrompts[Math.floor(Math.random() * imagePrompts.length)];
      console.log(`🏢 Generating beautiful image: ${selectedPrompt.substring(0, 50)}...`);
      
      try {
        const imageResponse = await openai.images.generate({
          model: 'dall-e-3',
          prompt: selectedPrompt,
          size: '1024x1024',
          quality: 'standard',
          n: 1
        });
        
        if (imageResponse.data && imageResponse.data[0]?.url) {
          const fetchResponse = await fetch(imageResponse.data[0].url);
          const imageBuffer = await fetchResponse.arrayBuffer();
          
          // Composite the Commertize logo onto the image (bottom right corner)
          const logoPath = path.join(process.cwd(), 'public', 'assets', 'commertize-logo.png');
          
          if (fs.existsSync(logoPath)) {
            const sharp = await import('sharp');
            
            // Load the base image and logo
            const baseImage = sharp.default(Buffer.from(imageBuffer));
            const logo = sharp.default(logoPath);
            
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
            const { width: logoWidth, height: logoHeight } = await sharp.default(logoResized).metadata();
            
            // Calculate safe positioning with proper padding (25px from edges) - bottom right corner
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
            console.log('✅ Beautiful DALL-E image generated with Commertize logo');
          } else {
            // Fallback: save without logo if logo file not found
            fs.writeFileSync(imagePath, Buffer.from(imageBuffer));
            console.log('✅ Beautiful DALL-E image generated (logo file not found)');
          }
        }
      } catch (aiError) {
        console.log('⚠️ DALL-E failed, using professional fallback image');
        // Create a professional fallback image if needed
        const fallbackPath = './public/generated-images/x-post-fallback.png';
        if (fs.existsSync(fallbackPath)) {
          fs.copyFileSync(fallbackPath, imagePath);
        }
      }
      
      if (fs.existsSync(imagePath)) {
        console.log('📤 Uploading beautiful image to X...');
        const mediaId = await this.client.v1.uploadMedia(imagePath);
        
        console.log('🚀 Posting tweet with beautiful image...');
        const result = await this.client.v2.tweet({
          text,
          media: { media_ids: [mediaId] }
        });
        
        // Clean up temp image
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        
        const tweetId = result.data.id;
        const url = `https://twitter.com/intent/status/${tweetId}`;
        
        console.log(`✅ Beautiful image post successful: ${tweetId}`);
        return { success: true, tweetId, url };
      } else {
        throw new Error('Beautiful image creation failed');
      }
    } catch (error: any) {
      console.error('❌ Failed to post with beautiful image:', error.message);
      return { success: false, error: error.message };
    }
  }

  async postEducationalThread(): Promise<{ success: boolean; threadUrl?: string; error?: string }> {
    try {
      console.log('📚 Creating pinned educational thread: "What is Commertize? The future of CRE in 7 tweets"');
      
      const threadTweets = [
        // Tweet 1 (Main thread starter)
        "🧵 What is Commertize? The future of commercial real estate, in 7 tweets.\n\nRevolutionizing the $16T CRE market from <1% digitized to fully tokenized and liquid. 🏢⚡\n\n#Commertize #RWA #CommercialRealEstate #Tokenization",
        
        // Tweet 2 
        "1/7 🏢 THE PROBLEM\n\nTraditional CRE is broken:\n• Paper contracts\n• Months of waiting\n• Zero liquidity\n• Gatekept access\n• Opaque processes\n\nResult? Most investors locked out of premium commercial properties. #Commertize",
        
        // Tweet 3
        "2/7 ⚡ THE SOLUTION\n\nCommertize tokenizes commercial real estate:\n• Smart contracts replace paper\n• Weeks not months to close\n• 24/7 global liquidity\n• Fractional ownership for all\n• Transparent, AI-driven analysis\n\nFrom archaic to algorithmic. #RWA",
        
        // Tweet 4
        "3/7 🤖 AI-POWERED INTELLIGENCE\n\nRUNE.CTZ (our AI agent) provides:\n• Deal Quality Index scoring\n• Risk assessment & modeling\n• Automated compliance checks\n• Investment matching\n\nOld CRE = opinion-based\nNew CRE = data-driven #Tokenization",
        
        // Tweet 5
        "4/7 💰 REAL SCENARIOS\n\nHotel needs $3M renovation:\n• Traditional: 18 months, high rates\n• Commertize: Tokenize → 30 days → investors get rental shares\n\nSpeed vs bureaucracy.\nLiquidity vs lock-up.\nAccessible vs exclusive. #PropTech",
        
        // Tweet 6
        "5/7 🌍 GLOBAL ACCESS\n\nCommertize opens CRE gates:\n✅ Fractional access to premium properties\n✅ Transparent data & analytics\n✅ Liquid secondary markets\n✅ Automated income distribution\n✅ Regulatory compliance built-in\n\nDemocratizing real estate investment. #Innovation",
        
        // Tweet 7 (CTA)
        "6/7 🚀 THE FUTURE IS HERE\n\nEvery outdated industry upgrades:\nBanking → FinTech\nCars → EVs\nMedia → Streaming\n\nNow it's CRE's turn.\n\nCommertize = the modernization of commercial real estate.\n\nExperience the future → Commertize.com ⚡\n\n#Commertize #Revolution"
      ];
      
      const tweetIds: string[] = [];
      let previousTweetId: string | undefined;
      
      for (let i = 0; i < threadTweets.length; i++) {
        try {
          const tweetData: any = { text: threadTweets[i] };
          
          // Reply to previous tweet to create thread (except for first tweet)
          if (previousTweetId) {
            tweetData.reply = { in_reply_to_tweet_id: previousTweetId };
          }
          
          const result = await this.client.v2.tweet(tweetData);
          const tweetId = result.data.id;
          tweetIds.push(tweetId);
          previousTweetId = tweetId;
          
          console.log(`✅ Posted thread tweet ${i + 1}/7: ${tweetId}`);
          
          // Wait between tweets to avoid rate limiting
          if (i < threadTweets.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error: any) {
          console.error(`❌ Failed to post thread tweet ${i + 1}: ${error.message}`);
          return { success: false, error: `Failed at tweet ${i + 1}: ${error.message}` };
        }
      }
      
      // Pin the first tweet (main thread starter)
      try {
        // Note: Twitter API v2 pinning might not be available in the free tier
        // await this.client.v2.pinTweet(tweetIds[0]);
        console.log(`🎯 Educational thread created (pin manually if needed): ${tweetIds[0]}`);
      } catch (pinError: any) {
        console.log(`⚠️ Thread pinning not available: ${pinError.message}`);
      }
      
      const threadUrl = `https://twitter.com/intent/status/${tweetIds[0]}`;
      console.log(`📚 Educational thread complete! URL: ${threadUrl}`);
      
      return { success: true, threadUrl };
      
    } catch (error: any) {
      console.error('❌ Educational thread creation failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async performEngagementRound(): Promise<void> {
    try {
      console.log('💬 Starting strategic engagement round for X replies...');
      
      // Enhanced search terms targeting CRE/DeFi news, competitors, and big finance
      const searchTerms = [
        'commercial real estate funding',
        'real estate liquidity crisis',
        'CRE refinancing',
        'property investment barriers',
        'real estate tokenization',
        'PropTech innovation',
        'DeFi real estate',
        'fractional ownership',
        'real estate blockchain',
        'commercial property market'
      ];
      
      const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
      
      try {
        const searchResults = await this.client.v2.search(randomTerm, {
          max_results: 15,
          'tweet.fields': ['author_id', 'created_at', 'public_metrics', 'context_annotations'],
          'user.fields': ['username', 'public_metrics', 'verified']
        });
        
        if (searchResults.data?.data && searchResults.data.data.length > 0) {
          const tweets = searchResults.data.data.slice(0, 2); // Strategic engagement with 2 high-quality tweets
          
          for (const tweet of tweets) {
            // Strategic replies that tie back to Commertize's mission
            const strategicReplies = [
              'This is exactly why we\'re modernizing CRE with tokenization. Traditional barriers are being eliminated → Commertize.com #Commertize',
              'Spot on! This highlights why tokenization is the future - instant liquidity vs months of waiting → Commertize.com #RWA',
              'Perfect example of why CRE needs modernization. From archaic to algorithmic → Commertize.com #Tokenization',
              'Exactly! This is why we\'re building Commertize - making CRE accessible, liquid, and transparent → Commertize.com #PropTech',
              'This proves why tokenization matters. From gatekept to accessible real estate → Commertize.com #CommercialRealEstate',
              'Great insight! This is precisely the problem Commertize solves - CRE without friction → Commertize.com #RWA',
              'You nailed it! Traditional CRE is broken. Tokenization is the modernization CRE needs → Commertize.com #Innovation'
            ];
            
            const randomReply = strategicReplies[Math.floor(Math.random() * strategicReplies.length)];
            
            try {
              await this.client.v2.tweet({
                text: randomReply,
                reply: { in_reply_to_tweet_id: tweet.id }
              });
              
              console.log(`✅ Strategic reply posted to ${tweet.id.substring(0, 10)}... - "${randomReply.substring(0, 50)}..."`);
              
              // Rate limiting: wait between strategic replies
              await new Promise(resolve => setTimeout(resolve, 3000));
            } catch (replyError: any) {
              console.log(`⚠️ Failed to reply to tweet ${tweet.id}: ${replyError.message}`);
            }
          }
          
          console.log(`💬 Strategic engagement complete: ${tweets.length} mission-driven replies posted`);
        } else {
          console.log('📭 No relevant tweets found for strategic engagement');
        }
      } catch (searchError: any) {
        console.log(`⚠️ Strategic search failed: ${searchError.message}`);
      }
    } catch (error: any) {
      console.error('❌ Strategic engagement failed:', error.message);
    }
  }

  // Real-time monitoring for immediate replies to priority accounts
  async monitorPriorityAccounts(): Promise<void> {
    try {
      console.log('🔍 Monitoring priority RWA/CRE accounts for real-time engagement...');
      
      // Check 5 random priority accounts each round to distribute API calls
      const accountsToCheck = this.shuffleArray([...this.priorityAccounts]).slice(0, 5);
      
      for (const username of accountsToCheck) {
        try {
          // Get user's latest tweets
          const userTweets = await this.client.v2.userTimeline(
            await this.getUserId(username),
            {
              max_results: 5,
              'tweet.fields': ['created_at', 'public_metrics', 'context_annotations'],
              exclude: ['retweets', 'replies']
            }
          );
          
          if (userTweets.data?.data && userTweets.data.data.length > 0) {
            const latestTweet = userTweets.data.data[0];
            const lastSeenId = this.lastTweetIdByAccount.get(username);
            
            // If this is a new tweet we haven't seen before
            if (latestTweet.id !== lastSeenId) {
              const tweetAge = this.getTweetAgeMinutes(latestTweet.created_at!);
              
              // Only reply to tweets posted in the last 5 minutes for maximum visibility
              if (tweetAge <= 5) {
                await this.replyToPriorityTweet(latestTweet, username);
              }
              
              // Update last seen tweet ID
              this.lastTweetIdByAccount.set(username, latestTweet.id);
            }
          }
          
          // Rate limiting between account checks
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (accountError: any) {
          console.log(`⚠️ Failed to check @${username}: ${accountError.message}`);
        }
      }
    } catch (error: any) {
      console.error('❌ Priority account monitoring failed:', error.message);
    }
  }

  private async replyToPriorityTweet(tweet: any, username: string): Promise<void> {
    try {
      console.log(`🎯 REAL-TIME REPLY: @${username} just posted! Replying immediately for max visibility...`);
      
      // Strategic replies specifically for priority accounts
      const priorityReplies = [
        'This is exactly why we built Commertize - tokenization is transforming CRE accessibility! From archaic to algorithmic → Commertize.com #Commertize #RWA',
        'Spot on! Traditional CRE barriers are crumbling. Tokenization = instant liquidity + global access → Commertize.com #Tokenization #PropTech',
        'Perfect timing! This is precisely why Commertize modernizes CRE - making premium properties accessible to all → Commertize.com #CommercialRealEstate',
        'Exactly! The future is tokenized real estate. From gatekept to accessible, from illiquid to instant → Commertize.com #RWA #Innovation',
        'Great insight! This highlights why CRE tokenization matters - democratizing access to premium properties → Commertize.com #Commertize #PropTech'
      ];
      
      const reply = priorityReplies[Math.floor(Math.random() * priorityReplies.length)];
      
      await this.client.v2.tweet({
        text: reply,
        reply: { in_reply_to_tweet_id: tweet.id }
      });
      
      console.log(`🚀 IMMEDIATE REPLY posted to @${username}'s tweet ${tweet.id.substring(0, 10)}... - "${reply.substring(0, 50)}..."`);
      
    } catch (error: any) {
      console.error(`❌ Failed to reply to priority tweet from @${username}: ${error.message}`);
    }
  }

  private async getUserId(username: string): Promise<string> {
    try {
      const user = await this.client.v2.userByUsername(username);
      return user.data?.id || '';
    } catch (error: any) {
      console.log(`⚠️ Could not find user @${username}: ${error.message}`);
      return '';
    }
  }

  private getTweetAgeMinutes(createdAt: string): number {
    const tweetTime = new Date(createdAt);
    const now = new Date();
    return Math.floor((now.getTime() - tweetTime.getTime()) / (1000 * 60));
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export default DirectXPoster;