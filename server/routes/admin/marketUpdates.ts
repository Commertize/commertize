import express from 'express';
import { db, marketUpdates } from '../../../db';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Admin endpoint to manually trigger market update generation
router.post('/generate', async (req, res) => {
  try {
    const { type = 'daily', force = true } = req.body;

    // Call the regular generation endpoint
    const response = await fetch(`${req.protocol}://${req.get('host')}/api/market-updates/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, force })
    });

    const result = await response.json();

    if (result.success) {
      // Auto-publish for admin requests
      const publishResponse = await fetch(`${req.protocol}://${req.get('host')}/api/market-updates/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: result.data.id })
      });

      const publishResult = await publishResponse.json();

      res.json({
        success: true,
        data: publishResult.data,
        message: `${type} market update generated and published successfully`
      });
    } else {
      res.status(500).json(result);
    }

  } catch (error) {
    console.error('Admin market update generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate market update',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Admin endpoint to list all updates (including drafts)
router.get('/all', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const updates = await db.select()
      .from(marketUpdates)
      .orderBy(marketUpdates.createdAt)
      .limit(Number(limit));

    res.json({
      success: true,
      data: updates
    });

  } catch (error) {
    console.error('Error fetching all market updates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market updates'
    });
  }
});

// Admin endpoint to delete market update
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await db.delete(marketUpdates)
      .where(eq(marketUpdates.id, id))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Market update not found'
      });
    }

    res.json({
      success: true,
      message: 'Market update deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting market update:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete market update'
    });
  }
});

export default router;