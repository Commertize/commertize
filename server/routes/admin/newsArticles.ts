import { Router } from 'express';
import { db } from '../../../db/index.js';
import { newsArticles } from '../../../db/schema.js';
import { desc, eq } from 'drizzle-orm';

const router = Router();

// Get all news articles (including unpublished)
router.get('/', async (req, res) => {
  try {
    const articles = await db.query.newsArticles.findMany({
      orderBy: [desc(newsArticles.createdAt)],
    });
    
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

// Publish/unpublish news article
router.patch('/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const { published } = req.body;

    const [updatedArticle] = await db
      .update(newsArticles)
      .set({
        publishedAt: published ? new Date() : null,
        updatedAt: new Date()
      })
      .where(eq(newsArticles.id, id))
      .returning();

    if (!updatedArticle) {
      return res.status(404).json({
        success: false,
        error: 'News article not found'
      });
    }

    res.json({
      success: true,
      data: updatedArticle
    });
  } catch (error) {
    console.error('Error updating news article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update news article'
    });
  }
});

// Delete news article
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [deletedArticle] = await db
      .delete(newsArticles)
      .where(eq(newsArticles.id, id))
      .returning();

    if (!deletedArticle) {
      return res.status(404).json({
        success: false,
        error: 'News article not found'
      });
    }

    res.json({
      success: true,
      message: 'News article deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting news article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete news article'
    });
  }
});

// Generate single news article for specific category
router.post('/generate-single', async (req, res) => {
  try {
    const { category } = req.body;
    const categories = ['CRE', 'Tokenization', 'RWA', 'Crypto', 'Digital Assets', 'Regulation', 'Technology', 'Markets'];
    
    const selectedCategory = category || categories[Math.floor(Math.random() * categories.length)];
    
    // Generate article for this category
    const generateResponse = await fetch(`${req.protocol}://${req.get('host')}/api/news-articles/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        category: selectedCategory,
        tags: ['Market Update', 'Analysis']
      }),
    });

    if (generateResponse.ok) {
      const result = await generateResponse.json();
      console.log(`Generated ${selectedCategory} article: ${result.data.title}`);
      
      res.json({
        success: true,
        data: result.data,
        message: `Generated news article for ${selectedCategory}`
      });
    } else {
      throw new Error('Failed to generate article');
    }

  } catch (error) {
    console.error('Error generating article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate news article'
    });
  }
});

// Bulk generate weekly news articles (keep for manual admin use)
router.post('/generate-weekly', async (req, res) => {
  try {
    const categories = ['CRE', 'Tokenization', 'RWA', 'Crypto', 'Digital Assets'];
    const generatedArticles = [];

    for (const category of categories) {
      try {
        // Generate article for this category
        const generateResponse = await fetch(`${req.protocol}://${req.get('host')}/api/news-articles/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            category,
            tags: ['Weekly Update', 'Market Analysis']
          }),
        });

        if (generateResponse.ok) {
          const result = await generateResponse.json();
          generatedArticles.push(result.data);
          console.log(`Generated ${category} article: ${result.data.title}`);
        }
      } catch (error) {
        console.error(`Error generating ${category} article:`, error);
      }
    }

    res.json({
      success: true,
      data: generatedArticles,
      message: `Generated ${generatedArticles.length} weekly news articles`
    });

  } catch (error) {
    console.error('Error generating weekly articles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate weekly articles'
    });
  }
});

export default router;