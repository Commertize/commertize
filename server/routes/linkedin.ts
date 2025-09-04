import { Request, Response } from 'express';
import { db } from '../../db';
import { contacts } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';

// API endpoint to trigger manual contact collection
export async function triggerLinkedInCollection(req: Request, res: Response) {
  try {
    console.log('🚀 Manual LinkedIn contact collection triggered');
    
    // Import the scheduler and trigger collection
    const { LinkedInScheduler } = await import('../schedulers/linkedinScheduler');
    const scheduler = new LinkedInScheduler();
    
    // Trigger daily collection manually
    await scheduler.collectDailyContacts();
    
    res.json({
      success: true,
      message: 'LinkedIn contact collection completed',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Manual collection failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// API endpoint to get collected contacts
export async function getLinkedInContacts(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const contactList = await db.select()
      .from(contacts)
      .orderBy(desc(contacts.createdAt))
      .limit(limit)
      .offset(offset);
      
    const totalCount = await db.select({ count: contacts.id }).from(contacts);
    
    res.json({
      success: true,
      data: contactList,
      total: totalCount.length,
      limit,
      offset
    });
    
  } catch (error) {
    console.error('❌ Failed to fetch contacts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// API endpoint to get automation status
export async function getAutomationStatus(req: Request, res: Response) {
  try {
    const recentContacts = await db.select()
      .from(contacts)
      .orderBy(desc(contacts.createdAt))
      .limit(10);
      
    const stats = {
      totalContacts: recentContacts.length,
      recentCollections: recentContacts.length,
      lastCollection: recentContacts[0]?.createdAt || null,
      automationActive: true,
      nextScheduledRun: '10:00 AM PT daily'
    };
    
    res.json({
      success: true,
      status: 'running',
      stats,
      schedule: {
        daily: '10:00 AM PT',
        weekly: 'Monday 8:00 AM PT',
        enrichment: 'Every 4 hours',
        cleanup: 'Daily 2:00 AM PT'
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to get automation status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}