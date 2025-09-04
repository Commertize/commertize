import { nanoid } from 'nanoid';
import type { Lead } from './supportAutomationService';

export interface CallRecord {
  id: string;
  leadId: string;
  phoneNumber: string;
  outcome: 'connected' | 'voicemail' | 'no_answer' | 'busy' | 'disconnected' | 'interested' | 'not_interested' | 'callback_requested';
  notes?: string;
  duration?: number; // in seconds
  followUpDate?: string;
  createdAt: string;
}

export interface CallScript {
  opening: string;
  valueProposition: string;
  objectionHandling: Record<string, string>;
  closingOptions: string[];
  followUpActions: string[];
}

export default class ColdCallingService {
  private calls: CallRecord[] = [];
  private initialized = false;
  private supportPhone = '';

  initialize(phone: string): void {
    this.supportPhone = phone;
    this.initialized = true;
    console.log(`Cold calling service initialized with phone: ${phone}`);
    
    // Add some demo call records
    this.addDemoCallData();
  }

  private addDemoCallData(): void {
    const demoCalls: Partial<CallRecord>[] = [
      {
        leadId: 'demo-lead-1',
        phoneNumber: '+1-555-0123',
        outcome: 'connected',
        notes: 'Very interested in tokenization. Scheduled follow-up meeting.',
        duration: 420,
        followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
      },
      {
        leadId: 'demo-lead-2',
        phoneNumber: '+1-555-0456',
        outcome: 'voicemail',
        notes: 'Left detailed voicemail about investment opportunities.',
        duration: 60
      },
      {
        leadId: 'demo-lead-1',
        phoneNumber: '+1-555-0123',
        outcome: 'callback_requested',
        notes: 'Requested callback next week to discuss portfolio.',
        duration: 180,
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week from now
      }
    ];

    demoCalls.forEach(call => {
      if (call.leadId && call.phoneNumber && call.outcome) {
        this.logCall(call.leadId, call.phoneNumber, call.outcome, call.notes, call.duration);
      }
    });
  }

  async generateCallScript(lead: Lead, campaign: 'investment' | 'partnership' | 'demo'): Promise<CallScript> {
    if (!this.initialized) {
      throw new Error('Cold calling service not initialized');
    }

    const recipientName = lead.name || 'there';
    const company = lead.company || 'your organization';

    let script: CallScript;

    switch (campaign) {
      case 'investment':
        script = {
          opening: `Hi ${recipientName}, this is RUNE.CTZ calling on behalf of Commertize. We provide access to tokenized commercial real estate investments. Did I catch you at a good time?`,
          
          valueProposition: `I'll be brief. Institutional-quality real estate deals have traditionally been restricted to large players. Commertize changes that by tokenizing properties, which makes them accessible, transparent, and tradable. This gives investors like you: fractional access to high-value CRE deals, global borderless investment opportunities, and AI-powered transparency and reporting.`,
          
          objectionHandling: {
            'not_interested': `I get that. Many investors said the same until they saw how tokenization allows diversification into commercial real estate with much lower capital requirements. Would you like me to send a one-pager that explains how it works?`,
            'no_time': `Completely fair — most of our investor conversations are just 15 minutes. Would you be open to scheduling a short call next week to see if this aligns with your portfolio strategy?`,
            'need_to_think': `Absolutely. It makes sense to review the details first. I can send you our investor deck right now and then schedule a quick check-in after you've had time to look it over. Would [day/time] work?`,
            'already_investing': `That's fantastic! You clearly understand the importance of diversification. Most of our clients also have traditional investments, but they love having commercial real estate in their portfolio because it's uncorrelated to the stock market and provides monthly distributions.`
          },
          
          closingOptions: [
            `The best way to understand the opportunity is through a quick demo. How does your schedule look later this week for a 20-minute overview?`,
            `I can send you our investor deck today — would you prefer PDF or a link?`,
            `No worries if now isn't ideal. Would it be okay if I check back in a few weeks with updated opportunities?`
          ],
          
          followUpActions: [
            'Send investor deck (PDF or link)',
            'Schedule 20-minute platform demo',
            'Follow up in 2-3 weeks with new opportunities',
            'Connect with existing investor for testimonial',
            'Send market analysis reports for their geographic area'
          ]
        };
        break;

      case 'partnership':
        script = {
          opening: `Hi ${recipientName}, this is RUNE.CTZ calling on behalf of Commertize. We work with commercial property owners to create new financing options through tokenization. Did I catch you at a good time?`,
          
          valueProposition: `I'll keep this quick. With today's high interest rates and limited refinancing options, many property owners are struggling to unlock equity. Commertize helps by tokenizing your property — essentially turning it into digital shares that can be sold or pledged for liquidity. That means: you can raise capital without waiting on banks, access a broader pool of global investors, and avoid foreclosure or distressed sales.`,
          
          objectionHandling: {
            'not_interested': `I understand. A lot of owners felt the same way at first — until they realized tokenization gave them options when banks refused to refinance. Would it make sense if I send you a short case study showing how it's worked for other property owners?`,
            'no_time': `Totally fair. Most of our conversations take just 15 minutes. Would next week be a better time to do a quick call and explore if this could help your situation?`,
            'need_to_think': `That's smart — it's a big decision. Why don't I send you our property-owner guide now, and we can follow up next week once you've had time to review?`,
            'complex_process': `I understand that concern. We handle the entire tokenization process - from smart contract deployment to regulatory compliance. Most of our partners are surprised how streamlined we've made it. The property owner focuses on what they do best while we handle the technology and investor relations.`
          },
          
          closingOptions: [
            `Would you be open to a 20-minute demo later this week to see how tokenization could unlock liquidity for your property?`,
            `I can send you a case study right now. What's the best email to use?`,
            `If now's not the right time, can I circle back in a few weeks? Conditions might be tougher with banks by then, so it could be helpful to keep this option open.`
          ],
          
          followUpActions: [
            'Send property-owner case study',
            'Schedule 20-minute tokenization demo',
            'Send property-owner guide and materials',
            'Follow up in 2-3 weeks if timing not right',
            'Connect with existing property partner for testimonial'
          ]
        };
        break;

      case 'demo':
        script = {
          opening: `Hi ${recipientName}, this is [Your Name] from Commertize. You recently showed interest in learning more about our commercial real estate tokenization platform. I'm calling to see if you'd like me to give you a quick walkthrough of how everything works. Do you have about 10 minutes?`,
          
          valueProposition: `Let me show you exactly what makes our platform different. [Screen share] Here you can see our current property portfolio - each one has been vetted by our team and tokenized for fractional ownership. You can see the expected returns, tenant information, and even take a virtual property tour. The minimum investment is just $1,000, and you can diversify across multiple properties with a few clicks.`,
          
          objectionHandling: {
            'too_complicated': `I hear that a lot initially, but watch this - [demonstrate simple investment flow] - you literally click on a property, choose your investment amount, connect your wallet, and you're done. Our platform handles all the complex blockchain stuff in the background. Most of our users complete their first investment in under 5 minutes.`,
            'security_concerns': `Security is our top priority. We use enterprise-grade encryption, and all property ownership is secured by blockchain smart contracts. Plus, every property has full legal documentation and insurance. You have the same legal protections as any traditional real estate investment, but with the added transparency of blockchain technology.`,
            'minimum_too_high': `Actually, I think you'll be excited about this - our minimum is just $1,000, and you can start with even smaller amounts on some properties. We designed it specifically to make commercial real estate accessible to individual investors who were previously locked out of these opportunities.`,
            'dont_understand_crypto': `You don't need to understand cryptocurrency at all. While we use blockchain technology behind the scenes, you can invest using regular USD through your bank account. We also accept USDC if you're comfortable with that, but it's completely optional.`
          },
          
          closingOptions: [
            `Based on what you've seen, which of these properties interests you most? I can send you the full investment package and reserve your spot for early access.`,
            `Would you like me to set up a personalized account for you so you can explore the properties at your own pace? It takes about 2 minutes and there's no obligation.`,
            `I can see this property [point to specific one] aligns well with what you mentioned. Would you like me to walk you through the investment process for this specific opportunity?`
          ],
          
          followUpActions: [
            'Send property investment packages for interested properties',
            'Set up personalized platform account',
            'Schedule follow-up call to address additional questions',
            'Provide getting started guide and tutorial videos',
            'Connect with customer success team for onboarding'
          ]
        };
        break;
    }

    console.log(`Generated ${campaign} call script for lead: ${lead.email}`);
    return script;
  }

  logCall(
    leadId: string,
    phoneNumber: string,
    outcome: CallRecord['outcome'],
    notes?: string,
    duration?: number
  ): string {
    if (!this.initialized) {
      throw new Error('Cold calling service not initialized');
    }

    const callId = nanoid();
    const now = new Date().toISOString();

    // Set follow-up date based on outcome
    let followUpDate: string | undefined;
    const followUpDays: Record<CallRecord['outcome'], number | null> = {
      'connected': 7,
      'voicemail': 3,
      'no_answer': 1,
      'busy': 1,
      'disconnected': null,
      'interested': 3,
      'not_interested': null,
      'callback_requested': 7
    };

    const daysToFollowUp = followUpDays[outcome];
    if (daysToFollowUp !== null) {
      const followUp = new Date();
      followUp.setDate(followUp.getDate() + daysToFollowUp);
      followUpDate = followUp.toISOString();
    }

    const call: CallRecord = {
      id: callId,
      leadId,
      phoneNumber,
      outcome,
      notes,
      duration,
      followUpDate,
      createdAt: now
    };

    this.calls.push(call);
    console.log(`Call logged: ${leadId} -> ${outcome}`);
    
    return callId;
  }

  getCallsByLead(leadId: string): CallRecord[] {
    return this.calls
      .filter(call => call.leadId === leadId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getAllCalls(): CallRecord[] {
    return this.calls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getFollowUpCalls(): CallRecord[] {
    const now = new Date();
    return this.calls.filter(call => 
      call.followUpDate && 
      new Date(call.followUpDate) <= now
    );
  }

  async generateFollowUpReminders(): Promise<Array<{
    callId: string;
    leadId: string;
    phoneNumber: string;
    lastOutcome: string;
    daysPast: number;
    suggestedAction: string;
  }>> {
    const followUpCalls = this.getFollowUpCalls();
    const now = new Date();

    return followUpCalls.map(call => {
      const daysPast = Math.floor(
        (now.getTime() - new Date(call.followUpDate!).getTime()) / (1000 * 60 * 60 * 24)
      );

      let suggestedAction = '';
      switch (call.outcome) {
        case 'connected':
          suggestedAction = 'Follow up on previous conversation and provide additional information';
          break;
        case 'voicemail':
          suggestedAction = 'Try calling again or send email follow-up';
          break;
        case 'no_answer':
        case 'busy':
          suggestedAction = 'Attempt another call at different time';
          break;
        case 'interested':
          suggestedAction = 'Schedule demonstration or send investment materials';
          break;
        case 'callback_requested':
          suggestedAction = 'Honor callback request - high priority';
          break;
        default:
          suggestedAction = 'General follow-up call';
      }

      return {
        callId: call.id,
        leadId: call.leadId,
        phoneNumber: call.phoneNumber,
        lastOutcome: call.outcome,
        daysPast,
        suggestedAction
      };
    });
  }

  getCallStats(): {
    total: number;
    byOutcome: Record<string, number>;
    averageDuration: number;
    conversionRate: number;
    followUpsPending: number;
  } {
    const total = this.calls.length;
    
    const byOutcome = this.calls.reduce((acc, call) => {
      acc[call.outcome] = (acc[call.outcome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const callsWithDuration = this.calls.filter(call => call.duration);
    const averageDuration = callsWithDuration.length > 0
      ? callsWithDuration.reduce((sum, call) => sum + (call.duration || 0), 0) / callsWithDuration.length
      : 0;

    const connectedCalls = byOutcome['connected'] || 0;
    const interestedCalls = byOutcome['interested'] || 0;
    const conversionRate = total > 0 ? ((connectedCalls + interestedCalls) / total) * 100 : 0;

    const followUpsPending = this.getFollowUpCalls().length;

    return {
      total,
      byOutcome,
      averageDuration: parseFloat(averageDuration.toFixed(1)),
      conversionRate: parseFloat(conversionRate.toFixed(1)),
      followUpsPending
    };
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const coldCallingService = new ColdCallingService();