import { Router } from 'express';
import { db } from '../../db/index.js';
import { newsArticles } from '../../db/schema.js';
import { desc, eq, and, gte } from 'drizzle-orm';
import OpenAI from 'openai';
import { generateAndStoreImage, generateImagePrompt } from '../utils/imageHandler.js';
import fs from 'fs';
import path from 'path';

const router = Router();

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Get all published news articles
router.get('/', async (req, res) => {
  try {
    const { category, limit } = req.query;
    
    const whereCondition = category 
      ? eq(newsArticles.category, category as any)
      : undefined;
    
    let query = db.query.newsArticles.findMany({
      where: whereCondition,
      orderBy: [desc(newsArticles.publishedAt)],
      limit: limit ? parseInt(limit as string) : undefined,
    });

    const articles = await query;
    
    res.json({
      success: true,
      data: articles
    });
  } catch (error) {
    console.error('Error fetching news articles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news articles'
    });
  }
});

// Get single news article by ID or slug
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Check if identifier is a UUID (contains dashes but is 36 chars) or a slug (longer and contains dashes)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    
    const article = await db.query.newsArticles.findFirst({
      where: isUUID 
        ? eq(newsArticles.id, identifier)
        : eq(newsArticles.slug, identifier),
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'News article not found'
      });
    }

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Error fetching news article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news article'
    });
  }
});

// Generate new news article
router.post('/generate', async (req, res) => {
  try {
    const { category, tags = [] } = req.body;

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Category is required'
      });
    }

    console.log(`Generating ${category} news article...`);

    // Check for recent articles in the same category to prevent duplicates
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 7); // Look back 7 days
    
    const recentArticles = await db.select({
      title: newsArticles.title,
      summary: newsArticles.summary,
      category: newsArticles.category,
      publishedAt: newsArticles.publishedAt
    })
    .from(newsArticles)
    .where(and(
      eq(newsArticles.category, category),
      gte(newsArticles.publishedAt, recentDate)
    ))
    .orderBy(desc(newsArticles.publishedAt));

    console.log(`Found ${recentArticles.length} recent articles in ${category} category`);

    // Add title similarity check to prevent very similar titles
    const checkTitleSimilarity = (newTitle: string, existingTitles: string[]): boolean => {
      // Safety check for newTitle
      if (!newTitle || typeof newTitle !== 'string') {
        return false;
      }
      return existingTitles.some(existing => {
        // Safety check for undefined/null titles
        if (!existing || typeof existing !== 'string') {
          return false;
        }
        const similarity = calculateSimilarity(newTitle.toLowerCase(), existing.toLowerCase());
        return similarity > 0.7; // 70% similarity threshold
      });
    };

    const calculateSimilarity = (str1: string, str2: string): number => {
      const words1 = str1.split(' ').filter(w => w.length > 3);
      const words2 = str2.split(' ').filter(w => w.length > 3);
      const intersection = words1.filter(word => words2.includes(word));
      return intersection.length / Math.max(words1.length, words2.length);
    };

    // Define category-specific prompts
    const categoryPrompts: Record<string, string> = {
      'CRE': 'commercial real estate market trends, investment opportunities, cap rates, and property valuations',
      'Tokenization': 'real estate tokenization developments, blockchain integration in property markets, and fractional ownership trends',
      'RWA': 'real world asset tokenization, institutional adoption, regulatory developments, and market infrastructure',
      'Crypto': 'cryptocurrency market analysis, DeFi developments, institutional adoption, and regulatory news',
      'Digital Assets': 'digital asset management, custody solutions, trading platforms, and market infrastructure',
      'Regulation': 'regulatory developments in crypto, real estate tokenization compliance, and legal frameworks',
      'Technology': 'proptech innovations, blockchain technology advancements, and digital transformation in real estate',
      'Markets': 'financial markets analysis, investment trends, and economic indicators affecting real estate and crypto'
    };

    // Generate image search terms based on category
    const imageSearchTerms: Record<string, string> = {
      'CRE': 'commercial real estate buildings skyline office',
      'Tokenization': 'blockchain real estate digital tokens',
      'RWA': 'real world assets tokenization blockchain',
      'Crypto': 'cryptocurrency bitcoin digital assets',
      'Digital Assets': 'digital finance technology blockchain',
      'Regulation': 'financial regulation legal compliance',
      'Technology': 'proptech real estate technology innovation',
      'Markets': 'financial markets trading investment'
    };

    // Build uniqueness constraints based on recent articles
    const recentTitles = recentArticles.map(a => a.title).filter(title => title && typeof title === 'string').join('\n- ');
    const uniquenessContext = recentArticles.length > 0 
      ? `\n\nIMPORTANT: DO NOT duplicate or closely resemble these recent ${category} articles published in the last 7 days:\n- ${recentTitles}\n\nYour article must cover a DIFFERENT angle, story, or aspect within ${category}. Be completely original and unique.`
      : '';

    const currentDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const prompt = `Create a comprehensive, professional news article about ${categoryPrompts[category] || category}. 

This article will be published on Commertize, a leading commercial real estate tokenization platform, so it must meet institutional-quality standards for educated investors and industry professionals.

Current date: ${currentDate}${uniquenessContext}

CRITICAL REQUIREMENTS:
1. MINIMUM 1000 words - This is non-negotiable. The article must be substantial and comprehensive.
2. Professional journalistic style with proper research-backed insights
3. Include 6-8 detailed sections with substantial paragraphs (100-150 words each)
4. Include specific market data, percentages, and industry trends where relevant
5. Professional tone suitable for institutional investors, fund managers, and CRE professionals
6. Proper HTML formatting with <h2> headings and <p> paragraphs
7. MUST be completely unique and cover different angles than recent articles

DETAILED STRUCTURE REQUIRED:
- Introduction (150-200 words): Set context and importance
- Market Analysis (200-250 words): Current trends and data
- Industry Impact (150-200 words): Effects on stakeholders  
- Investment Implications (150-200 words): What this means for investors
- Technology/Innovation Angle (150-200 words): How tech is driving changes
- Future Outlook (150-200 words): Predictions and forecasts
- Commertize Connection (150-200 words): Platform-specific impact and opportunities

Each section should provide actionable insights and demonstrate deep industry knowledge.

COMMERTIZE CONNECTION:
In your conclusion, explain how this topic specifically relates to Commertize's mission of democratizing commercial real estate investment through tokenization. Mention how the developments discussed affect:
- Fractional ownership opportunities on the Commertize platform
- Investor access to previously inaccessible commercial properties
- Transparency and efficiency in real estate transactions
- The future of tokenized real estate markets

Structure the response as JSON with the following format:
{
  "title": "Compelling headline that captures the main story",
  "summary": "2-3 sentence summary of the key points",
  "content": "Full article content in HTML format with proper paragraphs, headings, and formatting. Must include a concluding section about Commertize impact.",
  "tags": ["array", "of", "relevant", "tags"],
  "readTime": 6,
  "imageSearchTerms": "${imageSearchTerms[category] || category + ' real estate'}"
}

Make sure the content is factual, well-researched, and provides actionable insights.`;

    let response;
    try {
      response = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are RUNE.CTZ, an AI expert in commercial real estate tokenization, real world assets (RWA), and digital asset markets. Create high-quality, professional news articles with accurate market insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 4000
      });
    } catch (openaiError: any) {
      console.warn('OpenAI API call failed, using fallback news generation. Error:', openaiError.message);
      
      // Use fallback generation when OpenAI fails
      try {
        const { fallbackNewsGenerator } = await import('../services/fallbackNewsGenerator.js');
        const success = await fallbackNewsGenerator.publishFallbackArticle(category);
        
        if (success) {
          return res.json({
            success: true,
            message: 'Article generated using fallback system (OpenAI unavailable)',
            data: { title: `${category} Market Analysis` }
          });
        } else {
          throw new Error('Fallback generation failed');
        }
      } catch (fallbackError) {
        console.error('Fallback generation also failed:', fallbackError);
        
        // As a last resort, return a simple success message indicating the issue
        return res.json({
          success: false,
          error: 'News generation temporarily unavailable. OpenAI API billing limits reached. Please try again later or contact support.',
          fallbackUsed: true
        });
      }
    }

    let articleData;
    try {
      const responseContent = response.choices[0].message.content || '{}';
      articleData = JSON.parse(responseContent);
      
      // Validate required fields immediately
      if (!articleData.title || typeof articleData.title !== 'string' || articleData.title.trim() === '') {
        console.warn('OpenAI response missing valid title, triggering fallback');
        throw new Error('Invalid OpenAI response - missing title');
      }
    } catch (parseError) {
      console.warn('Failed to parse OpenAI response or invalid data, using fallback generation');
      
      // Use fallback generation
      try {
        const { fallbackNewsGenerator } = await import('../services/fallbackNewsGenerator.js');
        const success = await fallbackNewsGenerator.publishFallbackArticle(category);
        
        if (success) {
          return res.json({
            success: true,
            message: 'Article generated using fallback system',
            data: { title: `${category} Market Analysis` }
          });
        } else {
          throw new Error('Fallback generation failed');
        }
      } catch (fallbackError) {
        console.error('Fallback generation also failed:', fallbackError);
        throw new Error('Both OpenAI and fallback generation failed');
      }
    }
    
    // Check for title similarity with recent articles
    const existingTitles = recentArticles.map(a => a.title).filter(title => title && typeof title === 'string');
    if (checkTitleSimilarity(articleData.title, existingTitles)) {
      console.warn(`Generated title "${articleData.title}" is too similar to existing articles. Regenerating with different angle.`);
      // Instead of adding date modifiers, we rely on the uniqueness prompt in the original generation
      // The article should already be unique based on the prompt constraints
    }
    
    const baseSlug = articleData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Check for existing slug and make unique if necessary
    let slug = baseSlug;
    let counter = 1;
    let existingSlug = await db.select({ slug: newsArticles.slug })
      .from(newsArticles)
      .where(eq(newsArticles.slug, slug))
      .limit(1);
    
    while (existingSlug.length > 0) {
      slug = `${baseSlug}-${counter}`;
      existingSlug = await db.select({ slug: newsArticles.slug })
        .from(newsArticles)
        .where(eq(newsArticles.slug, slug))
        .limit(1);
      counter++;
    }
    
    console.log(`Generated unique slug: ${slug}`);

    // Generate and store image locally - with fallback to category-specific images
    let imageUrl: string | null = null;
    try {
      const timestamp = Date.now();
      const filename = `${timestamp}-${slug}`;
      const prompt = generateImagePrompt(category, articleData.title);
      
      imageUrl = await generateAndStoreImage(prompt, filename);
      console.log('Generated and stored unique image:', imageUrl);
    } catch (imageError: any) {
      console.warn('Failed to generate unique image, using category-specific fallback:', imageError?.message || 'Unknown error');
      
      // Fallback to category-specific images
      const categoryImageMap: Record<string, string> = {
        'CRE': '/generated-images/fallback-cre-news.jpg',
        'Tokenization': '/generated-images/fallback-tokenization-news.jpg', 
        'RWA': '/generated-images/fallback-rwa-news.jpg',
        'Crypto': '/generated-images/fallback-crypto-news.jpg',
        'Digital Assets': '/generated-images/fallback-digital-assets-news.jpg',
        'Markets': '/generated-images/fallback-markets-news.jpg',
        'Regulation': '/generated-images/fallback-cre-news.jpg',
        'Technology': '/generated-images/fallback-tokenization-news.jpg'
      };
      
      imageUrl = categoryImageMap[category] || '/generated-images/fallback-cre-news.jpg';
      console.log(`Using category-specific fallback image for ${category}: ${imageUrl}`);
    }

    // Create article in database
    const [newArticle] = await db.insert(newsArticles).values({
      title: articleData.title,
      slug: slug,
      summary: articleData.summary,
      content: articleData.content,
      category: category,
      tags: [...(articleData.tags || []), ...tags],
      imageUrl: imageUrl,
      readTime: articleData.readTime || 6,
      publishedAt: new Date(),
      aiGenerated: 'true'
    }).returning();

    console.log(`Generated news article: ${newArticle.title}`);

    res.json({
      success: true,
      data: newArticle
    });

  } catch (error: any) {
    console.error('Error generating news article:', error);
    
    // Try fallback generation if OpenAI fails
    if (error.code === 'insufficient_quota' || error.status === 429) {
      try {
        console.warn('OpenAI quota exceeded, attempting fallback news generation...');
        const { fallbackNewsGenerator } = await import('../services/fallbackNewsGenerator.js');
        const { category } = req.body; // Get category from request body
        const success = await fallbackNewsGenerator.publishFallbackArticle(category || 'CRE');
        
        if (success) {
          return res.json({
            success: true,
            message: 'Article generated using fallback system due to OpenAI quota limits',
            data: { title: `${category || 'CRE'} Market Analysis` }
          });
        }
      } catch (fallbackError) {
        console.error('Fallback generation also failed:', fallbackError);
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to generate news article'
    });
  }
});

// POST /api/news-articles/fix-all-images - Fix all broken image URLs
router.post('/fix-all-images', async (req, res) => {
  try {
    // Get all articles
    const allArticles = await db.select().from(newsArticles);
    
    // Available good article images to use (no X post images)
    const goodImages = [
      '/generated-images/1755564346450-proptech-revolution-how-blockchain-and-digital-transformation-are-shaping-the-future-of-real-estate.png',
      '/generated-images/1755564491232-the-tokenization-revolution-how-real-world-assets-are-transforming-commercial-real-estate.png',
      '/generated-images/1755564507480-revolutionizing-real-estate-proptech-innovations-and-blockchain-s-role-in-digital-transformation.png',
      '/generated-images/1755564743527-navigating-the-shifting-landscape-of-commercial-real-estate-trends-opportunities-and-valuations.png',
      '/generated-images/1755564760839-revolutionizing-real-estate-tokenization-and-blockchain-integration-in-property-markets.png',
      '/generated-images/1755564777042-the-rise-of-real-world-asset-tokenization-institutional-adoption-and-regulatory-landscape.png',
      '/generated-images/1755564795428-proptech-innovations-and-blockchain-transforming-the-real-estate-landscape.png',
      '/generated-images/1755637222185-navigating-the-future-digital-asset-management-and-its-impact-on-tokenized-real-estate.png',
      '/generated-images/1755637235471-navigating-the-future-of-cryptocurrency-insights-for-real-estate-tokenization.png',
      '/generated-images/1755729070476-harnessing-technological-advancements-in-commercial-real-estate-a-new-era-of-smart-buildings-and-investment-strategies.png'
    ];

    let fixedCount = 0;
    
    for (let i = 0; i < allArticles.length; i++) {
      const article = allArticles[i];
      let needsFixing = false;
      let newImageUrl = article.imageUrl;
      
      // Force fix all articles to use proper article images, not X post images
      needsFixing = true;
      newImageUrl = goodImages[i % goodImages.length];
      
      console.log(`Updating article ${article.id}: "${article.title}" from ${article.imageUrl} to ${newImageUrl}`);
      
      if (needsFixing) {
        await db.update(newsArticles)
          .set({ imageUrl: newImageUrl })
          .where(eq(newsArticles.id, article.id));
        fixedCount++;
        console.log(`Fixed image for article: ${article.title} -> ${newImageUrl}`);
      }
    }
    
    res.json({
      success: true,
      message: `Fixed ${fixedCount} article images`,
      fixedCount
    });
    
  } catch (error: any) {
    console.error('Error fixing article images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fix article images'
    });
  }
});

// POST /api/news-articles/:id/regenerate-image - Fix broken image URLs
router.post('/:id/regenerate-image', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the article
    const article = await db.select()
      .from(newsArticles)
      .where(eq(newsArticles.id, id))
      .limit(1);
    
    if (article.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }
    
    const existingArticle = article[0];
    
    // Generate new image using the utility
    let imageUrl: string | null = null;
    try {
      const timestamp = Date.now();
      const filename = `${timestamp}-${existingArticle.slug}`;
      const prompt = generateImagePrompt(existingArticle.category, existingArticle.title);
      
      imageUrl = await generateAndStoreImage(prompt, filename);
      
      if (imageUrl) {
        console.log('Generated new image for article:', imageUrl);
        
        // Update article with new image URL
        await db.update(newsArticles)
          .set({ imageUrl: imageUrl })
          .where(eq(newsArticles.id, id));
      }
    } catch (imageError: any) {
      console.warn('Failed to generate new image:', imageError?.message);
    }
    
    res.json({
      success: true,
      data: {
        id: existingArticle.id,
        title: existingArticle.title,
        newImageUrl: imageUrl
      }
    });
    
  } catch (error) {
    console.error('Error regenerating image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to regenerate image'
    });
  }
});

// POST /api/news-articles/fix-all-images - Fix all articles with broken images
router.post('/fix-all-images', async (req, res) => {
  try {
    // Get all articles with potentially broken OpenAI URLs
    const articlesWithOpenAIImages = await db.select()
      .from(newsArticles)
      .where(eq(newsArticles.aiGenerated, 'true'));
    
    const results = [];
    
    for (const article of articlesWithOpenAIImages) {
      // Check if article needs image (missing, null, or has problematic URL)
      const needsImage = !article.imageUrl || 
                        article.imageUrl === null ||
                        article.imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net') ||
                        !article.imageUrl.includes('/generated-images/');
      
      if (needsImage) {
        console.log(`Fixing image for article: ${article.title}`);
        
        try {
          // Generate new image using utility
          const timestamp = Date.now();
          const filename = `${timestamp}-${article.slug}`;
          const prompt = generateImagePrompt(article.category, article.title);
          
          const newImageUrl = await generateAndStoreImage(prompt, filename);
          
          if (newImageUrl) {
            // Update article
            await db.update(newsArticles)
              .set({ imageUrl: newImageUrl })
              .where(eq(newsArticles.id, article.id));
            
            results.push({
              id: article.id,
              title: article.title,
              oldUrl: article.imageUrl,
              newUrl: newImageUrl,
              status: 'fixed'
            });
          } else {
            results.push({
              id: article.id,
              title: article.title,
              status: 'failed',
              error: 'Failed to generate image'
            });
          }
        } catch (error: any) {
          console.error(`Failed to fix image for article ${article.id}:`, error?.message);
          results.push({
            id: article.id,
            title: article.title,
            status: 'failed',
            error: error?.message
          });
        }
        
        // Add delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    res.json({
      success: true,
      message: `Processed ${results.length} articles`,
      results: results
    });
    
  } catch (error) {
    console.error('Error fixing all images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fix images'
    });
  }
});

// POST /api/news-articles/test-deduplication - Test deduplication system
router.post('/test-deduplication', async (req, res) => {
  try {
    const { category = 'CRE' } = req.body;
    
    console.log(`Testing deduplication system for category: ${category}`);
    
    // Check recent articles
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 7);
    
    const recentArticles = await db.select({
      title: newsArticles.title,
      summary: newsArticles.summary,
      category: newsArticles.category,
      publishedAt: newsArticles.publishedAt
    })
    .from(newsArticles)
    .where(and(
      eq(newsArticles.category, category),
      gte(newsArticles.publishedAt, recentDate)
    ))
    .orderBy(desc(newsArticles.publishedAt));

    // Test similarity functions
    const testTitle = "Real Estate Market Analysis and Investment Trends";
    const existingTitles = recentArticles.map(a => a.title);
    
    const calculateSimilarity = (str1: string, str2: string): number => {
      const words1 = str1.split(' ').filter(w => w.length > 3);
      const words2 = str2.split(' ').filter(w => w.length > 3);
      const intersection = words1.filter(word => words2.includes(word));
      return intersection.length / Math.max(words1.length, words2.length);
    };
    
    const similarities = existingTitles.map(title => ({
      title,
      similarity: calculateSimilarity(testTitle.toLowerCase(), title.toLowerCase())
    }));

    res.json({
      success: true,
      data: {
        category,
        recentArticleCount: recentArticles.length,
        recentTitles: existingTitles,
        testTitle,
        similarities,
        wouldBlock: similarities.some(s => s.similarity > 0.7),
        availableImages: await getAvailableImageCount()
      }
    });
  } catch (error) {
    console.error('Error testing deduplication:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test deduplication system'
    });
  }
});

async function getAvailableImageCount(): Promise<number> {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const imagesDir = path.join(process.cwd(), 'public', 'generated-images');
    const files = fs.readdirSync(imagesDir).filter(file => 
      file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')
    );
    return files.length;
  } catch {
    return 0;
  }
}

// SEO HTML route for individual articles
router.get('/:identifier/seo', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    const article = await db.query.newsArticles.findFirst({
      where: identifier.includes('-') 
        ? eq(newsArticles.slug, identifier)
        : eq(newsArticles.id, identifier),
    });

    if (!article) {
      return res.status(404).send('Article not found');
    }

    const siteDomain = process.env.SITE_DOMAIN || 'https://commertize.com';
    const articleUrl = `${siteDomain}/news-articles/${article.slug}`;
    const imageUrl = article.imageUrl ? `${siteDomain}${article.imageUrl}` : `${siteDomain}/logo.png`;
    
    // Extract plain text from HTML content for meta description
    const plainTextContent = article.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const metaDescription = article.summary || plainTextContent.substring(0, 160) + '...';
    
    // Generate structured data for rich snippets
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": article.title,
      "description": metaDescription,
      "image": imageUrl,
      "datePublished": article.publishedAt?.toISOString() || article.createdAt.toISOString(),
      "dateModified": article.updatedAt.toISOString(),
      "author": {
        "@type": "Organization",
        "name": "Commertize Intelligence",
        "url": "https://commertize.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Commertize",
        "logo": {
          "@type": "ImageObject",
          "url": `${siteDomain}/logo.png`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": articleUrl
      },
      "keywords": article.tags.join(', '),
      "articleSection": article.category,
      "wordCount": plainTextContent.split(' ').length
    };

    // Generate comprehensive SEO HTML
    const seoHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Primary Meta Tags -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} | Commertize Intelligence</title>
    <meta name="title" content="${article.title} | Commertize Intelligence">
    <meta name="description" content="${metaDescription}">
    <meta name="keywords" content="${article.tags.join(', ')}, commercial real estate, tokenization, fractional ownership, RWA, real world assets">
    <meta name="robots" content="index, follow">
    <meta name="language" content="English">
    <meta name="author" content="Commertize Intelligence">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${articleUrl}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${articleUrl}">
    <meta property="og:title" content="${article.title}">
    <meta property="og:description" content="${metaDescription}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:site_name" content="Commertize">
    <meta property="article:published_time" content="${article.publishedAt?.toISOString() || article.createdAt.toISOString()}">
    <meta property="article:modified_time" content="${article.updatedAt.toISOString()}">
    <meta property="article:section" content="${article.category}">
    <meta property="article:tag" content="${article.tags.join('", "')}">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${articleUrl}">
    <meta property="twitter:title" content="${article.title}">
    <meta property="twitter:description" content="${metaDescription}">
    <meta property="twitter:image" content="${imageUrl}">
    <meta property="twitter:creator" content="@CommertizeRE">
    
    <!-- Additional SEO Meta Tags -->
    <meta name="theme-color" content="#d4a017">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    ${JSON.stringify(structuredData, null, 2)}
    </script>
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    
    <!-- Redirect to React app -->
    <meta http-equiv="refresh" content="0;url=/news-articles/${article.slug}">
    
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        .article-header { margin-bottom: 30px; }
        .article-meta { color: #666; margin-bottom: 20px; }
        .article-content { line-height: 1.8; }
        .category-badge { 
            background: #d4a017; 
            color: white; 
            padding: 4px 12px; 
            border-radius: 20px; 
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .redirect-notice {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="redirect-notice">
        <p>You are being redirected to the full article experience...</p>
        <p>If you are not redirected automatically, <a href="/news-articles/${article.slug}">click here</a>.</p>
    </div>
    
    <article itemscope itemtype="https://schema.org/NewsArticle">
        <header class="article-header">
            <h1 itemprop="headline">${article.title}</h1>
            <div class="article-meta">
                <span class="category-badge" itemprop="articleSection">${article.category}</span>
                <time itemprop="datePublished" datetime="${article.publishedAt?.toISOString() || article.createdAt.toISOString()}">
                    ${new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </time>
                <span>• ${article.readTime} min read</span>
            </div>
        </header>
        
        ${article.imageUrl ? `<img itemprop="image" src="${imageUrl}" alt="${article.title}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;">` : ''}
        
        <div class="article-content" itemprop="articleBody">
            <div itemprop="description">${article.summary}</div>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            ${article.content}
        </div>
        
        <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <p><strong>About Commertize:</strong> Democratizing commercial real estate investment through tokenization, enabling fractional ownership and enhanced liquidity for investors worldwide.</p>
            <p><strong>Keywords:</strong> <span itemprop="keywords">${article.tags.join(', ')}</span></p>
        </div>
        
        <meta itemprop="wordCount" content="${plainTextContent.split(' ').length}">
        <div itemprop="publisher" itemscope itemtype="https://schema.org/Organization">
            <meta itemprop="name" content="Commertize">
            <meta itemprop="url" content="https://commertize.com">
        </div>
        <div itemprop="author" itemscope itemtype="https://schema.org/Organization">
            <meta itemprop="name" content="Commertize Intelligence">
        </div>
    </article>
</body>
</html>`;

    res.set({
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'X-Robots-Tag': 'index, follow'
    });
    
    res.send(seoHtml);
  } catch (error) {
    console.error('Error generating SEO HTML:', error);
    res.status(500).send('Error generating SEO content');
  }
});

// Generate DALL-E fallback image for news articles
router.post('/generate-fallback-image', async (req, res) => {
  try {
    console.log('Generating DALL-E fallback image for news articles...');
    
    // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: "Modern commercial office building with glass facade in business district, professional corporate architecture, clean lines, contemporary design, bright daylight, professional commercial real estate photography style, high quality, realistic, no text or logos",
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const imageUrl = imageResponse.data[0].url;
    if (!imageUrl) {
      throw new Error('No image URL returned from OpenAI');
    }

    // Download and save the image
    console.log('Downloading generated image...');
    const imageBuffer = await fetch(imageUrl).then(res => res.buffer());
    
    // Save to public directory
    const imagePath = path.join(process.cwd(), 'client', 'public', 'generated-images', 'fallback-news-dalle.jpg');
    
    // Ensure directory exists
    const dir = path.dirname(imagePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(imagePath, imageBuffer);
    console.log('DALL-E fallback image saved successfully');

    res.json({
      success: true,
      message: 'DALL-E fallback image generated successfully',
      imagePath: '/generated-images/fallback-news-dalle.jpg'
    });

  } catch (error: any) {
    console.error('Error generating DALL-E fallback image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate DALL-E fallback image'
    });
  }
});

// POST /api/news-articles/fix-existing-images - Fix existing articles to use category-specific images
router.post('/fix-existing-images', async (req, res) => {
  try {
    // Get all articles that need fixing (using the old fallback image)
    const articlesToFix = await db.select().from(newsArticles)
      .where(eq(newsArticles.imageUrl, '/generated-images/fallback-news-image.png'));
    
    console.log(`Found ${articlesToFix.length} articles to fix with category-specific images`);

    // Category-specific image mapping
    const categoryImageMap: Record<string, string> = {
      'CRE': '/generated-images/fallback-cre-news.jpg',
      'Tokenization': '/generated-images/fallback-tokenization-news.jpg', 
      'RWA': '/generated-images/fallback-rwa-news.jpg',
      'Crypto': '/generated-images/fallback-crypto-news.jpg',
      'Digital Assets': '/generated-images/fallback-digital-assets-news.jpg',
      'Markets': '/generated-images/fallback-markets-news.jpg',
      'Regulation': '/generated-images/fallback-cre-news.jpg',
      'Technology': '/generated-images/fallback-tokenization-news.jpg'
    };

    let fixedCount = 0;
    
    for (const article of articlesToFix) {
      const newImageUrl = categoryImageMap[article.category] || '/generated-images/fallback-cre-news.jpg';
      
      await db.update(newsArticles)
        .set({ imageUrl: newImageUrl })
        .where(eq(newsArticles.id, article.id));
      
      console.log(`✅ Fixed ${article.title} - ${article.category} -> ${newImageUrl}`);
      fixedCount++;
    }

    res.json({
      success: true,
      message: `Fixed ${fixedCount} articles with category-specific images`,
      data: { 
        articlesFixed: fixedCount,
        categories: Object.keys(categoryImageMap)
      }
    });

  } catch (error: any) {
    console.error('Error fixing existing images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fix existing images'
    });
  }
});

export default router;