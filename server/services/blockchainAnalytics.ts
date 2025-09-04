import OpenAI from 'openai';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ChainData {
  name: string;
  value: number;
  color: string;
  change: string;
  volume: string;
  marketCap?: number;
  transactions?: number;
  activeAddresses?: number;
}

interface BlockchainAnalysis {
  timestamp: string;
  chainData: ChainData[];
  analysis: string;
  confidence: number;
  lastScan: string;
}

// Mock real-time data sources - in production, these would be actual API calls
async function fetchBlockchainMetrics(): Promise<ChainData[]> {
  // Simulate API calls to various blockchain networks
  // In production, these would be actual calls to:
  // - Hedera Mirror Node API
  // - Polygon API
  // - Stellar Horizon API
  // - Ethereum APIs
  // - CoinGecko/DefiLlama for market data
  
  const currentTime = new Date();
  const variations = Math.random() * 10 - 5; // Random variation ±5%
  
  return [
    {
      name: 'Hedera',
      value: Math.max(30, Math.min(40, 35 + variations)),
      color: '#be8d00',
      change: `${Math.random() > 0.5 ? '+' : ''}${(Math.random() * 20 - 10).toFixed(1)}%`,
      volume: `$${(1.12 + Math.random() * 0.3).toFixed(2)}B`,
      marketCap: 1120000000,
      transactions: 45000,
      activeAddresses: 12500
    },
    {
      name: 'Polygon',
      value: Math.max(20, Math.min(30, 25 + variations)),
      color: '#8B5CF6',
      change: `${Math.random() > 0.5 ? '+' : ''}${(Math.random() * 15 - 7).toFixed(1)}%`,
      volume: `$${(0.8 + Math.random() * 0.2).toFixed(2)}B`,
      marketCap: 800000000,
      transactions: 32000,
      activeAddresses: 9800
    },
    {
      name: 'Stellar',
      value: Math.max(15, Math.min(25, 20 + variations)),
      color: '#06B6D4',
      change: `${Math.random() > 0.5 ? '+' : ''}${(Math.random() * 18 - 9).toFixed(1)}%`,
      volume: `$${(0.64 + Math.random() * 0.15).toFixed(2)}B`,
      marketCap: 640000000,
      transactions: 28000,
      activeAddresses: 7200
    },
    {
      name: 'Ethereum',
      value: Math.max(10, Math.min(20, 15 + variations)),
      color: '#627EEA',
      change: `${Math.random() > 0.3 ? '+' : ''}${(Math.random() * 12 - 6).toFixed(1)}%`,
      volume: `$${(0.48 + Math.random() * 0.1).toFixed(2)}B`,
      marketCap: 480000000,
      transactions: 18000,
      activeAddresses: 5500
    },
    {
      name: 'Plume',
      value: Math.max(3, Math.min(8, 5 + variations)),
      color: '#F59E0B',
      change: `${Math.random() > 0.2 ? '+' : ''}${(Math.random() * 30 - 5).toFixed(1)}%`,
      volume: `$${(0.16 + Math.random() * 0.05).toFixed(2)}B`,
      marketCap: 160000000,
      transactions: 8500,
      activeAddresses: 2100
    }
  ];
}

async function generateBlockchainAnalysis(chainData: ChainData[]): Promise<string> {
  const prompt = `You are RUNE.CTZ, Commertize's AI analytics engine specializing in blockchain infrastructure analysis for tokenized real estate.

Analyze the following blockchain network data and provide strategic insights:

${chainData.map(chain => `
${chain.name}:
- Market Share: ${chain.value.toFixed(1)}%
- Growth: ${chain.change}
- Volume: ${chain.volume}
- Market Cap: $${(chain.marketCap! / 1000000).toFixed(0)}M
- Daily Transactions: ${chain.transactions?.toLocaleString()}
- Active Addresses: ${chain.activeAddresses?.toLocaleString()}
`).join('\n')}

Provide a comprehensive analysis in JSON format with exactly these 5 insights:
1. Network Dominance Shift
2. Layer-2 Momentum  
3. Emerging Winners
4. Ethereum Challenges
5. Strategic Outlook

Each insight should be 2-3 sentences focusing on:
- Current market dynamics
- Growth drivers or challenges
- Strategic implications for tokenized real estate
- Forward-looking predictions

Response format:
{
  "networkDominance": "analysis text",
  "layer2Momentum": "analysis text", 
  "emergingWinners": "analysis text",
  "ethereumChallenges": "analysis text",
  "strategicOutlook": "analysis text"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are RUNE.CTZ, an expert blockchain analytics AI for tokenized real estate. Provide professional, data-driven analysis focused on infrastructure trends and strategic positioning."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 800
    });

    return response.choices[0].message.content!;
  } catch (error) {
    console.error('Error generating blockchain analysis:', error);
    throw new Error('Failed to generate blockchain analysis');
  }
}

export async function generateDailyBlockchainAnalysis(): Promise<BlockchainAnalysis> {
  try {
    console.log('Fetching blockchain metrics...');
    const chainData = await fetchBlockchainMetrics();
    
    console.log('Generating AI analysis...');
    const analysisJson = await generateBlockchainAnalysis(chainData);
    
    const confidence = Math.floor(Math.random() * 10) + 90; // 90-99% confidence
    const timestamp = new Date().toISOString();
    const lastScan = new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000).toISOString(); // 0-4 hours ago
    
    return {
      timestamp,
      chainData,
      analysis: analysisJson,
      confidence,
      lastScan
    };
  } catch (error) {
    console.error('Error in generateDailyBlockchainAnalysis:', error);
    throw error;
  }
}

export async function getLatestBlockchainAnalysis(): Promise<BlockchainAnalysis> {
  // Import the cached analysis from scheduler
  try {
    const { getCachedBlockchainAnalysis } = await import('../schedulers/blockchainScheduler');
    const cachedAnalysis = getCachedBlockchainAnalysis();
    
    if (cachedAnalysis) {
      return cachedAnalysis;
    }
  } catch (error) {
    console.log('Scheduler not available, generating fresh analysis');
  }
  
  // Fallback to fresh analysis if cache not available
  return await generateDailyBlockchainAnalysis();
}