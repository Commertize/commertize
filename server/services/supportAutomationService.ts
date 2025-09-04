import { sendEmail } from './emailService';
import { aiIntelligenceLayer } from './aiIntelligenceLayer';
import { complianceManager } from './complianceManager';
import { generateInvestmentEmailTemplate, generatePartnershipEmailTemplate, generateDemoEmailTemplate, generateSupportResponseTemplate } from '../emailTemplates/supportEmailTemplates';
import { nanoid } from 'nanoid';

export interface Lead {
  id: string;
  email: string;
  phone?: string;
  name?: string;
  company?: string;
  industry?: string;
  source: string;
  status: string;
  lastContact?: string;
  notes?: string;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicket {
  id: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CallRecord {
  id: string;
  leadId: string;
  phoneNumber: string;
  outcome: 'connected' | 'voicemail' | 'no_answer' | 'busy' | 'disconnected' | 'interested' | 'not_interested' | 'callback_requested';
  duration?: number;
  notes?: string;
  followUpDate?: string;
  calledAt: string;
}

class SupportAutomationService {
  private leads: Lead[] = [];
  private tickets: SupportTicket[] = [];
  private callHistory: CallRecord[] = [];
  private initialized = false;
  private supportEmail = '';
  private supportPhone = '';

  initialize(email: string, phone: string): void {
    this.supportEmail = email;
    this.supportPhone = phone;
    this.initialized = true;
    console.log(`Support automation initialized with email: ${email}, phone: ${phone}`);
    
    // Add some demo data for testing
    this.addDemoData();
    this.addDemoCallHistory();
  }

  private addDemoData(): void {
    // Add demo leads with phone numbers for RUNE.CTZ calling
    const demoLeads = [
      {
        email: 'investor@example.com',
        name: 'John Smith',
        company: 'Smith Capital',
        industry: 'Investment',
        source: 'website',
        phone: '+12125554321',
        notes: 'Interested in commercial real estate tokenization',
        priority: 'High',
        status: 'warm'
      },
      {
        email: 'partner@realty.com',
        name: 'Jane Doe',
        company: 'Realty Partners',
        industry: 'Real Estate',
        source: 'referral',
        phone: '+13105555678',
        notes: 'Looking to list properties on platform',
        priority: 'High',
        status: 'new'
      },
      {
        email: 'm.rodriguez@cbregroup.com',
        name: 'Maria Rodriguez',
        company: 'CBRE Group',
        industry: 'Commercial Real Estate',
        source: 'LinkedIn',
        phone: '+12135556789',
        notes: 'Senior VP interested in tokenization for institutional clients',
        priority: 'High',
        status: 'new'
      },
      {
        email: 'david.chen@jll.com',
        name: 'David Chen',
        company: 'JLL',
        industry: 'Real Estate Investment',
        source: 'LinkedIn',
        phone: '+14155557890',
        notes: 'Head of Digital Innovation exploring blockchain CRE solutions',
        priority: 'High',
        status: 'warm'
      }
    ];

    demoLeads.forEach(lead => {
      this.addLead(lead);
    });

    // Add demo tickets
    const demoTickets = [
      {
        email: 'support@test.com',
        subject: 'Platform Demo Request',
        message: 'Hi, I would like to schedule a demo of your tokenization platform.'
      },
      {
        email: 'help@investor.com',
        subject: 'Investment Minimum Question',
        message: 'What is the minimum investment amount for tokenized properties?'
      }
    ];

    demoTickets.forEach(ticket => {
      this.handleSupportTicket(ticket.email, ticket.subject, ticket.message);
    });
  }

  addLead(leadData: Partial<Lead>): string {
    if (!this.initialized) {
      throw new Error('Support automation not initialized');
    }

    const leadId = nanoid();
    const now = new Date().toISOString();
    
    // Calculate lead score based on available information
    let score = 50; // Base score
    if (leadData.company) score += 20;
    if (leadData.phone) score += 15;
    if (leadData.industry?.toLowerCase().includes('real estate')) score += 10;
    if (leadData.industry?.toLowerCase().includes('investment')) score += 10;
    if (leadData.source === 'referral') score += 15;

    const lead: Lead = {
      id: leadId,
      email: leadData.email || '',
      phone: leadData.phone,
      name: leadData.name,
      company: leadData.company,
      industry: leadData.industry,
      source: leadData.source || 'unknown',
      status: 'new',
      notes: leadData.notes,
      score: Math.min(score, 100),
      createdAt: now,
      updatedAt: now
    };

    this.leads.push(lead);
    console.log(`New lead added: ${lead.email} (Score: ${lead.score})`);
    
    return leadId;
  }

  getAllLeads(): Lead[] {
    return this.leads.sort((a, b) => b.score - a.score);
  }

  updateLead(leadId: string, updates: Partial<Lead>): boolean {
    const leadIndex = this.leads.findIndex(l => l.id === leadId);
    if (leadIndex === -1) return false;

    this.leads[leadIndex] = {
      ...this.leads[leadIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return true;
  }

  async sendColdEmailCampaign(leadIds: string[], campaign: 'investment' | 'partnership' | 'demo'): Promise<{
    sent: number;
    failed: Array<{ leadId: string; error: string }>;
  }> {
    if (!this.initialized) {
      throw new Error('Support automation not initialized');
    }

    const results = {
      sent: 0,
      failed: [] as Array<{ leadId: string; error: string }>
    };

    for (const leadId of leadIds) {
      const lead = this.leads.find(l => l.id === leadId);
      if (!lead) {
        results.failed.push({ leadId, error: 'Lead not found' });
        continue;
      }

      try {
        let template = '';
        let subject = '';

        switch (campaign) {
          case 'investment':
            template = generateInvestmentEmailTemplate({
              recipientName: lead.name || lead.email.split('@')[0],
              recipientEmail: lead.email,
              recipientCompany: lead.company
            });
            subject = 'Exclusive Commercial Real Estate Investment Opportunities';
            break;
          case 'partnership':
            template = generatePartnershipEmailTemplate({
              recipientName: lead.name || lead.email.split('@')[0],
              recipientEmail: lead.email,
              recipientCompany: lead.company
            });
            subject = 'Partnership Opportunity - Tokenize Your Commercial Properties';
            break;
          case 'demo':
            template = generateDemoEmailTemplate({
              recipientName: lead.name || lead.email.split('@')[0],
              recipientEmail: lead.email,
              recipientCompany: lead.company
            });
            subject = 'See Commertize in Action - Schedule Your Demo';
            break;
        }

        await sendEmail({
          to: lead.email,
          from: this.supportEmail,
          subject: subject,
          html: template
        });
        const emailSent = true;

        if (emailSent) {
          results.sent++;
          this.updateLead(leadId, { 
            lastContact: new Date().toISOString(),
            status: 'contacted'
          });
        } else {
          results.failed.push({ leadId, error: 'Email sending failed' });
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.failed.push({ 
          leadId, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    console.log(`Cold email campaign completed: ${results.sent} sent, ${results.failed.length} failed`);
    return results;
  }

  async handleSupportTicket(email: string, subject: string, message: string): Promise<SupportTicket> {
    if (!this.initialized) {
      throw new Error('Support automation not initialized');
    }

    const ticketId = nanoid();
    const now = new Date().toISOString();

    // Determine priority based on subject and content
    let priority: SupportTicket['priority'] = 'medium';
    const urgentKeywords = ['urgent', 'immediate', 'critical', 'emergency'];
    const highKeywords = ['important', 'asap', 'quickly', 'soon'];

    const content = (subject + ' ' + message).toLowerCase();
    if (urgentKeywords.some(keyword => content.includes(keyword))) {
      priority = 'urgent';
    } else if (highKeywords.some(keyword => content.includes(keyword))) {
      priority = 'high';
    } else if (content.includes('question') || content.includes('demo')) {
      priority = 'low';
    }

    const ticket: SupportTicket = {
      id: ticketId,
      email,
      subject,
      message,
      status: 'open',
      priority,
      createdAt: now,
      updatedAt: now
    };

    this.tickets.push(ticket);

    // Send automated response
    try {
      const responseTemplate = generateSupportResponseTemplate({
        recipientName: email.split('@')[0],
        ticketId: ticket.id,
        originalSubject: subject
      });

      await sendEmail({
        to: email,
        from: this.supportEmail,
        subject: `Re: ${subject} [Ticket #${ticket.id.slice(-8)}]`,
        html: responseTemplate
      });

      console.log(`Support ticket created and auto-response sent: ${ticketId}`);
    } catch (error) {
      console.error('Failed to send auto-response:', error);
    }

    return ticket;
  }

  getAllTickets(): SupportTicket[] {
    return this.tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  updateTicket(ticketId: string, updates: Partial<SupportTicket>): boolean {
    const ticketIndex = this.tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) return false;

    this.tickets[ticketIndex] = {
      ...this.tickets[ticketIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return true;
  }

  updateLeadStatus(leadId: string, status: string, score?: number): boolean {
    const leadIndex = this.leads.findIndex(lead => lead.id === leadId);
    if (leadIndex !== -1) {
      this.leads[leadIndex].status = status;
      this.leads[leadIndex].updatedAt = new Date().toISOString();
      if (score !== undefined) {
        this.leads[leadIndex].score = score;
      }
      return true;
    }
    return false;
  }

  updateTicketPriority(ticketId: string, priority: 'low' | 'medium' | 'high' | 'urgent'): boolean {
    const ticketIndex = this.tickets.findIndex(ticket => ticket.id === ticketId);
    if (ticketIndex !== -1) {
      this.tickets[ticketIndex].priority = priority;
      this.tickets[ticketIndex].updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  getStats(): {
    leads: {
      total: number;
      byStatus: Record<string, number>;
      bySource: Record<string, number>;
      averageScore: number;
    };
    tickets: {
      total: number;
      byStatus: Record<string, number>;
      byPriority: Record<string, number>;
    };
  } {
    const leadsByStatus = this.leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const leadsBySource = this.leads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ticketsByStatus = this.tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ticketsByPriority = this.tickets.reduce((acc, ticket) => {
      acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageScore = this.leads.length > 0 
      ? this.leads.reduce((sum, lead) => sum + lead.score, 0) / this.leads.length 
      : 0;

    return {
      leads: {
        total: this.leads.length,
        byStatus: leadsByStatus,
        bySource: leadsBySource,
        averageScore: parseFloat(averageScore.toFixed(1))
      },
      tickets: {
        total: this.tickets.length,
        byStatus: ticketsByStatus,
        byPriority: ticketsByPriority
      }
    };
  }

  getHighPriorityItems(): {
    urgentTickets: SupportTicket[];
    highScoreLeads: Lead[];
    staleLeads: Lead[];
  } {
    const urgentTickets = this.tickets.filter(t => t.priority === 'urgent' && t.status === 'open');
    
    const highScoreLeads = this.leads.filter(l => l.score >= 80 && l.status === 'new');
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const staleLeads = this.leads.filter(l => 
      l.status === 'contacted' && 
      (!l.lastContact || new Date(l.lastContact) < oneWeekAgo)
    );

    return { urgentTickets, highScoreLeads, staleLeads };
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getCallHistory(): CallRecord[] {
    return [...this.callHistory].sort((a, b) => 
      new Date(b.calledAt).getTime() - new Date(a.calledAt).getTime()
    );
  }

  recordCall(callData: {
    leadId: string;
    phoneNumber: string;
    outcome: CallRecord['outcome'];
    duration?: number;
    notes?: string;
    followUpDate?: string;
  }): void {
    const call: CallRecord = {
      id: nanoid(),
      ...callData,
      calledAt: new Date().toISOString(),
    };
    
    this.callHistory.push(call);
    
    // Update lead status based on outcome
    const lead = this.leads.find(l => l.id === callData.leadId);
    if (lead) {
      lead.lastContact = call.calledAt;
      lead.updatedAt = call.calledAt;
      
      if (call.outcome === 'interested' || call.outcome === 'callback_requested') {
        lead.status = 'warm';
      } else if (call.outcome === 'not_interested') {
        lead.status = 'not_interested';
      } else {
        lead.status = 'contacted';
      }
    }
    
    console.log(`📞 Call recorded: ${callData.phoneNumber} -> ${callData.outcome}`);
  }

  private addDemoCallHistory(): void {
    const demoCallRecords: Omit<CallRecord, 'id'>[] = [
      {
        leadId: 'demo-lead-1',
        phoneNumber: '+12125554321',
        outcome: 'interested',
        duration: 180,
        notes: 'Very interested in tokenization technology. Wants follow-up meeting.',
        calledAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      },
      {
        leadId: 'demo-lead-2',
        phoneNumber: '+13105555678',
        outcome: 'voicemail',
        duration: 30,
        notes: 'Left detailed voicemail about platform benefits.',
        calledAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      },
      {
        leadId: 'demo-lead-3',
        phoneNumber: '+12135556789',
        outcome: 'callback_requested',
        duration: 95,
        notes: 'CBRE VP interested but in meetings. Requested callback Thursday 2 PM.',
        calledAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
      },
      {
        leadId: 'demo-lead-4',
        phoneNumber: '+14155557890',
        outcome: 'no_answer',
        notes: 'No answer, will try again later.',
        calledAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      },
      {
        leadId: 'demo-lead-5',
        phoneNumber: '+16195558901',
        outcome: 'connected',
        duration: 240,
        notes: 'Had great conversation about institutional tokenization needs.',
        calledAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      },
    ];

    demoCallRecords.forEach(callData => {
      this.callHistory.push({
        id: nanoid(),
        ...callData,
      });
    });

    console.log(`✅ Added ${demoCallRecords.length} demo call records to history`);
  }
}

export const supportAutomationService = new SupportAutomationService();