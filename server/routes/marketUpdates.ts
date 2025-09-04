import express from 'express';
import OpenAI from 'openai';
import { db, marketUpdates, MarketUpdate, NewMarketUpdate } from '../../db';
import { eq, desc, and, or } from 'drizzle-orm';
import { fetchCREMetrics, fetchRWAStats, fetchRegulatoryNews, getHistoricalTrends } from '../services/dataIngest';

const router = express.Router();

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// GET /api/market-updates - List market updates
router.get('/', async (req, res) => {
  try {
    console.log('Market updates API called with params:', req.query);
    const { type, limit = 10, tags } = req.query;
    
    const conditions = [];
    if (type) {
      conditions.push(eq(marketUpdates.type, type as any));
    }
    if (tags) {
      // Filter by tags array overlap
      const tagArray = Array.isArray(tags) ? tags : [tags];
      // This would need a proper array overlap operator in production
    }
    
    let query = db.select().from(marketUpdates);
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const updates = await query
      .orderBy(desc(marketUpdates.createdAt))
      .limit(Number(limit));

    console.log('Found market updates:', updates.length);
    
    res.json({
      success: true,
      data: updates
    });
  } catch (error) {
    console.error('Error fetching market updates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market updates'
    });
  }
});

// GET /api/market-updates/:id - Get specific market update
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const update = await db.select()
      .from(marketUpdates)
      .where(eq(marketUpdates.id, id))
      .limit(1);
    
    if (update.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Market update not found'
      });
    }

    res.json({
      success: true,
      data: update[0]
    });
  } catch (error) {
    console.error('Error fetching market update:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market update'
    });
  }
});

// POST /api/market-updates/generate - Generate new market update
router.post('/generate', async (req, res) => {
  try {
    const { type = 'daily', force = false, focus = ['CRE', 'Tokenization', 'RWA'] } = req.body;

    // Check if we already have a recent update of this type
    if (!force) {
      const cutoff = new Date();
      if (type === 'daily') {
        cutoff.setHours(cutoff.getHours() - 20); // 20 hours ago
      } else if (type === 'weekly') {
        cutoff.setDate(cutoff.getDate() - 6); // 6 days ago
      }
      
      const existingUpdate = await db.select()
        .from(marketUpdates)
        .where(and(
          eq(marketUpdates.type, type),
          // Need to implement date comparison
        ))
        .limit(1);
      
      if (existingUpdate.length > 0 && !force) {
        return res.json({
          success: true,
          message: 'Recent update already exists',
          data: existingUpdate[0]
        });
      }
    }

    // Fetch current market data
    const [creMetrics, rwaStats, news, trends] = await Promise.all([
      fetchCREMetrics(),
      fetchRWAStats(),
      fetchRegulatoryNews(),
      getHistoricalTrends()
    ]);

    // Prepare data for AI
    const dataInputs = {
      metrics: {
        averageCapRate: creMetrics.reduce((sum, m) => sum + m.capRate, 0) / creMetrics.length,
        averageVacancy: creMetrics.reduce((sum, m) => sum + m.vacancy, 0) / creMetrics.length,
        tokenizedAUM: rwaStats.tokenizedAUM,
        momGrowth: rwaStats.momGrowth,
        activeTokens: rwaStats.activeTokens
      },
      sectorMetrics: creMetrics,
      recentNews: news.slice(0, 3),
      trends
    };

    // Generate content with RUNE.CTZ
    const systemPrompt = `You are RUNE.CTZ, Commertize's market analyst. Produce concise, data-backed CRE/Tokenization/RWA updates in a Coinbase-style.

PRIMARY SOURCES: Base all CRE market insights on CBRE Research and CoStar Group - the industry's most trusted commercial real estate data providers.
STYLE: Headline, 2–3 key metrics, 150–200 word narrative, 1–2 modular sections, short bullets, cite sources by id.
GUARDRAILS: No guarantees. Use "projected/estimated." Be neutral, precise, and brief.

Respond with JSON in this exact format:
{
  "title": "Brief headline (max 60 chars)",
  "summary": "Key takeaway in under 200 chars",
  "metrics": {
    "capRate": 6.1,
    "vacancy": 7.3,
    "tokenizedAUM": 5.2,
    "momGrowth": 3.8
  },
  "sections": [
    {
      "heading": "CRE Snapshot",
      "body": "Analysis under 120 words",
      "bullets": ["Key point 1", "Key point 2"],
      "citations": ["source-1"]
    }
  ],
  "chart": {
    "labels": ["Aug 13", "Aug 14", "Aug 15", "Aug 16", "Aug 17", "Aug 18", "Aug 19"],
    "series": [{"name": "Cap Rate", "data": [6.75, 6.76, 6.77, 6.78, 6.79, 6.79, 6.8]}]
  }
}`;

    const userPrompt = `Generate a ${type} market update focusing on: ${focus.join(', ')}

Current Data:
- Average Cap Rate: ${dataInputs.metrics.averageCapRate.toFixed(1)}%
- Average Vacancy: ${dataInputs.metrics.averageVacancy.toFixed(1)}%
- Tokenized AUM: $${dataInputs.metrics.tokenizedAUM.toFixed(1)}B
- MoM Growth: ${dataInputs.metrics.momGrowth.toFixed(1)}%

Sector Breakdown:
${dataInputs.sectorMetrics.map(s => `${s.sector}: ${s.capRate.toFixed(1)}% cap, ${s.vacancy.toFixed(1)}% vacancy`).join('\n')}

Recent News:
${dataInputs.recentNews.map(n => `- ${n.title}: ${n.summary}`).join('\n')}

Historical Trends:
- Cap Rates: ${trends.capRates.join('% → ')}%
- Vacancy: ${trends.vacancy.join('% → ')}%
- Tokenized AUM: $${trends.tokenizedAUM.join('B → $')}B`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 1500
    });

    const generatedContent = JSON.parse(response.choices[0].message.content || '{}');

    // Create database entry
    const newUpdate: NewMarketUpdate = {
      type: type as 'daily' | 'weekly' | 'monthly',
      title: generatedContent.title,
      summary: generatedContent.summary,
      sections: generatedContent.sections,
      metrics: generatedContent.metrics,
      chart: generatedContent.chart,
      tags: focus,
      // publishedAt: null, // Draft mode
    };

    const [created] = await db.insert(marketUpdates).values(newUpdate).returning();

    res.json({
      success: true,
      data: created,
      disclaimer: "Generated content is for informational purposes only. Projections are estimates and not guaranteed."
    });

  } catch (error) {
    console.error('Error generating market update:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate market update',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/market-updates/publish - Publish a draft update
router.post('/publish', async (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Update ID is required'
      });
    }

    const [updated] = await db.update(marketUpdates)
      .set({ 
        publishedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(marketUpdates.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Update not found'
      });
    }

    res.json({
      success: true,
      data: updated
    });

  } catch (error) {
    console.error('Error publishing market update:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to publish market update'
    });
  }
});

// POST /api/market-updates/:id/ask - RUNE.CTZ Q&A on specific update
router.post('/:id/ask', async (req, res) => {
  try {
    const { id } = req.params;
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Question is required'
      });
    }

    // Get the market update
    const update = await db.select()
      .from(marketUpdates)
      .where(eq(marketUpdates.id, id))
      .limit(1);

    if (update.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Market update not found'
      });
    }

    const marketUpdate = update[0];

    // Generate response with context
    const systemPrompt = `You are RUNE.CTZ answering questions about this market update. Be concise, accurate, and reference specific data from the update when relevant. Always include appropriate disclaimers about projections being estimates.`;

    const userPrompt = `Based on this market update:

Title: ${marketUpdate.title}
Summary: ${marketUpdate.summary}
Key Metrics: ${JSON.stringify(marketUpdate.metrics)}
Sections: ${JSON.stringify(marketUpdate.sections)}

Question: ${question}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_completion_tokens: 400,
    });

    res.json({
      success: true,
      answer: response.choices[0].message.content,
      disclaimer: "Analysis based on available data. Projections are estimates and not guaranteed."
    });

  } catch (error) {
    console.error('Market update Q&A error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process question'
    });
  }
});

export default router;