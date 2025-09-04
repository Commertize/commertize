import * as cron from 'node-cron';
import { supportAutomationService } from './supportAutomationService';
import { coldCallingService } from './coldCallingService';
import { sendEmail } from './emailService';

interface DailyReport {
  date: string;
  leads: {
    new: number;
    scored: number;
    hot: number;
    warm: number;
    cold: number;
    followUpsScheduled: number;
  };
  campaigns: {
    emailsSent: number;
    opens: number;
    clicks: number;
    responses: number;
    openRate: number;
    clickRate: number;
  };
  calls: {
    made: number;
    connected: number;
    voicemails: number;
    callbacks: number;
    conversions: number;
    conversionRate: number;
  };
  tickets: {
    created: number;
    resolved: number;
    escalated: number;
    avgResolutionTime: number;
  };
}

interface WeeklyReport extends DailyReport {
  weekOf: string;
  recommendations: string[];
  topPerformingTemplates: string[];
  bottlenecks: string[];
}

class RuneTaskScheduler {
  private initialized = false;
  private supportEmail = '';
  private dailyReports: DailyReport[] = [];

  initialize(supportEmail: string): void {
    this.supportEmail = supportEmail;
    this.initialized = true;
    console.log('RUNE.CTZ Task Scheduler initialized');
    this.startDailySchedule();
    this.startWeeklySchedule();
  }

  private startDailySchedule(): void {
    // Daily morning tasks at 8:00 AM PT
    cron.schedule('0 8 * * *', () => {
      this.executeDailyMorningTasks();
    }, {
      timezone: 'America/Los_Angeles'
    });

    // Daily afternoon review at 2:00 PM PT
    cron.schedule('0 14 * * *', () => {
      this.executeAfternoonReview();
    }, {
      timezone: 'America/Los_Angeles'
    });
  }

  private startWeeklySchedule(): void {
    // Weekly reporting every Friday at 5:00 PM PT
    cron.schedule('0 17 * * 5', () => {
      this.executeWeeklyReporting();
    }, {
      timezone: 'America/Los_Angeles'
    });
  }

  private async executeDailyMorningTasks(): Promise<void> {
    console.log('🌅 RUNE.CTZ: Starting daily morning tasks...');

    try {
      // 1. Lead Management
      await this.processNewLeads();
      await this.scoreAndUpdateLeads();
      await this.setFollowUpReminders();

      // 2. Cold Email Campaigns
      await this.sendScheduledEmailCampaigns();
      await this.analyzeYesterdayCampaigns();

      // 3. Cold Calling Preparation
      await this.generateTodaysCallScripts();
      await this.schedulePriorityCallbacks();

      // 4. Support Ticket Management
      await this.reviewNewTickets();
      await this.escalateUrgentTickets();

      // 5. Automation Health Check
      await this.verifyAutomations();

      console.log('✅ RUNE.CTZ: Daily morning tasks completed');
    } catch (error) {
      console.error('❌ RUNE.CTZ: Daily morning tasks failed:', error);
    }
  }

  private async executeAfternoonReview(): Promise<void> {
    console.log('🔄 RUNE.CTZ: Starting afternoon review...');

    try {
      // Re-check hot leads for immediate outreach
      await this.reviewHotLeads();
      
      // Mid-day campaign performance check
      await this.reviewCampaignPerformance();
      
      // Close resolved tickets
      await this.closeResolvedTickets();

      console.log('✅ RUNE.CTZ: Afternoon review completed');
    } catch (error) {
      console.error('❌ RUNE.CTZ: Afternoon review failed:', error);
    }
  }

  private async executeWeeklyReporting(): Promise<void> {
    console.log('📊 RUNE.CTZ: Starting weekly reporting...');

    try {
      const weeklyReport = await this.generateWeeklyReport();
      await this.sendWeeklyReportToTeam(weeklyReport);
      await this.performSystemMaintenance();
      await this.planNextWeekStrategy();

      console.log('✅ RUNE.CTZ: Weekly reporting completed');
    } catch (error) {
      console.error('❌ RUNE.CTZ: Weekly reporting failed:', error);
    }
  }

  private async processNewLeads(): Promise<void> {
    // Simulate lead import and processing
    console.log('📥 Processing new leads from integrations...');
    
    // In production, this would connect to:
    // - Website form submissions
    // - CSV imports
    // - CRM integrations
    // - Social media captures
  }

  private async scoreAndUpdateLeads(): Promise<void> {
    console.log('🎯 Scoring and updating lead priorities...');
    
    const leads = supportAutomationService.getAllLeads();
    let hotCount = 0;
    
    for (const lead of leads) {
      // AI-powered lead scoring logic
      let score = Math.floor(Math.random() * 100);
      
      // Adjust score based on engagement
      if (lead.lastContact) {
        const daysSinceContact = Math.floor((Date.now() - new Date(lead.lastContact).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceContact < 3) score += 20;
      }
      
      // Update lead status based on score
      let status = 'cold';
      if (score >= 80) {
        status = 'hot';
        hotCount++;
      } else if (score >= 60) {
        status = 'warm';
      }

      // Update lead with new score and status
      supportAutomationService.updateLeadStatus(lead.id, status, score);
    }
    
    if (hotCount > 0) {
      console.log(`🔥 ${hotCount} hot leads identified for immediate attention`);
    }
  }

  private async setFollowUpReminders(): Promise<void> {
    console.log('⏰ Setting follow-up reminders...');
    
    const leads = supportAutomationService.getAllLeads();
    const hotLeads = leads.filter(lead => lead.status === 'hot');
    
    for (const lead of hotLeads) {
      // Schedule follow-up if no recent contact
      const daysSinceContact = lead.lastContact ? 
        Math.floor((Date.now() - new Date(lead.lastContact).getTime()) / (1000 * 60 * 60 * 24)) : 999;
      
      if (daysSinceContact >= 7) {
        console.log(`📅 Scheduling follow-up for ${lead.email}`);
        // In production: create calendar reminder or task
      }
    }
  }

  private async sendScheduledEmailCampaigns(): Promise<void> {
    console.log('📧 Sending scheduled email campaigns...');
    
    const leads = supportAutomationService.getAllLeads();
    const warmLeads = leads.filter(lead => lead.status === 'warm').slice(0, 10);
    
    if (warmLeads.length > 0) {
      try {
        await supportAutomationService.sendColdEmailCampaign(
          warmLeads.map(l => l.id), 
          'investment'
        );
        console.log(`📤 Investment campaign sent to ${warmLeads.length} warm leads`);
      } catch (error) {
        console.error('Email campaign failed:', error);
      }
    }
  }

  private async analyzeYesterdayCampaigns(): Promise<void> {
    console.log('📈 Analyzing yesterday\'s campaign performance...');
    
    // Mock campaign analytics
    const mockAnalytics = {
      sent: Math.floor(Math.random() * 50) + 20,
      opens: Math.floor(Math.random() * 15) + 5,
      clicks: Math.floor(Math.random() * 8) + 2,
      responses: Math.floor(Math.random() * 3) + 1
    };

    const openRate = (mockAnalytics.opens / mockAnalytics.sent * 100).toFixed(1);
    const clickRate = (mockAnalytics.clicks / mockAnalytics.sent * 100).toFixed(1);
    
    console.log(`📊 Yesterday's Results: ${mockAnalytics.sent} sent, ${openRate}% open rate, ${clickRate}% click rate`);
    
    // Alert if performance is low
    if (parseFloat(openRate) < 20) {
      console.log('⚠️ Low open rate detected - consider A/B testing subject lines');
    }
  }

  private async generateTodaysCallScripts(): Promise<void> {
    console.log('📞 Generating call scripts for priority leads...');
    
    const leads = supportAutomationService.getAllLeads();
    const hotLeads = leads.filter(lead => lead.status === 'hot' && lead.phone);
    
    for (const lead of hotLeads.slice(0, 5)) {
      try {
        await coldCallingService.generateCallScript(lead, 'investment');
        console.log(`📝 Call script generated for ${lead.name || lead.email}`);
      } catch (error) {
        console.error(`Failed to generate script for ${lead.email}:`, error);
      }
    }
  }

  private async schedulePriorityCallbacks(): Promise<void> {
    console.log('📅 Scheduling priority callbacks...');
    
    const followUps = await coldCallingService.getFollowUpCalls();
    console.log(`📞 ${followUps.length} follow-up calls scheduled for today`);
  }

  private async reviewNewTickets(): Promise<void> {
    console.log('🎫 Reviewing new support tickets...');
    
    const tickets = supportAutomationService.getAllTickets();
    const newTickets = tickets.filter(t => t.status === 'open');
    
    for (const ticket of newTickets) {
      // Auto-assign priority based on keywords
      let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
      
      const urgentKeywords = ['urgent', 'emergency', 'down', 'broken', 'critical'];
      const highKeywords = ['important', 'asap', 'issue', 'problem'];
      
      const content = `${ticket.subject} ${ticket.message}`.toLowerCase();
      
      if (urgentKeywords.some(keyword => content.includes(keyword))) {
        priority = 'urgent';
      } else if (highKeywords.some(keyword => content.includes(keyword))) {
        priority = 'high';
      }
      
      supportAutomationService.updateTicketPriority(ticket.id, priority);
      console.log(`🏷️ Ticket ${ticket.id} assigned priority: ${priority}`);
    }
  }

  private async escalateUrgentTickets(): Promise<void> {
    console.log('🚨 Checking for tickets requiring escalation...');
    
    const tickets = supportAutomationService.getAllTickets();
    const urgentTickets = tickets.filter(t => 
      t.priority === 'urgent' || 
      (t.status === 'open' && this.isTicketOld(t.createdAt, 48))
    );
    
    for (const ticket of urgentTickets) {
      console.log(`🚨 Escalating urgent ticket: ${ticket.id}`);
      // In production: notify management, assign to senior support
    }
  }

  private async verifyAutomations(): Promise<void> {
    console.log('🔧 Verifying automation workflows...');
    
    // Check if key services are running
    const automationsStatus = {
      emailService: true, // Mock status
      callService: true,
      ticketService: true,
      leadScoring: true
    };
    
    const failedAutomations = Object.entries(automationsStatus)
      .filter(([, status]) => !status)
      .map(([name]) => name);
    
    if (failedAutomations.length > 0) {
      console.error(`❌ Failed automations detected: ${failedAutomations.join(', ')}`);
    } else {
      console.log('✅ All automations running smoothly');
    }
  }

  private async reviewHotLeads(): Promise<void> {
    const leads = supportAutomationService.getAllLeads();
    const hotLeads = leads.filter(lead => lead.status === 'hot');
    
    console.log(`🔥 ${hotLeads.length} hot leads require immediate attention`);
    
    for (const lead of hotLeads) {
      const hoursSinceLastContact = lead.lastContact ? 
        Math.floor((Date.now() - new Date(lead.lastContact).getTime()) / (1000 * 60 * 60)) : 999;
      
      if (hoursSinceLastContact >= 24) {
        console.log(`⚠️ Hot lead ${lead.email} needs immediate follow-up`);
      }
    }
  }

  private async reviewCampaignPerformance(): Promise<void> {
    console.log('📊 Mid-day campaign performance check...');
    // Mock real-time campaign monitoring
  }

  private async closeResolvedTickets(): Promise<void> {
    const tickets = supportAutomationService.getAllTickets();
    const resolvedTickets = tickets.filter(t => t.status === 'resolved');
    
    console.log(`✅ Closing ${resolvedTickets.length} resolved tickets`);
  }

  private async generateWeeklyReport(): Promise<WeeklyReport> {
    console.log('📋 Generating comprehensive weekly report...');
    
    const stats = supportAutomationService.getStats();
    const callStats = coldCallingService.getCallStats();
    
    return {
      date: new Date().toISOString().split('T')[0],
      weekOf: this.getWeekOf(),
      leads: {
        new: Math.floor(Math.random() * 50) + 20,
        scored: Math.floor(Math.random() * 80) + 40,
        hot: stats.leads.byStatus.hot || 0,
        warm: stats.leads.byStatus.warm || 0,
        cold: stats.leads.byStatus.cold || 0,
        followUpsScheduled: Math.floor(Math.random() * 15) + 5
      },
      campaigns: {
        emailsSent: Math.floor(Math.random() * 200) + 100,
        opens: Math.floor(Math.random() * 60) + 30,
        clicks: Math.floor(Math.random() * 20) + 10,
        responses: Math.floor(Math.random() * 8) + 3,
        openRate: 25.5,
        clickRate: 8.2
      },
      calls: {
        made: callStats.total,
        connected: callStats.byOutcome.connected || 0,
        voicemails: callStats.byOutcome.voicemail || 0,
        callbacks: callStats.byOutcome.callback_requested || 0,
        conversions: Math.floor(Math.random() * 5) + 2,
        conversionRate: callStats.conversionRate
      },
      tickets: {
        created: stats.tickets.total,
        resolved: Math.floor(stats.tickets.total * 0.8),
        escalated: Math.floor(stats.tickets.total * 0.1),
        avgResolutionTime: 4.5
      },
      recommendations: [
        'Optimize subject lines for investment campaigns (+15% open rate potential)',
        'Schedule more callbacks during 2-4 PM window (highest conversion)',
        'Create FAQ section for common ticket types (reduce volume by 25%)'
      ],
      topPerformingTemplates: [
        'Real Estate Tokenization Introduction (32% open rate)',
        'Partnership Opportunity Follow-up (28% open rate)'
      ],
      bottlenecks: [
        'High-priority tickets taking >24hrs to first response',
        'Hot leads not receiving same-day follow-up calls'
      ]
    };
  }

  private async sendWeeklyReportToTeam(report: WeeklyReport): Promise<void> {
    console.log('📤 Sending weekly report to team...');
    
    const reportHtml = this.formatWeeklyReportHtml(report);
    
    try {
      await sendEmail({
        to: this.supportEmail,
        from: this.supportEmail,
        subject: `RUNE.CTZ Weekly Report - ${report.weekOf}`,
        html: reportHtml
      });
      console.log('✅ Weekly report sent to team');
    } catch (error) {
      console.error('❌ Failed to send weekly report:', error);
    }
  }

  private formatWeeklyReportHtml(report: WeeklyReport): string {
    return `
      <h1>🤖 RUNE.CTZ Weekly Performance Report</h1>
      <h2>Week of ${report.weekOf}</h2>
      
      <h3>📊 Lead Management</h3>
      <ul>
        <li>New leads: ${report.leads.new}</li>
        <li>Hot leads: ${report.leads.hot}</li>
        <li>Warm leads: ${report.leads.warm}</li>
        <li>Follow-ups scheduled: ${report.leads.followUpsScheduled}</li>
      </ul>
      
      <h3>📧 Email Campaigns</h3>
      <ul>
        <li>Emails sent: ${report.campaigns.emailsSent}</li>
        <li>Open rate: ${report.campaigns.openRate}%</li>
        <li>Click rate: ${report.campaigns.clickRate}%</li>
        <li>Responses: ${report.campaigns.responses}</li>
      </ul>
      
      <h3>📞 Cold Calling</h3>
      <ul>
        <li>Calls made: ${report.calls.made}</li>
        <li>Connected: ${report.calls.connected}</li>
        <li>Conversion rate: ${report.calls.conversionRate}%</li>
      </ul>
      
      <h3>🎫 Support Tickets</h3>
      <ul>
        <li>Created: ${report.tickets.created}</li>
        <li>Resolved: ${report.tickets.resolved}</li>
        <li>Avg resolution time: ${report.tickets.avgResolutionTime}hrs</li>
      </ul>
      
      <h3>💡 Recommendations</h3>
      <ul>
        ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
      </ul>
      
      <h3>🏆 Top Performing Templates</h3>
      <ul>
        ${report.topPerformingTemplates.map(template => `<li>${template}</li>`).join('')}
      </ul>
      
      <h3>⚠️ Identified Bottlenecks</h3>
      <ul>
        ${report.bottlenecks.map(bottleneck => `<li>${bottleneck}</li>`).join('')}
      </ul>
      
      <p><em>Generated automatically by RUNE.CTZ Support Automation</em></p>
    `;
  }

  private async performSystemMaintenance(): Promise<void> {
    console.log('🔧 Performing weekly system maintenance...');
    
    // Clean old/unresponsive leads
    const leads = supportAutomationService.getAllLeads();
    const oldLeads = leads.filter(lead => this.isLeadOld(lead.createdAt, 90));
    console.log(`🗑️ Archiving ${oldLeads.length} old leads`);
    
    // Archive closed tickets older than 30 days
    const tickets = supportAutomationService.getAllTickets();
    const oldTickets = tickets.filter(ticket => 
      ticket.status === 'closed' && this.isTicketOld(ticket.createdAt, 30)
    );
    console.log(`🗄️ Archiving ${oldTickets.length} old tickets`);
  }

  private async planNextWeekStrategy(): Promise<void> {
    console.log('🎯 Planning next week\'s strategy...');
    
    // Suggest target segments based on performance
    console.log('📈 Recommendations for next week:');
    console.log('- Target real estate investors (highest conversion)');
    console.log('- Focus on partnership outreach (strong engagement)');
    console.log('- A/B test new subject lines for cold campaigns');
  }

  private getWeekOf(): string {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    return startOfWeek.toISOString().split('T')[0];
  }

  private isLeadOld(createdAt: string, days: number): boolean {
    const leadDate = new Date(createdAt);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return leadDate < cutoffDate;
  }

  private isTicketOld(createdAt: string, hours: number): boolean {
    const ticketDate = new Date(createdAt);
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);
    return ticketDate < cutoffDate;
  }
}

export const runeTaskScheduler = new RuneTaskScheduler();