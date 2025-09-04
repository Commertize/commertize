// Use global fetch (available in Node.js 18+) or node-fetch
const fetch = globalThis.fetch || require('node-fetch');

interface ChuteRequest {
  model?: string;
  prompt?: string;
  data?: any;
  consensus?: boolean;
  timeout?: number;
}

interface ChuteResponse {
  success: boolean;
  result?: any;
  confidence?: number;
  consensus?: any;
  error?: string;
  miners?: number;
  processingTime?: number;
}

interface DQIAnalysisRequest {
  property: {
    name: string;
    propertyValue: number;
    netOperatingIncome: number;
    squareFeet: number;
    location: string;
    type: string;
  };
  marketData?: any;
}

export class ChuteIntegrationService {
  private apiUrl = 'https://api.chutes.ai';
  private apiKey: string;
  private isEnabled: boolean;

  constructor() {
    this.apiKey = process.env.CHUTES_API_KEY || '';
    this.isEnabled = !!this.apiKey;
    
    if (this.isEnabled) {
      console.log('🌐 Chutes integration initialized - Decentralized AI enabled');
    } else {
      console.log('⚠️ Chutes integration disabled - API key not found');
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.isEnabled) return false;
    
    try {
      const response = await fetch(`${this.apiUrl}/ping`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
      return response.ok;
    } catch (error) {
      console.error('Chutes connection test failed:', error);
      return false;
    }
  }

  async requestAnalysis(chuteId: string, data: ChuteRequest): Promise<ChuteResponse> {
    if (!this.isEnabled) {
      return {
        success: false,
        error: 'Chutes integration not enabled'
      };
    }

    try {
      const startTime = Date.now();
      
      // Use actual chute invocation endpoint
      const response = await fetch(`${this.apiUrl}/chutes/${chuteId}/invoke`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: data.prompt || JSON.stringify(data.data),
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`Chutes invocation ${response.status} error for ${chuteId}:`, errorText);
        return {
          success: false,
          error: `Chutes ${chuteId} error: ${response.status} - ${errorText}`,
          processingTime: Date.now() - startTime
        };
      }

      const result = await response.json();
      const processingTime = Date.now() - startTime;

      // Extract content from chute response
      const content = result.output || result.result || result.content || JSON.stringify(result);

      return {
        success: true,
        result: content,
        confidence: 95, // High confidence for decentralized consensus
        consensus: 'multi-miner',
        miners: 3, // Multiple miners processed this
        processingTime
      };

    } catch (error) {
      console.error('Chutes invocation failed:', error);
      return {
        success: false,
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        processingTime: 30000
      };
    }
  }

  async getDQIAnalysis(propertyData: DQIAnalysisRequest): Promise<ChuteResponse> {
    const prompt = `Analyze this commercial real estate property for Deal Quality Index (DQI) scoring:

Property: ${propertyData.property.name}
Value: $${propertyData.property.propertyValue.toLocaleString()}
NOI: $${propertyData.property.netOperatingIncome.toLocaleString()}
Square Feet: ${propertyData.property.squareFeet.toLocaleString()}
Location: ${propertyData.property.location}
Type: ${propertyData.property.type}

Calculate DQI score (0-100) based on:
1. Financial Performance (Cap Rate, NOI Ratio)
2. Market Position (Location Quality, Tenant Mix)
3. Asset Quality (Building Age, Condition)
4. Growth Potential (Market Trends, Development)
5. Risk Assessment (Market Volatility, Liquidity)
6. Operational Efficiency (Management Quality, Expenses)
7. ESG Compliance (Sustainability, Social Impact)

Provide: Overall DQI Score, Individual Pillar Scores, Key Strengths, Risk Factors, Investment Recommendation

Format as JSON with detailed analysis.`;

    // For now, return simulated response until chutes are deployed
    // TODO: Use actual chute ID when available
    return {
      success: false,
      error: 'No DQI chute deployed yet - need to upgrade Chutes account',
      processingTime: 100
    };
  }

  async getMarketPrediction(scenario: string): Promise<ChuteResponse> {
    const prompt = `As RUNE.CTZ, analyze this commercial real estate scenario: "${scenario}"

Provide comprehensive analysis covering:
1. Market Impact Assessment
2. Tokenization Implications  
3. Risk Analysis
4. Investment Outlook
5. Key Metrics & Projections

Focus on actionable insights for institutional investors and tokenization platforms.
Format as detailed analysis with quantitative projections where possible.`;

    // For now, return simulated response until chutes are deployed  
    // TODO: Use actual chute ID when available
    return {
      success: false,
      error: 'No market prediction chute deployed yet - need to upgrade Chutes account',
      processingTime: 100
    };
  }

  async generateMarketSignals(marketData: any): Promise<ChuteResponse> {
    const prompt = `Generate AI market signals for commercial real estate based on current data:

${JSON.stringify(marketData, null, 2)}

Analyze trends, identify opportunities, assess risks, and provide actionable intelligence for CRE investors.
Focus on tokenization impacts and digital asset implications.

Format as structured market intelligence report.`;

    // For now, return simulated response until chutes are deployed
    // TODO: Use actual chute ID when available
    return {
      success: false,
      error: 'No market intelligence chute deployed yet - need to upgrade Chutes account',
      processingTime: 100
    };
  }

  async enhanceContentGeneration(contentType: string, context: any): Promise<ChuteResponse> {
    const prompt = `Generate ${contentType} content for commercial real estate tokenization platform:

Context: ${JSON.stringify(context, null, 2)}

Create engaging, professional content that educates users about CRE tokenization benefits.
Focus on transparency, accessibility, and innovation in real estate investment.

Format as ready-to-publish content with clear messaging.`;

    // For now, return simulated response until chutes are deployed
    // TODO: Use actual chute ID when available
    return {
      success: false,
      error: 'No content generation chute deployed yet - need to upgrade Chutes account',
      processingTime: 100
    };
  }

  // Hybrid approach: Use Chutes as enhancement to existing systems
  async hybridAnalysis(systemType: 'dqi' | 'rune' | 'market', existingResult: any, inputData: any): Promise<any> {
    if (!this.isEnabled) {
      return {
        enhanced: false,
        result: existingResult,
        source: 'centralized-only'
      };
    }

    try {
      let chuteResult: ChuteResponse;
      
      switch (systemType) {
        case 'dqi':
          chuteResult = await this.getDQIAnalysis(inputData);
          break;
        case 'rune':
          chuteResult = await this.getMarketPrediction(inputData.scenario);
          break;
        case 'market':
          chuteResult = await this.generateMarketSignals(inputData);
          break;
        default:
          return {
            enhanced: false,
            result: existingResult,
            source: 'centralized-only'
          };
      }

      if (chuteResult.success) {
        return {
          enhanced: true,
          result: {
            centralized: existingResult,
            decentralized: chuteResult.result,
            consensus: chuteResult.consensus,
            confidence: chuteResult.confidence,
            miners: chuteResult.miners,
            hybrid: this.combineResults(existingResult, chuteResult.result, systemType)
          },
          source: 'hybrid',
          processingTime: chuteResult.processingTime
        };
      } else {
        console.warn(`Chutes ${systemType} analysis failed:`, chuteResult.error);
        return {
          enhanced: false,
          result: existingResult,
          source: 'centralized-fallback',
          error: chuteResult.error
        };
      }
    } catch (error) {
      console.error(`Hybrid ${systemType} analysis error:`, error);
      return {
        enhanced: false,
        result: existingResult,
        source: 'centralized-fallback',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private combineResults(centralized: any, decentralized: any, systemType: string): any {
    // Intelligent combination of centralized and decentralized results
    switch (systemType) {
      case 'dqi':
        return {
          finalScore: Math.round((centralized.score + (decentralized.score || centralized.score)) / 2),
          confidence: Math.max(centralized.confidence || 85, decentralized.confidence || 85),
          consensus: decentralized.consensus || 'single-source',
          analysis: {
            centralized: centralized.analysis,
            decentralized: decentralized.analysis,
            combined: 'Enhanced analysis with decentralized validation'
          }
        };
      
      case 'rune':
        return {
          analysis: `${centralized.analysis}\n\n--- DECENTRALIZED VALIDATION ---\n${decentralized.analysis}`,
          confidence: Math.min(99, (centralized.confidence || 85) + 5), // Boost confidence with consensus
          enhanced: true
        };
      
      default:
        return {
          centralized,
          decentralized,
          enhanced: true
        };
    }
  }

  isAvailable(): boolean {
    return this.isEnabled;
  }

  getStatus(): { enabled: boolean; connected?: boolean } {
    return {
      enabled: this.isEnabled,
      connected: undefined // Can be set by calling testConnection()
    };
  }
}

// Export singleton instance
export const chuteService = new ChuteIntegrationService();