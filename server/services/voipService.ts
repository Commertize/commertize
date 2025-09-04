import { supportAutomationService, type Lead } from './supportAutomationService';
import { coldCallingService } from './coldCallingService';
import { vapiService } from './vapiService';

interface CallResult {
  success: boolean;
  callId?: string;
  error?: string;
  leadId: string;
}

class VoipService {
  private initialized = false;

  constructor() {
    // Configuration now handled by vapiService
  }

  async initialize(): Promise<boolean> {
    try {
      this.initialized = await vapiService.initialize();
      if (this.initialized) {
        console.log('✅ VoIP Service initialized with Vapi Voice AI');
      }
      return this.initialized;
    } catch (error) {
      console.error('Failed to initialize VoIP service:', error);
      return false;
    }
  }

  isInitialized(): boolean {
    return this.initialized && vapiService.isInitialized();
  }

  async makeRUNECall(lead: Lead, campaignType: 'investment' | 'partnership' | 'demo'): Promise<CallResult> {
    // Delegate to Vapi service
    return await vapiService.makeRUNECall(lead, campaignType);
  }

  async batchCallLeads(leadIds: string[], campaignType: 'investment' | 'partnership' | 'demo'): Promise<{
    successful: CallResult[];
    failed: CallResult[];
    total: number;
  }> {
    // Delegate to Vapi service
    return await vapiService.batchCallLeads(leadIds, campaignType);
  }

  // Handle Vapi webhook calls
  async handleCallWebhook(webhookData: any): Promise<void> {
    await vapiService.handleCallWebhook(webhookData);
  }

  // Get call statistics
  getCallStats(): {
    totalCalls: number;
    successfulCalls: number;
    averageDuration: number;
    conversionRate: number;
  } {
    return vapiService.getCallStats();
  }
}

// Export singleton instance
export const voipService = new VoipService();

// Extend coldCallingService to include actual calling
export interface ColdCallingServiceExtended {
  makeActualCall: (leadId: string, campaignType: 'investment' | 'partnership' | 'demo') => Promise<CallResult>;
  startCallCampaign: (leadIds: string[], campaignType: 'investment' | 'partnership' | 'demo') => Promise<any>;
  getAllCalls: () => any[];
}