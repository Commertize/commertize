import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ForwardSignal {
  id: string;
  title: string;
  risk: 'HIGH RISK' | 'MEDIUM RISK' | 'LOW RISK' | 'OPPORTUNITY';
  color: 'rose' | 'amber' | 'emerald';
  impact: string;
  timeline: string;
  probability: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
  description: string;
  category: 'market_stress' | 'sector_decline' | 'growth_catalyst' | 'regulatory' | 'economic';
}

interface ForwardSignalsAnalysis {
  timestamp: string;
  signals: ForwardSignal[];
  signalStrength: number;
  confidenceLevel: string;
  lastUpdate: string;
  marketCondition: string;
  nextScan: string;
  keyInsights: string[];
  riskAssessment: {
    overall: 'high' | 'medium' | 'low';
    marketStress: number;
    opportunities: number;
    timeline: string;
  };
}

// Generate comprehensive forward signals analysis
export async function generateForwardSignalsAnalysis(): Promise<ForwardSignalsAnalysis | null> {
  try {
    console.log('Generating forward signals analysis...');

    // Fetch current market context
    const marketContext = await fetchMarketContext();
    
    const prompt = `
You are RUNE.CTZ, Commertize's advanced AI market intelligence system. Generate forward-looking market signals for commercial real estate that provide early warning indicators 2-3 months ahead of mainstream market awareness.

Current Market Context: ${marketContext}

Generate 4-6 forward signals covering different categories:
1. Market Stress Indicators (refinancing, debt, systemic risks)
2. Sector-Specific Trends (office, industrial, retail, multifamily)
3. Growth Catalysts (tokenization, technology, demographics)
4. Regulatory/Policy Impacts (Fed policy, legislation, compliance)
5. Economic Dislocations (inflation, employment, capital flows)

For each signal, provide:
- Specific, actionable intelligence
- Risk level assessment
- Timeline for impact
- Probability percentage
- Market category

Focus on:
- Institutional investor positioning changes
- Unusual trading patterns
- Supply/demand imbalances
- Capital flow shifts
- Technology adoption patterns
- Regulatory developments

Respond in JSON format with this exact structure:
{
  "signals": [
    {
      "id": "unique_id",
      "title": "Specific forward-looking statement",
      "risk": "HIGH RISK" | "MEDIUM RISK" | "LOW RISK" | "OPPORTUNITY",
      "color": "rose" | "amber" | "emerald",
      "impact": "Brief impact description",
      "timeline": "X-Y months",
      "probability": "XX%",
      "bgColor": "bg-color-class",
      "borderColor": "border-color-class", 
      "dotColor": "bg-color-class",
      "description": "Detailed explanation of the signal and its implications",
      "category": "market_stress" | "sector_decline" | "growth_catalyst" | "regulatory" | "economic"
    }
  ],
  "signalStrength": 75-95,
  "confidenceLevel": "High Confidence" | "Medium Confidence",
  "marketCondition": "Overall market assessment",
  "keyInsights": ["3-4 key strategic insights"],
  "riskAssessment": {
    "overall": "high" | "medium" | "low",
    "marketStress": 1-10,
    "opportunities": 1-10,
    "timeline": "Near-term outlook"
  }
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 2500
    });

    const analysisData = JSON.parse(response.choices[0].message.content || '{}');
    
    // Process and validate the signals
    const processedSignals = analysisData.signals?.map((signal: any) => ({
      ...signal,
      bgColor: signal.color === 'rose' ? 'bg-rose-500/10' : 
               signal.color === 'amber' ? 'bg-amber-500/10' : 'bg-emerald-500/10',
      borderColor: signal.color === 'rose' ? 'border-rose-500/30' : 
                   signal.color === 'amber' ? 'border-amber-500/30' : 'border-emerald-500/30',
      dotColor: signal.color === 'rose' ? 'bg-rose-400' : 
                signal.color === 'amber' ? 'bg-amber-400' : 'bg-emerald-400'
    })) || [];

    const analysis: ForwardSignalsAnalysis = {
      timestamp: new Date().toISOString(),
      signals: processedSignals,
      signalStrength: analysisData.signalStrength || 85,
      confidenceLevel: analysisData.confidenceLevel || 'High Confidence',
      lastUpdate: new Date().toISOString(),
      marketCondition: analysisData.marketCondition || 'Mixed signals with selective opportunities',
      nextScan: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      keyInsights: analysisData.keyInsights || [],
      riskAssessment: analysisData.riskAssessment || {
        overall: 'medium',
        marketStress: 6,
        opportunities: 7,
        timeline: '3-6 months'
      }
    };

    console.log('Forward signals analysis generated successfully');
    return analysis;

  } catch (error) {
    console.error('Error generating forward signals analysis:', error);
    return null;
  }
}

// Fetch current market context for analysis
async function fetchMarketContext(): Promise<string> {
  try {
    // In a real implementation, this would fetch from multiple data sources
    const currentDate = new Date();
    const context = `
Current Date: ${currentDate.toDateString()}
Market Environment: Post-pandemic recovery with elevated interest rates
Fed Policy: Restrictive monetary policy, potential for rate cuts in 2025
CRE Fundamentals: Office sector under pressure, industrial remaining strong
Tokenization Trend: Accelerating institutional adoption of digital assets
Global Economy: Inflation moderating, employment stable, growth concerns
    `;
    
    return context.trim();
  } catch (error) {
    console.error('Error fetching market context:', error);
    return 'Current market context unavailable';
  }
}

// Export the analysis function
export { generateForwardSignalsAnalysis as default };