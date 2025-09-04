import OpenAI from 'openai';
import { LinkedInScheduler } from '../schedulers/linkedinScheduler';
import { db } from '../../db';
import { contacts } from '../../db/schema';
import { desc } from 'drizzle-orm';
import { voipService } from './voipService';
import { supportAutomationService } from './supportAutomationService';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface RuneCTZTask {
  type: 'linkedin_collection' | 'lead_outreach' | 'market_analysis' | 'contact_enrichment' | 'voice_calling';
  priority: 'high' | 'medium' | 'low';
  scheduledTime?: Date;
  parameters?: any;
}

export class RuneCTZAgent {
  private linkedinScheduler: LinkedInScheduler;
  private isActive: boolean = false;
  private taskQueue: RuneCTZTask[] = [];
  private currentTask: RuneCTZTask | null = null;

  constructor() {
    this.linkedinScheduler = new LinkedInScheduler();
    console.log('🤖 RUNE.CTZ AI Agent initialized - Autonomous LinkedIn Operations');
  }

  async start() {
    if (this.isActive) {
      console.log('RUNE.CTZ already active');
      return;
    }

    this.isActive = true;
    console.log('🚀 RUNE.CTZ AI Agent activated - Taking autonomous control');

    // Initialize Vapi Voice AI calling system
    await this.initializeVoiceCalling();

    // Schedule autonomous LinkedIn collection tasks
    this.scheduleAutonomousLinkedInTasks();
    
    // Schedule autonomous calling campaigns
    this.scheduleAutonomousCallingTasks();
    
    // Start task processing loop
    this.processTaskQueue();
    
    // Initial LinkedIn collection
    await this.triggerLinkedInCollection('Initial autonomous collection');
  }

  private async initializeVoiceCalling() {
    try {
      const success = await voipService.initialize();
      if (success) {
        console.log('📞 RUNE.CTZ voice calling system activated');
      } else {
        console.log('⚠️  RUNE.CTZ voice calling system not available');
      }
    } catch (error) {
      console.error('❌ Failed to initialize RUNE.CTZ voice calling:', error);
    }
  }

  private scheduleAutonomousCallingTasks() {
    // Schedule daily calling campaigns (2:00 PM PT)
    setInterval(async () => {
      if (this.shouldPerformDailyCalling()) {
        await this.addTask({
          type: 'voice_calling',
          priority: 'high',
          parameters: { 
            reason: 'Daily autonomous calling campaign',
            campaignType: 'investment',
            maxCalls: 5 // Limit to 5 calls per campaign
          }
        });
      }
    }, 60 * 60 * 1000); // Check every hour

    console.log('📞 RUNE.CTZ autonomous calling task scheduling activated');
  }

  private shouldPerformDailyCalling(): boolean {
    const now = new Date();
    const hour = now.getHours();
    const ptHour = (hour - 8) % 24; // Convert to PT (roughly)
    
    // Trigger at 2 PM PT (22 UTC) - Good time for outbound calls
    return ptHour === 14;
  }

  private scheduleAutonomousLinkedInTasks() {
    // Schedule daily morning collection (10:00 AM PT)
    setInterval(async () => {
      if (this.shouldPerformDailyCollection()) {
        await this.addTask({
          type: 'linkedin_collection',
          priority: 'high',
          parameters: { reason: 'Daily autonomous collection by RUNE.CTZ' }
        });
      }
    }, 60 * 60 * 1000); // Check every hour

    // Schedule enrichment tasks (every 4 hours)
    setInterval(async () => {
      await this.addTask({
        type: 'contact_enrichment',
        priority: 'medium',
        parameters: { reason: 'Autonomous contact enrichment by RUNE.CTZ' }
      });
    }, 4 * 60 * 60 * 1000); // Every 4 hours

    console.log('📅 RUNE.CTZ autonomous LinkedIn task scheduling activated');
  }

  private shouldPerformDailyCollection(): boolean {
    const now = new Date();
    const hour = now.getHours();
    const ptHour = (hour - 8) % 24; // Convert to PT (roughly)
    
    // Trigger at 10 AM PT (18 UTC)
    return ptHour === 10;
  }

  async addTask(task: RuneCTZTask) {
    this.taskQueue.push({
      ...task,
      scheduledTime: new Date()
    });
    
    console.log(`🎯 RUNE.CTZ queued autonomous task: ${task.type} (${task.priority} priority)`);
  }

  private async processTaskQueue() {
    setInterval(async () => {
      if (this.taskQueue.length > 0 && !this.currentTask) {
        // Sort by priority and time
        this.taskQueue.sort((a, b) => {
          const priorityWeight = { high: 3, medium: 2, low: 1 };
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        });

        this.currentTask = this.taskQueue.shift()!;
        await this.executeTask(this.currentTask);
        this.currentTask = null;
      }
    }, 30000); // Check every 30 seconds
  }

  private async executeTask(task: RuneCTZTask) {
    console.log(`🤖 RUNE.CTZ executing autonomous task: ${task.type}`);
    
    try {
      switch (task.type) {
        case 'linkedin_collection':
          await this.triggerLinkedInCollection(task.parameters?.reason || 'Autonomous collection');
          break;
        case 'contact_enrichment':
          await this.performContactEnrichment();
          break;
        case 'lead_outreach':
          await this.performLeadOutreach();
          break;
        case 'market_analysis':
          await this.performMarketAnalysis();
          break;
        case 'voice_calling':
          await this.performVoiceCalling(task.parameters);
          break;
      }
      
      console.log(`✅ RUNE.CTZ completed autonomous task: ${task.type}`);
      
    } catch (error) {
      console.error(`❌ RUNE.CTZ task failed: ${task.type}`, error);
    }
  }

  async triggerLinkedInCollection(reason: string = 'Autonomous RUNE.CTZ collection') {
    console.log(`🎯 RUNE.CTZ initiating LinkedIn contact collection: ${reason}`);
    
    try {
      // Use AI to determine optimal search parameters
      const searchStrategy = await this.generateSearchStrategy();
      
      // Execute collection with AI-optimized parameters
      await this.linkedinScheduler.collectDailyContacts();
      
      // Analyze collection results
      const collectionResults = await this.analyzeCollectionResults();
      
      console.log(`✅ RUNE.CTZ LinkedIn collection complete: ${collectionResults.summary}`);
      
      return {
        success: true,
        reason,
        strategy: searchStrategy,
        results: collectionResults
      };
      
    } catch (error) {
      console.error('❌ RUNE.CTZ LinkedIn collection failed:', error);
      throw error;
    }
  }

  private async generateSearchStrategy(): Promise<any> {
    try {
      const prompt = `As RUNE.CTZ, analyze current market conditions and generate an optimal LinkedIn search strategy for commercial real estate professionals. Focus on:

1. Most valuable CRE companies to target
2. Key executive titles with highest conversion potential  
3. Geographic markets with highest activity
4. Optimal timing for outreach

Return JSON with search parameters that will yield the highest quality leads.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Using gpt-4o as fallback for this task
        messages: [
          { role: "system", content: "You are RUNE.CTZ, an autonomous AI agent specializing in commercial real estate lead generation and market intelligence." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
      });

      const strategy = JSON.parse(response.choices[0].message.content);
      console.log('🧠 RUNE.CTZ generated search strategy:', strategy);
      
      return strategy;
      
    } catch (error) {
      console.error('❌ RUNE.CTZ strategy generation failed:', error);
      return {
        companies: ['CBRE Group', 'JLL', 'Cushman & Wakefield'],
        titles: ['CEO', 'President', 'Managing Director'],
        markets: ['New York', 'Los Angeles', 'Chicago']
      };
    }
  }

  private async analyzeCollectionResults(): Promise<any> {
    try {
      // Get recent contacts
      const recentContacts = await db.select()
        .from(contacts)
        .orderBy(desc(contacts.createdAt))
        .limit(50);

      const analysis = {
        totalCollected: recentContacts.length,
        highPriorityContacts: recentContacts.filter(c => c.priority === 'High').length,
        topCompanies: this.getTopCompanies(recentContacts),
        summary: `Collected ${recentContacts.length} contacts, ${recentContacts.filter(c => c.priority === 'High').length} high priority`
      };

      console.log('📊 RUNE.CTZ collection analysis:', analysis);
      return analysis;
      
    } catch (error) {
      console.error('❌ RUNE.CTZ analysis failed:', error);
      return { summary: 'Analysis failed', totalCollected: 0 };
    }
  }

  private getTopCompanies(contacts: any[]): string[] {
    const companyCounts = contacts.reduce((acc, contact) => {
      acc[contact.company] = (acc[contact.company] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(companyCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([company]) => company);
  }

  private async performContactEnrichment() {
    console.log('🔧 RUNE.CTZ performing autonomous contact enrichment');
    await this.linkedinScheduler.enrichExistingContacts();
  }

  private async performLeadOutreach() {
    console.log('📧 RUNE.CTZ performing autonomous lead outreach');
    // Implementation for autonomous outreach campaigns
  }

  private async performMarketAnalysis() {
    console.log('📈 RUNE.CTZ performing autonomous market analysis');
    // Implementation for market intelligence gathering
  }

  private async performVoiceCalling(parameters: any) {
    console.log('📞 RUNE.CTZ performing autonomous voice calling campaign');
    
    try {
      if (!voipService.isInitialized()) {
        console.log('⚠️  Voice calling system not available - skipping campaign');
        return;
      }

      const { campaignType = 'investment', maxCalls = 5 } = parameters;
      
      // Get high priority leads for calling
      const leads = await this.selectLeadsForCalling(maxCalls);
      
      if (leads.length === 0) {
        console.log('📞 No suitable leads found for calling campaign');
        return;
      }

      console.log(`📞 RUNE.CTZ initiating voice calling campaign: ${campaignType} - ${leads.length} leads`);
      
      // Execute batch calling
      const results = await voipService.batchCallLeads(
        leads.map(lead => lead.id), 
        campaignType
      );
      
      console.log(`✅ RUNE.CTZ voice calling campaign complete:`, {
        successful: results.successful.length,
        failed: results.failed.length,
        total: results.total
      });
      
      return results;
      
    } catch (error) {
      console.error('❌ RUNE.CTZ voice calling campaign failed:', error);
      throw error;
    }
  }

  private async selectLeadsForCalling(maxCalls: number) {
    try {
      // Get leads from support automation system
      const allLeads = supportAutomationService.getAllLeads();
      
      // Filter for high-quality leads suitable for calling
      const qualifiedLeads = allLeads.filter(lead => 
        lead.status === 'new' || lead.status === 'warm' &&
        lead.phone && 
        lead.priority === 'High' &&
        !lead.lastCalled || 
        (Date.now() - new Date(lead.lastCalled).getTime()) > 7 * 24 * 60 * 60 * 1000 // 7 days
      );

      // Sort by priority and take maxCalls
      return qualifiedLeads
        .sort((a, b) => {
          if (a.priority === 'High' && b.priority !== 'High') return -1;
          if (b.priority === 'High' && a.priority !== 'High') return 1;
          return 0;
        })
        .slice(0, maxCalls);
        
    } catch (error) {
      console.error('❌ Error selecting leads for calling:', error);
      return [];
    }
  }

  // Manual trigger for voice calling campaigns (callable from admin)
  async triggerVoiceCalling(campaignType: 'investment' | 'partnership' | 'demo', maxCalls: number = 5) {
    console.log(`🎯 RUNE.CTZ manual voice calling campaign triggered: ${campaignType}`);
    
    await this.addTask({
      type: 'voice_calling',
      priority: 'high',
      parameters: { 
        reason: 'Manual voice calling campaign',
        campaignType,
        maxCalls
      }
    });
  }

  async getStatus() {
    const recentContacts = await db.select()
      .from(contacts)
      .orderBy(desc(contacts.createdAt))
      .limit(10);

    return {
      agentActive: this.isActive,
      currentTask: this.currentTask?.type || 'idle',
      queuedTasks: this.taskQueue.length,
      recentCollections: recentContacts.length,
      lastActivity: recentContacts[0]?.createdAt || null,
      voiceCallingEnabled: voipService.isInitialized(),
      callStats: voipService.getCallStats()
    };
  }

  stop() {
    this.isActive = false;
    this.taskQueue = [];
    this.currentTask = null;
    console.log('🛑 RUNE.CTZ AI Agent deactivated');
  }
}

// Export singleton instance
export const runeCTZAgent = new RuneCTZAgent();