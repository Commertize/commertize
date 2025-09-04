import fetch from 'node-fetch';

interface MarketData {
  capRates: { [key: string]: number };
  interestRates: {
    prime: number;
    commercial: number;
    treasury10Y: number;
  };
  economicIndicators: {
    inflationRate: number;
    unemploymentRate: number;
    gdpGrowth: number;
  };
  timestamp: string;
}

// Cache for market data to avoid excessive API calls
let marketDataCache: MarketData | null = null;
let cacheExpiry: Date | null = null;

export async function fetchRealTimeMarketData(): Promise<MarketData> {
  // Return cached data if still valid (1 hour cache)
  if (marketDataCache && cacheExpiry && new Date() < cacheExpiry) {
    return marketDataCache;
  }

  try {
    // In a real implementation, these would be actual API calls to:
    // - FRED (Federal Reserve Economic Data) API for rates
    // - CBRE Research API for cap rates
    // - CoStar API for market fundamentals
    // For now, we'll use realistic current market conditions

    const marketData: MarketData = {
      capRates: {
        'Office': 6.2,
        'Industrial': 5.5,
        'Retail': 6.8,
        'Multifamily': 4.8,
        'Mixed': 6.0
      },
      interestRates: {
        prime: 8.5,
        commercial: 6.5, // Current commercial real estate rates
        treasury10Y: 4.2
      },
      economicIndicators: {
        inflationRate: 3.2,
        unemploymentRate: 3.7,
        gdpGrowth: 2.8
      },
      timestamp: new Date().toISOString()
    };

    // Cache the data for 1 hour
    marketDataCache = marketData;
    cacheExpiry = new Date(Date.now() + 60 * 60 * 1000);

    return marketData;
  } catch (error) {
    console.error('Error fetching market data:', error);
    
    // Fallback to reasonable current market assumptions
    return {
      capRates: {
        'Office': 6.2,
        'Industrial': 5.5,
        'Retail': 6.8,
        'Multifamily': 4.8,
        'Mixed': 6.0
      },
      interestRates: {
        prime: 8.5,
        commercial: 6.5,
        treasury10Y: 4.2
      },
      economicIndicators: {
        inflationRate: 3.2,
        unemploymentRate: 3.7,
        gdpGrowth: 2.8
      },
      timestamp: new Date().toISOString()
    };
  }
}

export function getMarketCapRate(propertyType: string, location?: string): number {
  const baseRates = {
    'Office': 6.2,
    'Industrial': 5.5,
    'Retail': 6.8,
    'Multifamily': 4.8,
    'Mixed': 6.0
  };

  let capRate = baseRates[propertyType as keyof typeof baseRates] || 6.0;

  // Location adjustments based on market tiers
  if (location) {
    const gatewayMarkets = ['New York', 'Los Angeles', 'San Francisco', 'Chicago', 'Boston', 'Washington DC'];
    const secondaryMarkets = ['Seattle', 'Austin', 'Denver', 'Atlanta', 'Miami', 'Dallas'];
    
    const isGateway = gatewayMarkets.some(market => location.toLowerCase().includes(market.toLowerCase()));
    const isSecondary = secondaryMarkets.some(market => location.toLowerCase().includes(market.toLowerCase()));
    
    if (isGateway) {
      capRate -= 0.3; // Gateway discount
    } else if (isSecondary) {
      capRate -= 0.1; // Secondary discount
    } else {
      capRate += 0.2; // Tertiary premium
    }
  }

  return capRate;
}

export function getCurrentCommercialRate(propertyValue: number, ltv: number): number {
  let baseRate = 6.5; // Current market rate
  
  // Size-based adjustments
  if (propertyValue > 50000000) baseRate -= 0.25; // Institutional pricing
  else if (propertyValue > 25000000) baseRate -= 0.15; // Large deal pricing
  else if (propertyValue > 15000000) baseRate -= 0.05; // Mid-size deal pricing
  
  // LTV adjustments
  if (ltv > 0.75) baseRate += 0.15; // High LTV premium
  else if (ltv < 0.65) baseRate -= 0.10; // Conservative LTV discount
  
  return Math.max(5.5, baseRate); // Floor at 5.5%
}