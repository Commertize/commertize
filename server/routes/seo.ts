import { Router } from 'express';
import { db } from '../../db/index.js';
import { newsArticles } from '../../db/schema.js';
import { desc } from 'drizzle-orm';

const router = Router();

// XML Sitemap for Google indexing
router.get('/sitemap.xml', async (req, res) => {
  try {
    const siteDomain = process.env.SITE_DOMAIN || 'https://commertize.com';
    
    // Get all published articles
    const articles = await db.query.newsArticles.findMany({
      orderBy: [desc(newsArticles.publishedAt)],
      limit: 1000 // Google sitemap limit
    });

    // Static pages that should be indexed - SEO optimized order
    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      
      // High-priority SEO landing pages for target keywords
      { loc: '/commercial-real-estate-tokenization', priority: '0.95', changefreq: 'weekly' },
      { loc: '/fractional-ownership', priority: '0.95', changefreq: 'weekly' },
      { loc: '/ai-powered-cre', priority: '0.95', changefreq: 'weekly' },
      
      // Core business pages
      { loc: '/marketplace', priority: '0.9', changefreq: 'daily' },
      { loc: '/news', priority: '0.9', changefreq: 'daily' },
      { loc: '/market-updates', priority: '0.85', changefreq: 'daily' },
      { loc: '/about', priority: '0.8', changefreq: 'monthly' },
      { loc: '/team', priority: '0.7', changefreq: 'monthly' },
      { loc: '/submit', priority: '0.7', changefreq: 'monthly' },
      { loc: '/faq', priority: '0.6', changefreq: 'monthly' },
      { loc: '/privacy', priority: '0.5', changefreq: 'monthly' },
      { loc: '/terms', priority: '0.5', changefreq: 'monthly' }
    ];

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticPages.map(page => `  <url>
    <loc>${siteDomain}${page.loc}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
${articles.map(article => {
  const publishDate = article.publishedAt || article.createdAt;
  const isRecent = new Date().getTime() - new Date(publishDate).getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days
  
  return `  <url>
    <loc>${siteDomain}/news-articles/${article.slug}</loc>
    <lastmod>${article.updatedAt.toISOString()}</lastmod>
    <changefreq>${isRecent ? 'daily' : 'weekly'}</changefreq>
    <priority>${isRecent ? '0.8' : '0.6'}</priority>${article.imageUrl ? `
    <image:image>
      <image:loc>${siteDomain}${article.imageUrl}</image:loc>
      <image:title>${article.title}</image:title>
      <image:caption>${article.summary || ''}</image:caption>
    </image:image>` : ''}${isRecent ? `
    <news:news>
      <news:publication>
        <news:name>Commertize Intelligence</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${publishDate.toISOString()}</news:publication_date>
      <news:title><![CDATA[${article.title}]]></news:title>
      <news:keywords>${article.tags.join(', ')}</news:keywords>
    </news:news>` : ''}
  </url>`}).join('\n')}
</urlset>`;

    res.set({
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    });
    
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Robots.txt for search engine crawling guidelines
router.get('/robots.txt', (req, res) => {
  const siteDomain = process.env.SITE_DOMAIN || 'https://commertize.com';
  
  const robotsTxt = `User-agent: *
Allow: /

# Priority crawling paths for commercial real estate tokenization content
Allow: /news-articles/
Allow: /properties/
Allow: /news/
Allow: /invest/

# Disallow unnecessary paths
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /private/

# Sitemap location
Sitemap: ${siteDomain}/sitemap.xml

# Crawl delay for respectful crawling
Crawl-delay: 1

# Specific instructions for major search engines
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 2

# Commercial real estate and tokenization focused content
# Priority keywords: fractional ownership, commercial real estate, tokenization, RWA, real world assets`;

  res.set({
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
  });
  
  res.send(robotsTxt);
});

// News sitemap specifically for Google News
router.get('/news-sitemap.xml', async (req, res) => {
  try {
    const siteDomain = process.env.SITE_DOMAIN || 'https://commertize.com';
    
    // Get articles published in the last 30 days for Google News
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentArticles = await db.query.newsArticles.findMany({
      orderBy: [desc(newsArticles.publishedAt)],
      limit: 1000
    });

    const filteredArticles = recentArticles.filter(article => {
      const publishDate = new Date(article.publishedAt || article.createdAt);
      return publishDate >= thirtyDaysAgo;
    });

    const newsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${filteredArticles.map(article => {
  const publishDate = article.publishedAt || article.createdAt;
  
  return `  <url>
    <loc>${siteDomain}/news-articles/${article.slug}/seo</loc>
    <news:news>
      <news:publication>
        <news:name>Commertize Intelligence</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${publishDate.toISOString()}</news:publication_date>
      <news:title><![CDATA[${article.title}]]></news:title>
      <news:keywords>${article.tags.join(', ')}, commercial real estate, tokenization, fractional ownership, RWA</news:keywords>
      <news:genres>OpEd, Blog</news:genres>
      <news:stock_tickers>REIT</news:stock_tickers>
    </news:news>
  </url>`}).join('\n')}
</urlset>`;

    res.set({
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800' // Cache for 30 minutes
    });
    
    res.send(newsSitemap);
  } catch (error) {
    console.error('Error generating news sitemap:', error);
    res.status(500).send('Error generating news sitemap');
  }
});

export default router;