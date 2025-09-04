import { supportAutomationService, type Lead } from './supportAutomationService';
import { coldCallingService } from './coldCallingService';

interface VapiCallConfig {
  fromNumber: string;
  phoneNumberId: string;
  maxDuration: number;
  recordCall: boolean;
  apiKey: string;
  baseUrl: string;
}

interface VapiCallResult {
  success: boolean;
  callId?: string;
  error?: string;
  leadId: string;
}

interface VapiAssistant {
  id: string;
  campaignType: 'investment' | 'partnership' | 'demo';
  systemPrompt: string;
  firstMessage: string;
}

class VapiService {
  private assistants: Map<string, VapiAssistant> = new Map();
  private initialized = false;
  private callConfig: VapiCallConfig;

  constructor() {
    this.callConfig = {
      fromNumber: '+19498688863', // Commertize official phone number (949 Orange County)
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID || 'f5a962e0-b647-447a-b6d1-317ca89dc313',
      maxDuration: 1800, // 30 minutes
      recordCall: true,
      apiKey: process.env.VAPI_API_KEY || '',
      baseUrl: 'https://api.vapi.ai'
    };
  }

  async initialize(): Promise<boolean> {
    try {
      if (!this.callConfig.apiKey) {
        console.log('Vapi Service: API key not configured - calling disabled');
        return false;
      }

      // Verify phone number configuration
      await this.verifyPhoneNumberConfiguration();

      // Create assistants for different campaign types
      await this.setupAssistants();
      
      this.initialized = true;
      console.log('✅ Vapi Voice AI Service initialized successfully');
      console.log(`📞 Using Commertize phone number: ${this.callConfig.fromNumber}`);
      return true;
    } catch (error) {
      console.error('Failed to initialize Vapi service:', error);
      return false;
    }
  }

  private async verifyPhoneNumberConfiguration(): Promise<void> {
    try {
      console.log('🔍 Verifying Vapi phone number configuration...');
      console.log(`🎯 Target Commertize number: ${this.callConfig.fromNumber}`);
      console.log(`🆔 Current phone number ID: ${this.callConfig.phoneNumberId}`);

      // Get all phone numbers to help find the correct ID
      await this.listAllPhoneNumbers();

      // Get phone number details from Vapi API
      const response = await fetch(`${this.callConfig.baseUrl}/phone-number/${this.callConfig.phoneNumberId}`, {
        headers: {
          'Authorization': `Bearer ${this.callConfig.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const phoneData = await response.json();
        console.log(`📞 Actual Vapi phone number: ${phoneData.number}`);
        console.log(`✅ Phone number match: ${phoneData.number === this.callConfig.fromNumber ? 'YES' : 'NO'}`);
        
        if (phoneData.number !== this.callConfig.fromNumber) {
          console.log('⚠️  WARNING: Phone number mismatch detected!');
          console.log(`   Expected: ${this.callConfig.fromNumber}`);
          console.log(`   Actual: ${phoneData.number}`);
          console.log('   You need to update VAPI_PHONE_NUMBER_ID in your secrets');
        }
      } else {
        console.log(`❌ Failed to verify phone number (${response.status})`);
        console.log('   This phone number ID may not exist in your Vapi account');
      }

    } catch (error: any) {
      console.log('❌ Phone number verification failed:', error.message);
    }
  }

  private async listAllPhoneNumbers(): Promise<void> {
    try {
      console.log('📋 Listing all available Vapi phone numbers...');
      
      // Get all phone numbers from Vapi API
      const response = await fetch(`${this.callConfig.baseUrl}/phone-number`, {
        headers: {
          'Authorization': `Bearer ${this.callConfig.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const phoneNumbers = await response.json();
        console.log(`📞 Found ${phoneNumbers.length} phone numbers in your Vapi account:`);
        
        phoneNumbers.forEach((phone: any) => {
          const isTarget = phone.number === this.callConfig.fromNumber;
          const marker = isTarget ? '🎯' : '  ';
          console.log(`${marker} ${phone.number} - ID: ${phone.id}`);
          
          if (isTarget) {
            console.log(`✅ FOUND CORRECT ID FOR COMMERTIZE NUMBER: ${phone.id}`);
            console.log(`   Update VAPI_PHONE_NUMBER_ID to: ${phone.id}`);
          }
        });
        
      } else {
        console.log(`❌ Failed to list phone numbers (${response.status})`);
      }

    } catch (error: any) {
      console.log('❌ Failed to list phone numbers:', error.message);
    }
  }

  private async setupAssistants(): Promise<void> {
    // Create assistants for different campaign types
    const assistantConfigs = [
      {
        campaignType: 'investment' as const,
        systemPrompt: `You are RUNE.CTZ, an AI voice agent representing Commertize - a tokenized commercial real estate investment platform. You are calling potential investors to introduce them to fractional CRE investment opportunities.

Key points to cover:
- Commertize democratizes access to institutional-quality commercial real estate
- Tokenization enables fractional ownership with lower capital requirements  
- Platform provides AI-powered transparency and due diligence
- Monthly distributions from rental income
- Global, borderless investment access

Be professional, conversational, and focus on understanding their investment goals. Ask qualifying questions about their portfolio and interest in real estate diversification.`,
        firstMessage: "Hi, this is RUNE.CTZ calling on behalf of Commertize. We provide access to tokenized commercial real estate investments. Did I catch you at a good time to discuss a unique investment opportunity?"
      },
      {
        campaignType: 'partnership' as const,
        systemPrompt: `You are RUNE.CTZ, an AI voice agent representing Commertize. You are calling commercial property owners and sponsors to discuss tokenization opportunities for their real estate assets.

Key points to cover:
- Tokenization creates new liquidity for commercial property owners
- Access to global investor pool through blockchain technology
- Fractional ownership increases deal accessibility and speed
- Transparent, regulated investment process
- Ongoing management and compliance support

Be knowledgeable about commercial real estate and focus on understanding their portfolio and capital needs.`,
        firstMessage: "Hi, this is RUNE.CTZ calling on behalf of Commertize. We work with commercial property owners to create new financing options through tokenization. Did I catch you at a good time to discuss how this could benefit your portfolio?"
      },
      {
        campaignType: 'demo' as const,
        systemPrompt: `You are RUNE.CTZ, an AI voice agent representing Commertize. You are following up with prospects who have shown interest in the platform to schedule a demo or answer questions.

Key objectives:
- Schedule a platform demonstration
- Answer specific questions about the tokenization process
- Explain the investment flow and user experience
- Address any concerns about blockchain or regulatory compliance
- Close for a meeting or next step

Be helpful, informative, and focus on converting interest into concrete next actions.`,
        firstMessage: "Hi, this is RUNE.CTZ from Commertize. I'm following up on your recent interest in our tokenized real estate platform. I'd love to schedule a quick demo to show you exactly how our investment process works. Do you have 20 minutes available later this week?"
      }
    ];

    for (const config of assistantConfigs) {
      try {
        const assistant = await this.createAssistant(config.campaignType, config.systemPrompt, config.firstMessage);
        if (assistant) {
          this.assistants.set(config.campaignType, assistant);
          console.log(`✅ Created Vapi assistant for ${config.campaignType} campaign`);
        }
      } catch (error) {
        console.error(`Failed to create ${config.campaignType} assistant:`, error);
      }
    }
  }

  private async createAssistant(campaignType: 'investment' | 'partnership' | 'demo', systemPrompt: string, firstMessage: string): Promise<VapiAssistant | null> {
    try {
      const assistantPayload = {
        model: {
          provider: "openai",
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: systemPrompt
            }
          ],
          maxTokens: 250,
          temperature: 0.7
        },
        voice: {
          provider: "11labs",
          voiceId: "sarah", // Professional female voice
          speed: 1.0,
          stability: 0.8,
          similarityBoost: 0.8
        },
        firstMessage: firstMessage,
        recordingEnabled: true,
        silenceTimeoutSeconds: 10,
        responseDelaySeconds: 1,
        endCallMessage: "Thank you for your time. Have a great day!",
        endCallPhrases: ["goodbye", "hang up", "end call", "bye"]
      };

      const response = await fetch(`${this.callConfig.baseUrl}/assistant`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.callConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assistantPayload)
      });

      if (!response.ok) {
        throw new Error(`Failed to create assistant: ${response.status} ${response.statusText}`);
      }

      const assistant = await response.json();
      
      return {
        id: assistant.id,
        campaignType,
        systemPrompt,
        firstMessage
      };
    } catch (error) {
      console.error(`Error creating ${campaignType} assistant:`, error);
      return null;
    }
  }

  isInitialized(): boolean {
    return this.initialized && this.assistants.size > 0;
  }

  async makeRUNECall(lead: Lead, campaignType: 'investment' | 'partnership' | 'demo'): Promise<VapiCallResult> {
    if (!this.isInitialized()) {
      return {
        success: false,
        error: 'Vapi service not initialized',
        leadId: lead.id
      };
    }

    if (!lead.phone) {
      return {
        success: false,
        error: 'No phone number provided for lead',
        leadId: lead.id
      };
    }

    const assistant = this.assistants.get(campaignType);
    if (!assistant) {
      return {
        success: false,
        error: `Assistant for ${campaignType} campaign not found`,
        leadId: lead.id
      };
    }

    try {
      // Prepare the call payload
      const callPayload = {
        assistantId: assistant.id,
        customer: {
          number: lead.phone,
          name: lead.name,
          email: lead.email
        },
        phoneNumberId: this.callConfig.phoneNumberId,
        name: `RUNE.CTZ ${campaignType} call to ${lead.name}`,
        assistantOverrides: {
          variableValues: {
            leadName: lead.name || 'there',
            leadCompany: lead.company || 'your organization',
            leadEmail: lead.email || '',
            campaignType: campaignType
          }
        }
      };

      // Make the outbound call via Vapi API
      const response = await fetch(`${this.callConfig.baseUrl}/call`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.callConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(callPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Vapi API error: ${response.status} - ${errorText}`);
      }

      const callResult = await response.json();

      // Log successful call initiation
      await coldCallingService.logCall(
        lead.id,
        lead.phone,
        'connected', // Use valid outcome type
        `RUNE.CTZ call initiated via Vapi Voice AI - ${campaignType} campaign`,
        0
      );

      console.log(`📞 RUNE.CTZ Vapi call initiated to ${lead.name} (${lead.phone}) - Call ID: ${callResult.id}`);

      return {
        success: true,
        callId: callResult.id,
        leadId: lead.id
      };

    } catch (error: any) {
      console.error(`Failed to make RUNE.CTZ Vapi call to ${lead.phone}:`, error);
      
      // Log failed call attempt
      await coldCallingService.logCall(
        lead.id,
        lead.phone || 'unknown',
        'disconnected', // Use valid outcome type
        `Call failed: ${error.message}`,
        0
      );

      return {
        success: false,
        error: error.message || 'Unknown error during call initiation',
        leadId: lead.id
      };
    }
  }

  async batchCallLeads(leadIds: string[], campaignType: 'investment' | 'partnership' | 'demo'): Promise<{
    successful: VapiCallResult[];
    failed: VapiCallResult[];
    total: number;
  }> {
    if (!this.isInitialized()) {
      throw new Error('Vapi service not initialized');
    }

    const leads = supportAutomationService.getAllLeads().filter(lead => leadIds.includes(lead.id));
    const results: { successful: VapiCallResult[]; failed: VapiCallResult[] } = {
      successful: [],
      failed: []
    };

    console.log(`🚀 Starting RUNE.CTZ Vapi batch calling campaign: ${campaignType} (${leads.length} leads)`);

    for (const lead of leads) {
      try {
        // Add delay between calls to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const callResult = await this.makeRUNECall(lead, campaignType);
        
        if (callResult.success) {
          results.successful.push(callResult);
        } else {
          results.failed.push(callResult);
        }
      } catch (error: any) {
        results.failed.push({
          success: false,
          error: error.message,
          leadId: lead.id
        });
      }
    }

    console.log(`📊 RUNE.CTZ Vapi batch calling complete: ${results.successful.length} successful, ${results.failed.length} failed`);

    return {
      ...results,
      total: leads.length
    };
  }

  async handleCallWebhook(webhookData: any): Promise<void> {
    try {
      const { call, type } = webhookData;
      
      console.log(`📞 Vapi webhook received - Type: ${type}, Call ID: ${call?.id}`);

      if (type === 'call-end' && call) {
        // Extract lead information from call metadata
        const leadId = call.customer?.name || 'unknown';
        const duration = call.duration || 0;
        const status = call.status || 'unknown';
        
        // Determine call outcome based on Vapi call data
        let outcome: 'connected' | 'voicemail' | 'no_answer' | 'busy' | 'disconnected' | 'interested' | 'not_interested' | 'callback_requested';
        
        if (duration > 30) {
          outcome = 'connected';
        } else if (status === 'completed') {
          outcome = 'connected';
        } else if (status === 'no-answer') {
          outcome = 'no_answer';
        } else if (status === 'busy') {
          outcome = 'busy';
        } else {
          outcome = 'no_answer';
        }

        // Log the completed call
        await coldCallingService.logCall(
          leadId,
          call.customer?.number || 'unknown',
          outcome,
          `Vapi call completed - Duration: ${duration}s, Status: ${status}`,
          duration
        );

        console.log(`📞 RUNE.CTZ Vapi call completed - Lead: ${leadId}, Outcome: ${outcome}, Duration: ${duration}s`);
      }
    } catch (error) {
      console.error('Error handling Vapi webhook:', error);
    }
  }

  // Get call statistics
  getCallStats(): {
    totalCalls: number;
    successfulCalls: number;
    averageDuration: number;
    conversionRate: number;
  } {
    const allCalls = coldCallingService.getAllCalls();
    const successfulCalls = allCalls.filter(call => 
      call.outcome === 'connected' || 
      call.outcome === 'interested' || 
      call.outcome === 'callback_requested'
    );
    const totalDuration = allCalls.reduce((sum, call) => sum + (call.duration || 0), 0);
    
    return {
      totalCalls: allCalls.length,
      successfulCalls: successfulCalls.length,
      averageDuration: allCalls.length > 0 ? Math.round(totalDuration / allCalls.length) : 0,
      conversionRate: allCalls.length > 0 ? Math.round((successfulCalls.length / allCalls.length) * 100) : 0
    };
  }

  // List all assistants
  getAssistants(): VapiAssistant[] {
    return Array.from(this.assistants.values());
  }

  // Get assistant for specific campaign
  getAssistant(campaignType: 'investment' | 'partnership' | 'demo'): VapiAssistant | undefined {
    return this.assistants.get(campaignType);
  }
}

// Export singleton instance
export const vapiService = new VapiService();

// Extended interface for compatibility
export interface VapiCallingServiceExtended {
  makeActualCall: (leadId: string, campaignType: 'investment' | 'partnership' | 'demo') => Promise<VapiCallResult>;
  startCallCampaign: (leadIds: string[], campaignType: 'investment' | 'partnership' | 'demo') => Promise<any>;
  getAllCalls: () => any[];
  getCallStats: () => any;
}