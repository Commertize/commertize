import { supportAutomationService } from './supportAutomationService';
import OpenAI from 'openai';

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface LeadScoringFeatures {
  emailEngagement: number;
  companySize: string;
  industry: string;
  websiteClicks: number;
  propertyType: string;
  investmentAmount: number;
  responseTime: number;
  sourceQuality: number;
}

interface CallCoachingPrompt {
  leadProfile: any;
  callStage: 'intro' | 'value' | 'cta' | 'objection';
  previousInteractions: string[];
  suggestions: string[];
}

interface SentimentAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  confidence: number;
  urgencyKeywords: string[];
  frustrationLevel: number;
}

export class AIIntelligenceLayer {
  private initialized = false;

  async initialize(): Promise<void> {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not provided - AI intelligence features disabled');
      return;
    }
    
    this.initialized = true;
    console.log('✅ AI Intelligence Layer initialized');
  }

  /**
   * Advanced Lead Scoring using AI
   * Predicts likelihood of conversion based on multiple factors
   */
  async scoreLeadWithAI(leadData: any): Promise<number> {
    if (!this.initialized) return this.fallbackLeadScore(leadData);

    try {
      const prompt = `
Analyze this lead profile and predict conversion likelihood (0-100 score):

Lead Data:
- Email: ${leadData.email}
- Company: ${leadData.company || 'Unknown'}
- Source: ${leadData.source}
- Industry: ${leadData.industry || 'Unknown'}
- Property Interest: ${leadData.propertyType || 'Unknown'}
- Engagement: ${leadData.websiteClicks || 0} clicks, ${leadData.emailOpens || 0} email opens
- Contact Method: ${leadData.preferredContact || 'Email'}
- Investment Size: ${leadData.investmentAmount || 'Unknown'}

Score based on:
1. Company quality/size indicators
2. Engagement behavior
3. Industry fit for CRE tokenization
4. Response timing patterns
5. Source quality

Respond with JSON: {"score": number, "reasoning": "brief explanation", "priority": "hot|warm|cold"}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      return Math.min(100, Math.max(0, analysis.score || 50));
    } catch (error) {
      console.error('AI lead scoring failed:', error);
      return this.fallbackLeadScore(leadData);
    }
  }

  /**
   * Real-time Call Coaching
   * Provides live suggestions during cold calls
   */
  async generateCallCoaching(leadProfile: any, callStage: string, previousNotes: string[]): Promise<CallCoachingPrompt> {
    if (!this.initialized) {
      return this.fallbackCallCoaching(callStage);
    }

    try {
      const prompt = `
Generate call coaching for a commercial real estate tokenization sales call:

Lead Profile:
- Name: ${leadProfile.name || leadProfile.email?.split('@')[0]}
- Company: ${leadProfile.company || 'Unknown'}
- Industry: ${leadProfile.industry || 'Unknown'}
- Score: ${leadProfile.score}/100
- Previous interactions: ${previousNotes.join(', ')}

Current call stage: ${callStage}

Provide specific coaching for this stage:
- Intro: Build rapport, establish credibility
- Value: Present tokenization benefits specific to their situation  
- CTA: Clear next steps (demo, meeting, documents)
- Objection: Handle common objections about tokenization

Respond with JSON: {
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "keyPoints": ["point1", "point2"],
  "nextStage": "stage_name"
}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const coaching = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        leadProfile,
        callStage: callStage as any,
        previousInteractions: previousNotes,
        suggestions: coaching.suggestions || []
      };
    } catch (error) {
      console.error('Call coaching AI failed:', error);
      return this.fallbackCallCoaching(callStage);
    }
  }

  /**
   * Email Campaign Optimization
   * Recommends best sending times and subject lines
   */
  async optimizeEmailCampaign(campaignData: any, performanceHistory: any[]): Promise<any> {
    if (!this.initialized) {
      return this.fallbackEmailOptimization();
    }

    try {
      const prompt = `
Optimize this email campaign based on performance data:

Campaign: ${campaignData.type}
Target Audience: ${campaignData.segment}
Current Performance: ${performanceHistory.map(h => `${h.date}: ${h.openRate}% open, ${h.clickRate}% click`).join('; ')}

Historical Best Performers:
${performanceHistory.slice(0, 3).map(h => `Subject: "${h.subject}" - ${h.openRate}% open`).join('\n')}

Analyze and recommend:
1. Optimal sending times based on audience
2. Subject line improvements  
3. Call-to-action optimization
4. Audience segmentation refinements

Respond with JSON: {
  "recommendedSendTime": "time",
  "subjectLineOptions": ["option1", "option2", "option3"],
  "ctaRecommendations": ["cta1", "cta2"],
  "segmentationTips": ["tip1", "tip2"]
}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Email optimization AI failed:', error);
      return this.fallbackEmailOptimization();
    }
  }

  /**
   * Support Ticket Sentiment Analysis
   * Detects urgency and frustration in support tickets
   */
  async analyzeSentiment(ticketContent: string): Promise<SentimentAnalysis> {
    if (!this.initialized) {
      return this.fallbackSentimentAnalysis(ticketContent);
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "Analyze support ticket sentiment for urgency and frustration. Focus on commercial real estate and tokenization context."
          },
          {
            role: "user", 
            content: `Analyze this support ticket content: "${ticketContent}"`
          }
        ],
        response_format: { type: "json_object" },
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        sentiment: analysis.sentiment || 'neutral',
        confidence: analysis.confidence || 0.5,
        urgencyKeywords: analysis.urgencyKeywords || [],
        frustrationLevel: analysis.frustrationLevel || 0
      };
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      return this.fallbackSentimentAnalysis(ticketContent);
    }
  }

  /**
   * Predictive Follow-up Recommendations
   * Suggests optimal timing and approach for follow-ups
   */
  async predictOptimalFollowUp(leadHistory: any[]): Promise<any> {
    if (!this.initialized || !leadHistory.length) {
      return this.fallbackFollowUpPrediction();
    }

    try {
      const prompt = `
Analyze lead engagement history and predict optimal follow-up strategy:

Lead History:
${leadHistory.map((h, i) => `${i+1}. ${h.date}: ${h.action} - ${h.outcome || 'No response'}`).join('\n')}

Current Status: ${leadHistory[leadHistory.length - 1]?.status || 'Unknown'}
Last Contact: ${leadHistory[leadHistory.length - 1]?.date}
Engagement Score: ${leadHistory[0]?.score || 50}/100

Recommend:
1. Best follow-up timing (hours/days from now)
2. Communication method (email/call/LinkedIn)
3. Message approach (educational/promotional/personal)
4. Probability of response

Respond with JSON: {
  "recommendedDelay": "2 days",
  "method": "email|call|linkedin",
  "approach": "approach_type",
  "responseProb": 0.75,
  "reasoning": "explanation"
}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Follow-up prediction failed:', error);
      return this.fallbackFollowUpPrediction();
    }
  }

  // Fallback methods when AI is unavailable
  private fallbackLeadScore(leadData: any): number {
    let score = 50; // Base score
    
    // Email domain quality
    if (leadData.email?.includes('@gmail.com') || leadData.email?.includes('@yahoo.com')) {
      score -= 10;
    } else {
      score += 10;
    }
    
    // Company presence
    if (leadData.company) score += 15;
    
    // Source quality
    if (leadData.source === 'referral') score += 20;
    if (leadData.source === 'website') score += 10;
    
    // Engagement indicators
    if (leadData.websiteClicks > 5) score += 15;
    if (leadData.emailOpens > 0) score += 10;
    
    return Math.min(100, Math.max(0, score));
  }

  private fallbackCallCoaching(callStage: string): CallCoachingPrompt {
    const suggestions = {
      intro: [
        "Mention a recent CRE tokenization success story",
        "Ask about their current real estate investment challenges",
        "Establish credibility with industry knowledge"
      ],
      value: [
        "Focus on liquidity benefits of tokenization",
        "Highlight fractional ownership opportunities", 
        "Share specific ROI examples"
      ],
      cta: [
        "Offer a personalized demo of the platform",
        "Suggest reviewing a sample deal structure",
        "Schedule follow-up with technical details"
      ],
      objection: [
        "Address regulatory concerns with compliance examples",
        "Explain blockchain security and transparency",
        "Share case studies of successful tokenizations"
      ]
    };

    return {
      leadProfile: {},
      callStage: callStage as any,
      previousInteractions: [],
      suggestions: suggestions[callStage as keyof typeof suggestions] || suggestions.intro
    };
  }

  private fallbackEmailOptimization(): any {
    return {
      recommendedSendTime: "Tuesday 10:00 AM",
      subjectLineOptions: [
        "Tokenize Your Real Estate Portfolio",
        "New Investment Opportunities Available",
        "Fractional Real Estate Made Simple"
      ],
      ctaRecommendations: [
        "Schedule Your Demo",
        "View Available Properties"
      ],
      segmentationTips: [
        "Segment by property type interest",
        "Target accredited investors separately"
      ]
    };
  }

  private fallbackSentimentAnalysis(content: string): SentimentAnalysis {
    const urgentWords = ['urgent', 'asap', 'immediately', 'emergency', 'critical'];
    const frustrationWords = ['frustrated', 'angry', 'disappointed', 'unacceptable'];
    
    const urgencyKeywords = urgentWords.filter(word => 
      content.toLowerCase().includes(word)
    );
    
    const frustrationLevel = frustrationWords.some(word => 
      content.toLowerCase().includes(word)
    ) ? 0.7 : 0.2;
    
    let sentiment: SentimentAnalysis['sentiment'] = 'neutral';
    if (urgencyKeywords.length > 0) sentiment = 'urgent';
    else if (frustrationLevel > 0.5) sentiment = 'negative';
    
    return {
      sentiment,
      confidence: 0.6,
      urgencyKeywords,
      frustrationLevel
    };
  }

  private fallbackFollowUpPrediction(): any {
    return {
      recommendedDelay: "3 days",
      method: "email",
      approach: "educational",
      responseProb: 0.3,
      reasoning: "Standard follow-up timing for lead nurturing"
    };
  }
}

export const aiIntelligenceLayer = new AIIntelligenceLayer();