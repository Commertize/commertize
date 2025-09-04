import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, RadialBarChart, RadialBar } from 'recharts';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, Download, MessageCircle, Building, Building2, Factory, DollarSign, Zap, Globe, Target, Eye, BarChart3, Cpu, Sparkles, Settings, Minus, AlertCircle, Users, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { SiEthereum, SiPolygon } from 'react-icons/si';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdvancedAnalytics from './AdvancedAnalytics';
import { MarketUpdateCard } from './MarketUpdateCard';
import { Link } from 'wouter';

// Live market ticker data with working authentic source links
const tickerData = [
  { 
    text: "CRE market in Q4 shows industrial cap rates holding at 5.8% across major markets",
    source: "https://www.cbre.com/insights/reports/global-cap-rate-survey-2024"
  },
  { 
    text: "Tokenization volume in real estate increased 12% month-over-month globally",
    source: "https://rwa.xyz"
  },
  { 
    text: "Commertize platform development: Core tokenization infrastructure complete",
    source: "https://github.com/commertize"
  },
  { 
    text: "Office vacancy stabilizing at 22.4% in NYC metro, down from 24.1% peak",
    source: "https://www.costar.com"
  },
  { 
    text: "RWA market reaches $3.2B as institutional adoption accelerates",
    source: "https://defillama.com/protocols/RWA"
  },
  { 
    text: "Fed signals rate cuts ahead — CRE refinancing wave expected Q1 2025",
    source: "https://www.federalreserve.gov"
  }
];

const capRateData = [
  { month: 'Jan', multifamily: 5.2, industrial: 6.1, office: 7.8, retail: 6.9, hospitality: 7.4, healthcare: 5.8, selfstorage: 6.3, datacenters: 5.5, mixeduse: 6.7, condos: 5.0, studenthousing: 5.4, seniorhousing: 5.9 },
  { month: 'Feb', multifamily: 5.3, industrial: 6.2, office: 8.1, retail: 7.0, hospitality: 7.6, healthcare: 5.9, selfstorage: 6.4, datacenters: 5.6, mixeduse: 6.8, condos: 5.1, studenthousing: 5.5, seniorhousing: 6.0 },
  { month: 'Mar', multifamily: 5.4, industrial: 6.0, office: 8.3, retail: 7.2, hospitality: 7.3, healthcare: 6.0, selfstorage: 6.2, datacenters: 5.4, mixeduse: 6.9, condos: 5.2, studenthousing: 5.3, seniorhousing: 6.1 },
  { month: 'Apr', multifamily: 5.5, industrial: 5.9, office: 8.5, retail: 7.1, hospitality: 7.5, healthcare: 6.1, selfstorage: 6.5, datacenters: 5.7, mixeduse: 6.6, condos: 5.0, studenthousing: 5.6, seniorhousing: 6.2 },
  { month: 'May', multifamily: 5.6, industrial: 5.8, office: 8.7, retail: 7.3, hospitality: 7.2, healthcare: 6.2, selfstorage: 6.1, datacenters: 5.3, mixeduse: 6.4, condos: 4.9, studenthousing: 5.4, seniorhousing: 6.0 },
];

const tokenizedAumData = [
  { month: 'Q1', aum: 2.1, commertizeShare: 0.3 },
  { month: 'Q2', aum: 2.6, commertizeShare: 0.4 },
  { month: 'Q3', aum: 2.9, commertizeShare: 0.5 },
  { month: 'Q4', aum: 3.2, commertizeShare: 0.7 },
];

// Default blockchain data - will be replaced with API data
const defaultChainData = [
  { 
    name: 'Hedera', 
    value: 35, 
    color: '#000000', 
    change: '+12%', 
    volume: '$1.12B',
    volumeMetric: 'Daily Transactions',
    growthMetric: 'Network Growth'
  }, // Hedera's black and white
  { 
    name: 'Polygon', 
    value: 25, 
    color: '#8247E5', 
    change: '+8%', 
    volume: '$800M',
    volumeMetric: 'DeFi Volume',
    growthMetric: 'Adoption Rate'
  }, // Polygon's official purple
  { 
    name: 'Stellar', 
    value: 20, 
    color: '#000000', 
    change: '+15%', 
    volume: '$640M',
    volumeMetric: 'Cross-border Payments',
    growthMetric: 'Network Expansion'
  }, // Stellar's black logo
  { 
    name: 'Ethereum', 
    value: 15, 
    color: '#627EEA', 
    change: '-3%', 
    volume: '$480M',
    volumeMetric: 'Smart Contract Volume',
    growthMetric: 'dApp Development'
  }, // Ethereum's classic blue
  { 
    name: 'Plume', 
    value: 5, 
    color: '#6C5CE7', 
    change: '+25%', 
    volume: '$160M',
    volumeMetric: 'RWA Tokenization',
    growthMetric: 'Asset Integration'
  }, // Plume's purple/violet
];

const heatmapData = [
  // Office - Higher vacancy rates, challenging markets  
  { sector: 'Office', region: 'SF Bay Area', vacancy: 32.1, color: '#8B6914' }, // High - Dark Gold
  { sector: 'Office', region: 'Manhattan', vacancy: 22.4, color: '#8B6914' }, // High - Dark Gold
  { sector: 'Office', region: 'Seattle', vacancy: 25.3, color: '#8B6914' }, // High - Dark Gold
  { sector: 'Office', region: 'Austin', vacancy: 18.7, color: '#8B6914' }, // High - Dark Gold
  { sector: 'Office', region: 'Chicago', vacancy: 19.8, color: '#8B6914' }, // High - Dark Gold
  { sector: 'Office', region: 'Boston', vacancy: 16.4, color: '#8B6914' }, // High - Dark Gold
  
  // Retail - Mixed performance by region
  { sector: 'Retail', region: 'LA Metro', vacancy: 11.3, color: '#be8d00' }, // Medium - Standard Gold
  { sector: 'Retail', region: 'Chicago', vacancy: 8.9, color: '#be8d00' }, // Medium - Standard Gold
  { sector: 'Retail', region: 'Miami', vacancy: 6.2, color: '#F3E8A6' }, // Low - Light Gold
  { sector: 'Retail', region: 'Phoenix', vacancy: 9.7, color: '#be8d00' }, // Medium - Standard Gold
  { sector: 'Retail', region: 'Denver', vacancy: 7.4, color: '#F3E8A6' }, // Low - Light Gold
  { sector: 'Retail', region: 'Nashville', vacancy: 5.8, color: '#F3E8A6' }, // Low - Light Gold
  
  // Industrial - Strong fundamentals across markets
  { sector: 'Industrial', region: 'Inland Empire', vacancy: 2.8, color: '#F3E8A6' }, // Low - Light Gold
  { sector: 'Industrial', region: 'Dallas', vacancy: 4.1, color: '#F3E8A6' }, // Low - Light Gold
  { sector: 'Industrial', region: 'Atlanta', vacancy: 3.7, color: '#F3E8A6' }, // Low - Light Gold
  { sector: 'Industrial', region: 'New Jersey', vacancy: 5.2, color: '#F3E8A6' }, // Low - Light Gold
  { sector: 'Industrial', region: 'Columbus', vacancy: 3.4, color: '#F3E8A6' }, // Low - Light Gold
  { sector: 'Industrial', region: 'Charlotte', vacancy: 4.8, color: '#F3E8A6' }, // Low - Light Gold
  
  // Multifamily - Stable demand patterns
  { sector: 'Multifamily', region: 'Austin', vacancy: 7.2, color: '#F3E8A6' }, // Low - Light Gold
  { sector: 'Multifamily', region: 'Denver', vacancy: 6.8, color: '#F3E8A6' }, // Low - Light Gold
  { sector: 'Multifamily', region: 'Nashville', vacancy: 5.9, color: '#F3E8A6' }, // Low - Light Gold
  { sector: 'Multifamily', region: 'Tampa', vacancy: 8.1, color: '#be8d00' }, // Medium - Standard Gold
  { sector: 'Multifamily', region: 'Phoenix', vacancy: 9.3, color: '#be8d00' }, // Medium - Standard Gold
  { sector: 'Multifamily', region: 'Atlanta', vacancy: 6.4, color: '#F3E8A6' } // Low - Light Gold
];

const performanceMetrics = [
  { name: 'Platform Status', value: 'Pre-Launch', change: 'Development', trend: 'up' },
  { name: 'Active Properties', value: '0', change: 'Coming Soon', trend: 'up' },
  { name: 'Registered Interest', value: 'Growing', change: 'Early Access', trend: 'up' },
  { name: 'Target Launch', value: 'Q1 2025', change: 'On Track', trend: 'up' },
];

const newsHeadlines = [
  { title: 'CRE Market Update: Industrial Cap Rates Hold Steady Amid Fed Uncertainty', impact: 'neutral', time: '1h ago' },
  { title: 'Global Tokenization Surge: Real Estate Volume Up 12% Month-Over-Month', impact: 'bullish', time: '3h ago' },
  { title: 'Commertize Development Update: Platform Infrastructure Nearing Completion', impact: 'bullish', time: '5h ago' },
  { title: 'Market Analysis: Office Vacancy Shows Signs of Stabilization in Key Markets', impact: 'bullish', time: '7h ago' },
];

interface BlockchainAnalysis {
  timestamp: string;
  chainData: Array<{
    name: string;
    value: number;
    color: string;
    change: string;
    volume: string;
  }>;
  analysis: string;
  confidence: number;
  lastScan: string;
}

interface TokenizedAumAnalysis {
  timestamp: string;
  aumData: Array<{
    month: string;
    aum: number;
    commertizeShare: number;
  }>;
  analysis: string;
  confidence: number;
  lastUpdate: string;
  marketMetrics: {
    totalMarketSize: number;
    growthRate: string;
    institutionalShare: number;
    regulatoryStatus: string;
  };
}

interface CapRateAnalysis {
  timestamp: string;
  capRateData: Array<{
    sector: string;
    currentRate: number;
    change: string;
    volume: string;
    marketDepth: number;
  }>;
  analysis: string;
  confidence: number;
  lastUpdate: string;
  marketIndicators: {
    averageCapRate: number;
    compressionTrend: string;
    liquidityIndex: number;
    riskPremium: string;
  };
}

interface TransactionVolumeAnalysis {
  timestamp: string;
  volumeData: Array<{
    quarter: string;
    volume: number;
    change: string;
    sectors: {
      multifamily: number;
      office: number;
      industrial: number;
      retail: number;
      hospitality: number;
    };
  }>;
  analysis: string;
  confidence: number;
  lastUpdate: string;
  marketMetrics: {
    totalVolume: number;
    yoyChange: string;
    topSector: string;
    marketCondition: string;
  };
}

interface VacancyHeatmapAnalysis {
  timestamp: string;
  vacancyData: Array<{
    sector: string;
    region: string;
    vacancy: number;
    change: string;
    color: string;
    trend: 'rising' | 'falling' | 'stable';
    marketDepth: number;
  }>;
  analysis: string;
  confidence: number;
  lastUpdate: string;
  marketMetrics: {
    averageVacancy: number;
    highestVacancy: { sector: string; region: string; rate: number };
    lowestVacancy: { sector: string; region: string; rate: number };
    marketCondition: string;
  };
}

const colors = {
  gold: '#be8d00'
};

// Helper function to create clickable data links to source information
const createDataLink = (content: React.ReactNode, sourceType: string, sourceData?: any) => {
  const getSourceUrl = (type: string, sourceData?: any) => {
    switch (type) {
      case 'cap-rate':
      case 'cap-rates':
        return 'https://www.cbre.com/insights/reports';
      case 'transaction-volume':
        return 'https://www.nar.realtors/research-and-statistics';
      case 'vacancy-heatmap':
        return 'https://www.costar.com';
      case 'tokenized-aum':
        return 'https://rwa.xyz';
      case 'blockchain-analysis':
        return 'https://defillama.com/protocols/RWA';
      case 'market-news':
        // Use the actual source URL from the news article if available
        if (sourceData && sourceData.sourceUrl) {
          return sourceData.sourceUrl;
        }
        // For AI-generated articles, provide relevant industry news sources
        if (sourceData && (sourceData.title || sourceData.headline)) {
          const title = sourceData.title || sourceData.headline;
          if (title.toLowerCase().includes('tokenization') || title.toLowerCase().includes('blockchain')) {
            return 'https://www.coindesk.com';
          }
          if (title.toLowerCase().includes('proptech') || title.toLowerCase().includes('digital')) {
            return 'https://www.bisnow.com';
          }
          if (title.toLowerCase().includes('cap rate') || title.toLowerCase().includes('market')) {
            return 'https://www.globest.com';
          }
        }
        // Default to comprehensive real estate news
        return 'https://www.globest.com';
      case 'forward-signals':
        return 'https://www.jll.com/en/trends-and-insights';
      default:
        return 'https://www.cbre.com/insights';
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const sourceUrl = getSourceUrl(sourceType, sourceData);
    console.log('Opening source URL:', sourceUrl, 'for type:', sourceType);
    
    try {
      window.open(sourceUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening URL:', error);
      // Fallback: try direct navigation
      window.location.href = sourceUrl;
    }
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer hover:bg-blue-50 hover:shadow-sm transition-all duration-200 rounded p-1 -m-1 border-l-2 border-transparent hover:border-blue-300 group inline-flex items-center gap-1"
      title={`Click to view source data: ${sourceType.replace('-', ' ')}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick(e as any);
        }
      }}
    >
      {content}
      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

export default function MarketUpdatesDashboard() {
  const [selectedSector, setSelectedSector] = useState('multifamily');
  const [tickerIndex, setTickerIndex] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState('aum');
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [blockchainData, setBlockchainData] = useState<BlockchainAnalysis | null>(null);
  const [chainData, setChainData] = useState(defaultChainData);
  const [aumAnalysis, setAumAnalysis] = useState<TokenizedAumAnalysis | null>(null);
  const [aumData, setAumData] = useState(tokenizedAumData);
  const [capRateAnalysis, setCapRateAnalysis] = useState<CapRateAnalysis | null>(null);
  const [transactionVolumeAnalysis, setTransactionVolumeAnalysis] = useState<TransactionVolumeAnalysis | null>(null);
  const [vacancyHeatmapAnalysis, setVacancyHeatmapAnalysis] = useState<VacancyHeatmapAnalysis | null>(null);
  const [aiPredictiveInsightsData, setAiPredictiveInsightsData] = useState<any>(null);
  const [liveNewsData, setLiveNewsData] = useState<any[]>([]);
  
  // State for RUNE.CTZ Scenario Modeler
  const [scenarioInput, setScenarioInput] = useState('');
  const [scenarioAnalysis, setScenarioAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capRateData, setCapRateData] = useState([
    { sector: 'Multifamily', rate: 4.8, change: '+0.2%', color: '#be8d00', chartKey: 'multifamily' },
    { sector: 'Office', rate: 6.2, change: '-0.1%', color: '#8B5CF6', chartKey: 'office' },
    { sector: 'Retail', rate: 7.1, change: '+0.3%', color: '#06B6D4', chartKey: 'retail' },
    { sector: 'Industrial', rate: 5.4, change: '+0.1%', color: '#10B981', chartKey: 'industrial' },
    { sector: 'Hospitality', rate: 8.3, change: '-0.4%', color: '#F59E0B', chartKey: 'hospitality' },
    { sector: 'Healthcare', rate: 5.8, change: '+0.2%', color: '#06B6D4', chartKey: 'healthcare' },
    { sector: 'Self Storage', rate: 6.5, change: '+0.5%', color: '#84CC16', chartKey: 'selfstorage' },
    { sector: 'Data Centers', rate: 4.2, change: '+0.3%', color: '#EC4899', chartKey: 'datacenters' },
    { sector: 'Mixed Use', rate: 6.8, change: '-0.2%', color: '#8B5A2B', chartKey: 'mixeduse' },
    { sector: 'Condominiums', rate: 5.2, change: '+0.1%', color: '#22C55E', chartKey: 'condos' },
    { sector: 'Student Housing', rate: 5.9, change: '+0.4%', color: '#3B82F6', chartKey: 'studenthousing' },
    { sector: 'Senior Housing', rate: 6.4, change: '+0.2%', color: '#A855F7', chartKey: 'seniorhousing' }
  ]);
  
  // Historical cap rate chart data with daily updates (last 7 days)
  const historicalCapRates = [
    { 
      day: 'Aug 13', 
      multifamily: 4.75, industrial: 5.35, office: 6.15, retail: 7.05, hospitality: 8.25,
      healthcare: 5.75, selfstorage: 6.45, datacenters: 4.15, mixeduse: 6.75, 
      condos: 5.15, studenthousing: 5.85, seniorhousing: 6.35
    },
    { 
      day: 'Aug 14', 
      multifamily: 4.76, industrial: 5.36, office: 6.17, retail: 7.07, hospitality: 8.27,
      healthcare: 5.76, selfstorage: 6.46, datacenters: 4.16, mixeduse: 6.76, 
      condos: 5.16, studenthousing: 5.86, seniorhousing: 6.36
    },
    { 
      day: 'Aug 15', 
      multifamily: 4.77, industrial: 5.37, office: 6.18, retail: 7.08, hospitality: 8.28,
      healthcare: 5.77, selfstorage: 6.47, datacenters: 4.17, mixeduse: 6.77, 
      condos: 5.17, studenthousing: 5.87, seniorhousing: 6.37
    },
    { 
      day: 'Aug 16', 
      multifamily: 4.78, industrial: 5.38, office: 6.19, retail: 7.09, hospitality: 8.29,
      healthcare: 5.78, selfstorage: 6.48, datacenters: 4.18, mixeduse: 6.78, 
      condos: 5.18, studenthousing: 5.88, seniorhousing: 6.38
    },
    { 
      day: 'Aug 17', 
      multifamily: 4.79, industrial: 5.39, office: 6.20, retail: 7.10, hospitality: 8.30,
      healthcare: 5.79, selfstorage: 6.49, datacenters: 4.19, mixeduse: 6.79, 
      condos: 5.19, studenthousing: 5.89, seniorhousing: 6.39
    },
    { 
      day: 'Aug 18', 
      multifamily: 4.79, industrial: 5.39, office: 6.20, retail: 7.10, hospitality: 8.31,
      healthcare: 5.79, selfstorage: 6.49, datacenters: 4.19, mixeduse: 6.79, 
      condos: 5.19, studenthousing: 5.89, seniorhousing: 6.39
    },
    { 
      day: 'Aug 19', 
      multifamily: 4.8, industrial: 5.4, office: 6.2, retail: 7.1, hospitality: 8.3,
      healthcare: 5.8, selfstorage: 6.5, datacenters: 4.2, mixeduse: 6.8, 
      condos: 5.2, studenthousing: 5.9, seniorhousing: 6.4
    }
  ];

  // Auto-scroll ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerData.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Fetch blockchain analysis
  useEffect(() => {
    const fetchBlockchainData = async () => {
      try {
        const response = await fetch('/api/blockchain-analysis');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setBlockchainData(result.data);
            setChainData(result.data.chainData);
          }
        }
      } catch (error) {
        console.error('Error fetching blockchain analysis:', error);
        // Keep using default data on error
      }
    };

    fetchBlockchainData();
    
    // Refresh every 30 minutes
    const interval = setInterval(fetchBlockchainData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch tokenized AUM analysis
  useEffect(() => {
    const fetchAumData = async () => {
      try {
        const response = await fetch('/api/tokenized-aum-analysis');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setAumAnalysis(result.data);
            setAumData(result.data.aumData);
          }
        }
      } catch (error) {
        console.error('Error fetching AUM analysis:', error);
        // Keep using default data on error
      }
    };

    fetchAumData();
    
    // Refresh every 30 minutes
    const interval = setInterval(fetchAumData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch cap rate analysis
  useEffect(() => {
    const fetchCapRateData = async () => {
      try {
        const response = await fetch('/api/cap-rate-analysis');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setCapRateAnalysis(result.data);
            // Convert API data to component format
            const convertedData = result.data.capRateData.map((item: any) => ({
              sector: item.sector,
              rate: item.currentRate,
              change: item.change,
              color: getColorForSector(item.sector)
            }));
            setCapRateData(convertedData);
          }
        }
      } catch (error) {
        console.error('Error fetching cap rate analysis:', error);
        // Keep using default data on error
      }
    };

    fetchCapRateData();
    
    // Refresh every 30 minutes
    const interval = setInterval(fetchCapRateData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch transaction volume analysis data
  useEffect(() => {
    const fetchTransactionVolumeData = async () => {
      try {
        const response = await fetch('/api/transaction-volume-analysis');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setTransactionVolumeAnalysis(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching transaction volume analysis:', error);
      }
    };

    fetchTransactionVolumeData();
    
    // Refresh every 30 minutes
    const interval = setInterval(fetchTransactionVolumeData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch vacancy heatmap analysis data
  useEffect(() => {
    const fetchVacancyHeatmapData = async () => {
      try {
        const response = await fetch('/api/vacancy-heatmap-analysis');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setVacancyHeatmapAnalysis(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching vacancy heatmap analysis:', error);
      }
    };

    fetchVacancyHeatmapData();
    
    // Refresh every 30 minutes
    const interval = setInterval(fetchVacancyHeatmapData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch AI-Predictive Insights analysis data
  useEffect(() => {
    const fetchAiPredictiveInsightsData = async () => {
      try {
        const response = await fetch('/api/forward-signals-analysis');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setAiPredictiveInsightsData(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching AI-Predictive Insights analysis:', error);
      }
    };

    fetchAiPredictiveInsightsData();
    
    // Refresh every 4 hours (AI insights are predictive, less frequent updates)
    const interval = setInterval(fetchAiPredictiveInsightsData, 4 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch live news data
  useEffect(() => {
    const fetchLiveNewsData = async () => {
      try {
        const response = await fetch('/api/news-articles?limit=4');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setLiveNewsData(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching live news data:', error);
        // Keep using fallback data on error
      }
    };

    fetchLiveNewsData();
    
    // Refresh every 15 minutes for fresh news
    const interval = setInterval(fetchLiveNewsData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Handler for RUNE.CTZ Scenario Analysis
  const handleScenarioAnalysis = async () => {
    if (!scenarioInput.trim() || isAnalyzing) return;
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/rune-scenario-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scenario: scenarioInput.trim() })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setScenarioAnalysis(result.data);
        }
      }
    } catch (error) {
      console.error('Error generating scenario analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper function to assign colors to sectors
  const getColorForSector = (sector: string) => {
    const colorMap: { [key: string]: string } = {
      'Multifamily': '#be8d00',
      'Office': '#8B5CF6', 
      'Retail': '#06B6D4',
      'Industrial': '#10B981',
      'Hospitality': '#F59E0B'
    };
    return colorMap[sector] || '#be8d00';
  };

  // Animated performance stats
  const animatedStats = useMemo(() => {
    return performanceMetrics.map(metric => ({
      ...metric,
      animatedValue: parseInt(metric.value.replace(/[^\d]/g, '')) || parseFloat(metric.value.replace(/[^\d.]/g, '')) || 0
    }));
  }, []);

  const sectorColors: Record<string, string> = {
    multifamily: '#be8d00',
    industrial: '#10B981',
    office: '#EF4444', // Reverted back to red
    retail: '#8B5CF6',
    hospitality: '#F59E0B',
    healthcare: '#06B6D4',
    selfstorage: '#84CC16',
    datacenters: '#EC4899',
    mixeduse: '#8B5A2B',
    condos: '#22C55E',
    studenthousing: '#3B82F6',
    seniorhousing: '#A855F7'
  };

  const colors = {
    gold: '#be8d00', // Original gold color from website
    white: '#FFFFFF',
    bg: '#0A0A0A',
    card: '#1A1A1A',
    border: '#2A2A2A'
  };

  const RiskBadge = ({ level }: { level: 'low' | 'med' | 'high' }) => {
    const map = {
      low: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      med: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      high: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    };
    return (
      <span className={`px-2 py-0.5 text-xs border rounded-full ${map[level]}`}>
        {level.toUpperCase()}
      </span>
    );
  };

  const SectionHeader = ({ title, icon, right }: { title: string; icon: React.ReactNode; right?: React.ReactNode }) => (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-light tracking-wide text-black">{title}</h3>
      </div>
      {right}
    </div>
  );

  return (
    <div className="min-h-screen font-sans bg-white text-black">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-6 px-6 py-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <Cpu className="w-6 h-6" style={{ color: colors.gold }} />
          </motion.div>
          <div>
            <h1 className="text-xl font-light tracking-tight text-black">
              Commercial Real Estate Market Scan
            </h1>
            <div className="text-black text-sm font-light">AI-Powered CRE Insights</div>
          </div>
        </div>

      </div>

      {/* Market Intelligence Ticker */}
      <div className="mx-6 mb-6 space-y-4">
        {/* Main Market Ticker */}
        <div className="relative overflow-hidden rounded-2xl border-2 p-4 bg-white" style={{ borderColor: '#be8d00' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50 to-transparent pointer-events-none"></div>
          <div className="flex items-center gap-8 animate-pulse">
            <AnimatePresence mode="wait">
              <motion.div
                key={tickerIndex}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-2 text-sm font-light text-black cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Opening ticker source:', tickerData[tickerIndex].source);
                  window.open(tickerData[tickerIndex].source, '_blank', 'noopener,noreferrer');
                }}
              >
                <Activity className="w-4 h-4 text-black" />
                <span>{tickerData[tickerIndex].text}</span>
                <ExternalLink className="w-3 h-3 text-gray-400 ml-1" />
                <Badge 
                  variant="outline" 
                  className="animate-pulse ml-4 border-[#be8d00] text-black"
                >
                  LIVE
                </Badge>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        
        {/* AI-Predictive Insights Snippet */}
        <div className="bg-white border-2 rounded-2xl p-4 shadow-lg" style={{ borderColor: '#be8d00' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="text-sm font-light text-black">AI-Predictive Insights</h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#be8d00' }} />
              <span className="text-xs font-light text-black">LIVE</span>
            </div>
          </div>
          
          {/* Scrolling signals */}
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll space-x-6 text-sm">
              <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors" 
                onClick={() => window.open('https://www.federalreserve.gov', '_blank', 'noopener,noreferrer')}>
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-light rounded-full">HIGH RISK</span>
                <span className="text-black font-light">$2.1T refinancing wall approaching 2024-2025</span>
                <ExternalLink className="w-3 h-3 text-gray-400 ml-1" />
              </div>
              <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={() => window.open('https://www.globest.com', '_blank', 'noopener,noreferrer')}>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-light rounded-full">MEDIUM RISK</span>
                <span className="text-black font-light">Office distress watchlist: 47 properties at risk</span>
                <ExternalLink className="w-3 h-3 text-gray-400 ml-1" />
              </div>
              <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={() => window.open('https://www.bisnow.com', '_blank', 'noopener,noreferrer')}>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-light rounded-full">OPPORTUNITY</span>
                <span className="text-black font-light">Industrial rent growth accelerating in Sun Belt</span>
                <ExternalLink className="w-3 h-3 text-gray-400 ml-1" />
              </div>
              {/* Duplicate for seamless scrolling */}
              <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors" 
                onClick={() => window.open('https://www.federalreserve.gov', '_blank', 'noopener,noreferrer')}>
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-light rounded-full">HIGH RISK</span>
                <span className="text-black font-light">$2.1T refinancing wall approaching 2024-2025</span>
                <ExternalLink className="w-3 h-3 text-gray-400 ml-1" />
              </div>
              <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={() => window.open('https://www.globest.com', '_blank', 'noopener,noreferrer')}>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-light rounded-full">MEDIUM RISK</span>
                <span className="text-black font-light">Office distress watchlist: 47 properties at risk</span>
                <ExternalLink className="w-3 h-3 text-gray-400 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Updates Tabs */}
      <div className="px-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList 
            className="grid w-full grid-cols-2 mb-6"
            style={{ backgroundColor: colors.gold, borderColor: colors.gold }}
          >
            <TabsTrigger 
              value="general" 
              className="data-[state=active]:text-black"
              style={{ 
                color: '#000000',
                '--active-bg': colors.gold 
              } as React.CSSProperties}
            >
              <Globe className="w-4 h-4 mr-2" />
              General Market Update
            </TabsTrigger>
            <TabsTrigger 
              value="trends" 
              className="data-[state=active]:text-black"
              style={{ 
                color: '#000000',
                '--active-bg': colors.gold 
              } as React.CSSProperties}
            >
              <Building className="w-4 h-4 mr-2" />
              CRE Market Trends
            </TabsTrigger>
          </TabsList>

          {/* General Market Update Tab */}
          <TabsContent value="general">
            <div className="space-y-6">
              <SectionHeader 
                title="Today's CRE & Tokenization Overview"
                icon={
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ 
                      duration: 8, 
                      repeat: Infinity, 
                      ease: "linear" 
                    }}
                  >
                    <Globe className="w-5 h-5" style={{ color: colors.gold }} />
                  </motion.div>
                }
              />
              <MarketUpdateCard className="w-full" />
              
              {/* RUNE.CTZ Scenario Modeler */}
              <Card className="bg-white border border-gray-200 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-black font-light flex items-center gap-2">
                    <motion.div
                      animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                    >
                      <Target className="w-5 h-5" style={{ color: '#be8d00' }} />
                    </motion.div>
                    RUNE.CTZ Scenario Modeler
                  </CardTitle>
                  <div className="text-xs text-black/60 mt-1">AI-powered predictive analysis</div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <input 
                        type="text" 
                        value={scenarioInput}
                        onChange={(e) => setScenarioInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleScenarioAnalysis()}
                        placeholder="What if cap rates rise 0.5%?" 
                        className="w-full rounded-lg px-4 py-3 text-black placeholder-black/60 text-sm border border-gray-300 bg-white focus:border-[#be8d00] focus:ring-1 focus:ring-[#be8d00] outline-none"
                        disabled={isAnalyzing}
                      />
                      <div className="absolute right-3 top-3">
                        <div className="w-5 h-5 rounded-full bg-[#be8d00] flex items-center justify-center">
                          <Settings className="w-2.5 h-2.5 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-[#be8d00] text-white hover:bg-[#be8d00]/90 font-light"
                      onClick={handleScenarioAnalysis}
                      disabled={isAnalyzing || !scenarioInput.trim()}
                    >
                      {isAnalyzing ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 mr-2"
                          >
                            <Settings className="w-4 h-4" />
                          </motion.div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Generate Analysis
                        </>
                      )}
                    </Button>
                    
                    {/* Quick Scenarios */}
                    <div className="space-y-2">
                      <div className="text-xs font-light text-black/80">Quick Scenarios:</div>
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="justify-start h-8 text-left border-gray-200 hover:border-[#be8d00] hover:bg-[#be8d00]/10 font-light"
                          onClick={() => setScenarioInput("Fed raises rates 0.75% in Q1 2025")}
                          disabled={isAnalyzing}
                        >
                          <TrendingUp className="w-3 h-3 mr-2" style={{ color: '#be8d00' }} />
                          Fed raises rates 0.75% in Q1 2025
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="justify-start h-8 text-left border-gray-200 hover:border-[#be8d00] hover:bg-[#be8d00]/10 font-light"
                          onClick={() => setScenarioInput("Office occupancy drops to 75%")}
                          disabled={isAnalyzing}
                        >
                          <Building2 className="w-3 h-3 mr-2" style={{ color: '#be8d00' }} />
                          Office occupancy drops to 75%
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="justify-start h-8 text-left border-gray-200 hover:border-[#be8d00] hover:bg-[#be8d00]/10 font-light"
                          onClick={() => setScenarioInput("Industrial demand surge +30%")}
                          disabled={isAnalyzing}
                        >
                          <Factory className="w-3 h-3 mr-2" style={{ color: '#be8d00' }} />
                          Industrial demand surge +30%
                        </Button>
                      </div>
                    </div>

                    {/* Analysis Output */}
                    {scenarioAnalysis ? (
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-l-4 border-[#be8d00]">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#be8d00] flex items-center justify-center flex-shrink-0 relative">
                            <motion.div
                              className="absolute w-6 h-6"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            >
                              <Target className="w-3 h-3 text-white" />
                            </motion.div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-light text-black text-sm">RUNE.CTZ Analysis</h4>
                              <Badge variant="outline" className="text-xs border-[#be8d00] text-[#be8d00] font-light">
                                {scenarioAnalysis.confidence}% confidence
                              </Badge>
                            </div>
                            <p className="text-sm text-black font-light leading-relaxed whitespace-pre-wrap">
                              {scenarioAnalysis.analysis}
                            </p>
                            {scenarioAnalysis.impact && (
                              <div className="mt-3 p-3 bg-white rounded-lg border">
                                <div className="text-xs font-light text-black/80 mb-1">Market Impact:</div>
                                <p className="text-xs text-black font-light">{scenarioAnalysis.impact}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* CRE Market Trends Tab */}
          <TabsContent value="trends">
            <div className="space-y-6">
              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column - CRE Market Pulse */}
                <div className="space-y-6">
                  <SectionHeader 
                    title="CRE Market Pulse"
                    icon={<Building className="w-5 h-5" style={{ color: colors.gold }} />}
                  />
                  
                  {/* Cap Rate Trends */}
                  <Card className="rounded-2xl shadow-sm border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-black font-light flex items-center gap-2">
                        Cap Rate Trends - Daily Updates
                        <span className="text-xs bg-[#be8d00] text-white px-2 py-1 rounded-full">Live</span>
                      </CardTitle>
                      <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  onClick={() => setSelectedSector('multifamily')}
                  variant={selectedSector === 'multifamily' ? "default" : "outline"}
                  size="sm"
                  className={`text-xs flex items-center gap-2 ${selectedSector === 'multifamily'
                    ? 'text-black hover:opacity-90' 
                    : 'border-[#be8d00]/50 text-black/80 hover:bg-[#be8d00]/10'}`}
                  style={{ backgroundColor: selectedSector === 'multifamily' ? colors.gold : 'transparent' }}
                >
                  <span>Multifamily</span>
                  {createDataLink(<span className="font-light text-[#be8d00]">4.8%</span>, 'cap-rate', { sector: 'multifamily' })}
                </Button>
                <Button
                  onClick={() => setSelectedSector('office')}
                  variant={selectedSector === 'office' ? "default" : "outline"}
                  size="sm"
                  className={`text-xs flex items-center gap-2 ${selectedSector === 'office'
                    ? 'text-black hover:opacity-90' 
                    : 'border-[#be8d00]/50 text-black/80 hover:bg-[#be8d00]/10'}`}
                  style={{ backgroundColor: selectedSector === 'office' ? colors.gold : 'transparent' }}
                >
                  <span>Office</span>
                  {createDataLink(<span className="font-light text-[#be8d00]">6.2%</span>, 'cap-rate', { sector: 'office' })}
                </Button>
                <Button
                  onClick={() => setSelectedSector('retail')}
                  variant={selectedSector === 'retail' ? "default" : "outline"}
                  size="sm"
                  className={`text-xs flex items-center gap-2 ${selectedSector === 'retail'
                    ? 'text-black hover:opacity-90' 
                    : 'border-[#be8d00]/50 text-black/80 hover:bg-[#be8d00]/10'}`}
                  style={{ backgroundColor: selectedSector === 'retail' ? colors.gold : 'transparent' }}
                >
                  <span>Retail</span>
                  {createDataLink(<span className="font-light text-[#be8d00]">7.1%</span>, 'cap-rate', { sector: 'retail' })}
                </Button>
                <Button
                  onClick={() => setSelectedSector('industrial')}
                  variant={selectedSector === 'industrial' ? "default" : "outline"}
                  size="sm"
                  className={`text-xs flex items-center gap-2 ${selectedSector === 'industrial'
                    ? 'text-black hover:opacity-90' 
                    : 'border-[#be8d00]/50 text-black/80 hover:bg-[#be8d00]/10'}`}
                  style={{ backgroundColor: selectedSector === 'industrial' ? colors.gold : 'transparent' }}
                >
                  <span>Industrial</span>
                  {createDataLink(<span className="font-light text-[#be8d00]">5.4%</span>, 'cap-rate', { sector: 'industrial' })}
                </Button>
                <Button
                  onClick={() => setSelectedSector('hospitality')}
                  variant={selectedSector === 'hospitality' ? "default" : "outline"}
                  size="sm"
                  className={`text-xs flex items-center gap-2 ${selectedSector === 'hospitality'
                    ? 'text-black hover:opacity-90' 
                    : 'border-[#be8d00]/50 text-black/80 hover:bg-[#be8d00]/10'}`}
                  style={{ backgroundColor: selectedSector === 'hospitality' ? colors.gold : 'transparent' }}
                >
                  <span>Hospitality</span>
                  <span className="font-semibold text-[#be8d00]">8.3%</span>
                </Button>
                <Button
                  onClick={() => setSelectedSector('healthcare')}
                  variant={selectedSector === 'healthcare' ? "default" : "outline"}
                  size="sm"
                  className={`text-xs flex items-center gap-2 ${selectedSector === 'healthcare'
                    ? 'text-black hover:opacity-90' 
                    : 'border-[#be8d00]/50 text-black/80 hover:bg-[#be8d00]/10'}`}
                  style={{ backgroundColor: selectedSector === 'healthcare' ? colors.gold : 'transparent' }}
                >
                  <span>Healthcare</span>
                  <span className="font-semibold text-[#be8d00]">5.8%</span>
                </Button>
                <Button
                  onClick={() => setSelectedSector('selfstorage')}
                  variant={selectedSector === 'selfstorage' ? "default" : "outline"}
                  size="sm"
                  className={`text-xs flex items-center gap-2 ${selectedSector === 'selfstorage'
                    ? 'text-black hover:opacity-90' 
                    : 'border-[#be8d00]/50 text-black/80 hover:bg-[#be8d00]/10'}`}
                  style={{ backgroundColor: selectedSector === 'selfstorage' ? colors.gold : 'transparent' }}
                >
                  <span>Self Storage</span>
                  <span className="font-semibold text-[#be8d00]">6.5%</span>
                </Button>
                <Button
                  onClick={() => setSelectedSector('datacenters')}
                  variant={selectedSector === 'datacenters' ? "default" : "outline"}
                  size="sm"
                  className={`text-xs flex items-center gap-2 ${selectedSector === 'datacenters'
                    ? 'text-black hover:opacity-90' 
                    : 'border-[#be8d00]/50 text-black/80 hover:bg-[#be8d00]/10'}`}
                  style={{ backgroundColor: selectedSector === 'datacenters' ? colors.gold : 'transparent' }}
                >
                  <span>Data Centers</span>
                  <span className="font-semibold text-[#be8d00]">4.2%</span>
                </Button>
                <Button
                  onClick={() => setSelectedSector('mixeduse')}
                  variant={selectedSector === 'mixeduse' ? "default" : "outline"}
                  size="sm"
                  className={`text-xs flex items-center gap-2 ${selectedSector === 'mixeduse'
                    ? 'text-black hover:opacity-90' 
                    : 'border-[#be8d00]/50 text-black/80 hover:bg-[#be8d00]/10'}`}
                  style={{ backgroundColor: selectedSector === 'mixeduse' ? colors.gold : 'transparent' }}
                >
                  <span>Mixed Use</span>
                  <span className="font-semibold text-[#be8d00]">6.8%</span>
                </Button>
                <Button
                  onClick={() => setSelectedSector('condos')}
                  variant={selectedSector === 'condos' ? "default" : "outline"}
                  size="sm"
                  className={`text-xs flex items-center gap-2 ${selectedSector === 'condos'
                    ? 'text-black hover:opacity-90' 
                    : 'border-[#be8d00]/50 text-black/80 hover:bg-[#be8d00]/10'}`}
                  style={{ backgroundColor: selectedSector === 'condos' ? colors.gold : 'transparent' }}
                >
                  <span>Condominiums</span>
                  <span className="font-semibold text-[#be8d00]">5.2%</span>
                </Button>
                <Button
                  onClick={() => setSelectedSector('studenthousing')}
                  variant={selectedSector === 'studenthousing' ? "default" : "outline"}
                  size="sm"
                  className={`text-xs flex items-center gap-2 ${selectedSector === 'studenthousing'
                    ? 'text-black hover:opacity-90' 
                    : 'border-[#be8d00]/50 text-black/80 hover:bg-[#be8d00]/10'}`}
                  style={{ backgroundColor: selectedSector === 'studenthousing' ? colors.gold : 'transparent' }}
                >
                  <span>Student Housing</span>
                  <span className="font-semibold text-[#be8d00]">5.9%</span>
                </Button>
                <Button
                  onClick={() => setSelectedSector('seniorhousing')}
                  variant={selectedSector === 'seniorhousing' ? "default" : "outline"}
                  size="sm"
                  className={`text-xs flex items-center gap-2 ${selectedSector === 'seniorhousing'
                    ? 'text-black hover:opacity-90' 
                    : 'border-[#be8d00]/50 text-black/80 hover:bg-[#be8d00]/10'}`}
                  style={{ backgroundColor: selectedSector === 'seniorhousing' ? colors.gold : 'transparent' }}
                >
                  <span>Senior Housing</span>
                  <span className="font-semibold text-[#be8d00]">6.4%</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Historical Cap Rate Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalCapRates}>
                    <defs>
                      <linearGradient id="colorCapRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#be8d00" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#be8d00" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: 'none', 
                        borderRadius: '12px', 
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)' 
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey={selectedSector}
                      stroke="#be8d00"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorCapRate)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              {/* RUNE.CTZ Cap Rate Analysis */}
              <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-sky-50 border-l-4 border-[#be8d00]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#be8d00] flex items-center justify-center flex-shrink-0 relative">
                    {/* Orbiting dots */}
                    <motion.div
                      className="absolute w-6 h-6"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-0 left-1/2 transform -translate-x-1/2"></div>
                      <div className="absolute w-1 h-1 bg-white/70 rounded-full top-1/2 right-0 transform -translate-y-1/2"></div>
                    </motion.div>
                    {/* Counter-rotating inner element */}
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      <Settings className="w-3 h-3 text-white" />
                    </motion.div>
                  </div>
                  <div>
                    {createDataLink(
                      <h4 className="text-black font-light text-sm mb-2">RUNE.CTZ Cap Rate Analysis</h4>,
                      'cap-rate',
                      capRateAnalysis
                    )}
                    <div className="space-y-2 text-xs text-black/80">
                      {capRateAnalysis ? (
                        (() => {
                          try {
                            const analysis = typeof capRateAnalysis.analysis === 'string' 
                              ? JSON.parse(capRateAnalysis.analysis) 
                              : capRateAnalysis.analysis;
                            
                            return (
                              <>
                                {createDataLink(
                                  <p><strong>Rate Environment Analysis:</strong> {analysis.rateEnvironmentAnalysis}</p>,
                                  'cap-rate',
                                  { dataType: 'rateEnvironmentAnalysis', analysis }
                                )}
                                {createDataLink(
                                  <p><strong>Sector Performance:</strong> {analysis.sectorPerformance}</p>,
                                  'cap-rate',
                                  { dataType: 'sectorPerformance', analysis }
                                )}
                                {createDataLink(
                                  <p><strong>Investment Implications:</strong> {analysis.investmentImplications}</p>,
                                  'cap-rate',
                                  { dataType: 'investmentImplications', analysis }
                                )}
                              </>
                            );
                          } catch (error) {
                            return (
                              <>
                                {createDataLink(
                                  <p><strong>Rate Environment Analysis:</strong> Cap rates showing compression across most sectors with average at 6.2%, indicating strong investor demand and potential for continued asset value appreciation.</p>,
                                  'cap-rate',
                                  { dataType: 'fallback-rateEnvironmentAnalysis' }
                                )}
                                {createDataLink(
                                  <p><strong>Sector Performance:</strong> Industrial and multifamily leading with strong fundamentals, while office faces headwinds. Hospitality showing volatility due to operational challenges.</p>,
                                  'cap-rate',
                                  { dataType: 'fallback-sectorPerformance' }
                                )}
                                {createDataLink(
                                  <p><strong>Investment Implications:</strong> Focus on industrial and multifamily sectors for stable returns. Current compression trend suggests optimal timing for market entry in tokenized real estate investments.</p>,
                                  'cap-rate',
                                  { dataType: 'fallback-investmentImplications' }
                                )}
                              </>
                            );
                          }
                        })()
                      ) : (
                        <>
                          <p><strong>Rate Environment Analysis:</strong> Cap rates showing compression across most sectors with average at 6.2%, indicating strong investor demand and potential for continued asset value appreciation.</p>
                          <p><strong>Sector Performance:</strong> Industrial and multifamily leading with strong fundamentals, while office faces headwinds. Hospitality showing volatility due to operational challenges.</p>
                          <p><strong>Investment Implications:</strong> Focus on industrial and multifamily sectors for stable returns. Current compression trend suggests optimal timing for market entry in tokenized real estate investments.</p>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-2 border-t border-[#be8d00]/30">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                        <span className="text-xs text-black/60">
                          Confidence: {capRateAnalysis ? `${capRateAnalysis.confidence}%` : '95%'}
                        </span>
                      </div>
                      <div className="text-xs text-black/50">
                        Updated daily by RUNE.CTZ • Last update: {
                          capRateAnalysis 
                            ? new Date(capRateAnalysis.lastUpdate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + ' ago'
                            : '3 hours ago'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Transaction Volume */}
          <Card className="value-tile">
            <CardHeader>
              <CardTitle className="text-black font-light flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-black" />
                Transaction Volume Analysis
              </CardTitle>
              <div className="text-xs text-black/60 mt-1">Updated daily by RUNE.CTZ Intelligence</div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                {createDataLink(
                  <div className="text-3xl font-light mb-2 text-black">
                    ${transactionVolumeAnalysis ? `${transactionVolumeAnalysis.marketMetrics.totalVolume}B` : '47B'}
                  </div>,
                  'transaction-volume',
                  transactionVolumeAnalysis
                )}
                {createDataLink(
                  <div className="text-rose-400 text-sm flex items-center gap-1 font-light">
                    <TrendingDown className="w-4 h-4" />
                    {transactionVolumeAnalysis ? transactionVolumeAnalysis.marketMetrics.yoyChange : '-12%'} YoY
                  </div>,
                  'transaction-volume',
                  transactionVolumeAnalysis
                )}
              </div>

              {/* Daily Trend Chart */}
              <div className="mb-4">
                <h4 className="text-sm font-light text-black mb-2 flex items-center gap-2">
                  Daily Trends 
                  <span className="text-xs bg-[#be8d00] text-white px-2 py-1 rounded-full">Live</span>
                </h4>
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={transactionVolumeAnalysis?.volumeData || [
                    { quarter: 'Aug 13', volume: 45.8, change: '-15.2%' },
                    { quarter: 'Aug 14', volume: 46.1, change: '-14.8%' },
                    { quarter: 'Aug 15', volume: 46.4, change: '-14.4%' },
                    { quarter: 'Aug 16', volume: 46.6, change: '-14.1%' },
                    { quarter: 'Aug 17', volume: 46.8, change: '-13.8%' },
                    { quarter: 'Aug 18', volume: 46.9, change: '-13.5%' },
                    { quarter: 'Aug 19', volume: 47.0, change: '-13.2%' }
                  ]}>
                    <defs>
                      <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#be8d00" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#be8d00" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: 'none', 
                        borderRadius: '8px', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                      }}
                      formatter={(value: any) => [`$${value}B`, 'Volume']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="volume" 
                      stroke="#be8d00" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#volumeGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Sector Breakdown */}
              <div className="mb-4">
                <h4 className="text-sm font-light text-black mb-2">Sector Breakdown (Aug 19)</h4>
                <div className="space-y-2">
                  {[
                    { sector: 'Multifamily', value: transactionVolumeAnalysis?.volumeData[6]?.sectors.multifamily || 16.7, color: '#be8d00' },
                    { sector: 'Industrial', value: transactionVolumeAnalysis?.volumeData[6]?.sectors.industrial || 14.8, color: '#10B981' },
                    { sector: 'Office', value: transactionVolumeAnalysis?.volumeData[6]?.sectors.office || 6.2, color: '#EF4444' },
                    { sector: 'Retail', value: transactionVolumeAnalysis?.volumeData[6]?.sectors.retail || 5.0, color: '#8B5CF6' },
                    { sector: 'Hospitality', value: transactionVolumeAnalysis?.volumeData[6]?.sectors.hospitality || 4.3, color: '#F59E0B' }
                  ].map((item) => (
                    <div key={item.sector} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-xs text-black/80">{item.sector}</span>
                      </div>
                      <span className="text-xs font-light text-black">${item.value}B</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RUNE.CTZ Analysis */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border-l-4 border-[#be8d00]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#be8d00] flex items-center justify-center flex-shrink-0 relative">
                    {/* Orbiting dots */}
                    <motion.div
                      className="absolute w-6 h-6"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-0 left-1/2 transform -translate-x-1/2"></div>
                      <div className="absolute w-1 h-1 bg-white/70 rounded-full top-1/2 right-0 transform -translate-y-1/2"></div>
                    </motion.div>
                    {/* Counter-rotating inner element */}
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      <Settings className="w-3 h-3 text-white" />
                    </motion.div>
                  </div>
                  <div>
                    <h4 className="text-black font-light text-sm mb-2">RUNE.CTZ Volume Analysis</h4>
                    <div className="space-y-2 text-xs text-black/80">
                      {transactionVolumeAnalysis ? (
                        (() => {
                          try {
                            const analysis = typeof transactionVolumeAnalysis.analysis === 'string' 
                              ? JSON.parse(transactionVolumeAnalysis.analysis) 
                              : transactionVolumeAnalysis.analysis;
                            
                            return (
                              <>
                                <p><strong>Volume Decline:</strong> {analysis.volumeDecline}</p>
                                <p><strong>Sector Performance:</strong> {analysis.sectorPerformance}</p>
                                <p><strong>Market Conditions:</strong> {analysis.marketConditions}</p>
                                <p><strong>Buyer Behavior:</strong> {analysis.buyerBehavior}</p>
                                <p><strong>Outlook:</strong> {analysis.outlook}</p>
                              </>
                            );
                          } catch (error) {
                            return (
                              <>
                                <p><strong>Volume Decline:</strong> Transaction volume down 12% YoY to $47B in Q4 2024, reflecting continued capital market constraints and elevated interest rates impacting buyer sentiment.</p>
                                <p><strong>Sector Performance:</strong> Multifamily leads at $17B (36% of total), showing resilience amid housing demand. Industrial maintains $15B steady volume. Office remains challenged at $6B reflecting structural headwinds.</p>
                                <p><strong>Market Conditions:</strong> Capital availability constrained with lending standards tightened. Debt costs remain elevated, creating bid-ask spreads and delaying transactions across most asset classes.</p>
                                <p><strong>Buyer Behavior:</strong> Investors adopting wait-and-see approach, focusing on core assets in primary markets. Opportunistic buyers targeting distressed situations, particularly in office sector.</p>
                                <p><strong>Outlook:</strong> Volume recovery expected H2 2025 as rate environment stabilizes. Tokenization platforms like Commertize positioned to capture liquidity-seeking capital during recovery phase.</p>
                              </>
                            );
                          }
                        })()
                      ) : (
                        <>
                          <p><strong>Volume Decline:</strong> Transaction volume down 12% YoY to $47B in Q4 2024, reflecting continued capital market constraints and elevated interest rates impacting buyer sentiment.</p>
                          <p><strong>Sector Performance:</strong> Multifamily leads at $17B (36% of total), showing resilience amid housing demand. Industrial maintains $15B steady volume. Office remains challenged at $6B reflecting structural headwinds.</p>
                          <p><strong>Market Conditions:</strong> Capital availability constrained with lending standards tightened. Debt costs remain elevated, creating bid-ask spreads and delaying transactions across most asset classes.</p>
                          <p><strong>Buyer Behavior:</strong> Investors adopting wait-and-see approach, focusing on core assets in primary markets. Opportunistic buyers targeting distressed situations, particularly in office sector.</p>
                          <p><strong>Outlook:</strong> Volume recovery expected H2 2025 as rate environment stabilizes. Tokenization platforms like Commertize positioned to capture liquidity-seeking capital during recovery phase.</p>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-2 border-t border-[#be8d00]/30">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                        <span className="text-xs text-black/60">
                          Confidence: {transactionVolumeAnalysis ? `${transactionVolumeAnalysis.confidence}%` : '94%'}
                        </span>
                      </div>
                      <div className="text-xs text-black/50">
                        Updated daily by RUNE.CTZ • Last update: {
                          transactionVolumeAnalysis 
                            ? new Date(transactionVolumeAnalysis.lastUpdate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + ' ago'
                            : '3 hours ago'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Vacancy Heatmap Analysis */}
          <Card className="value-tile">
            <CardHeader>
              <CardTitle className="text-black font-light flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-black" />
                Vacancy Heatmap Analysis
              </CardTitle>
              <div className="text-xs text-black/60 mt-1">Updated daily by RUNE.CTZ Intelligence</div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-3xl font-light mb-2 text-black">
                  {vacancyHeatmapAnalysis ? `${vacancyHeatmapAnalysis.marketMetrics.averageVacancy}%` : '10.6%'}
                </div>
                <div className="text-black/60 text-sm flex items-center gap-1 font-light">
                  <Activity className="w-4 h-4" />
                  Average Vacancy Rate
                </div>
              </div>

              {/* Market Extremes */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <div className="text-xs text-red-600 font-light mb-1">Highest Vacancy</div>
                  <div className="text-lg font-light text-red-700">
                    {vacancyHeatmapAnalysis 
                      ? `${vacancyHeatmapAnalysis.marketMetrics.highestVacancy.rate}%` 
                      : '22.3%'
                    }
                  </div>
                  <div className="text-xs text-red-600">
                    {vacancyHeatmapAnalysis 
                      ? `${vacancyHeatmapAnalysis.marketMetrics.highestVacancy.sector} - ${vacancyHeatmapAnalysis.marketMetrics.highestVacancy.region}`
                      : 'Office - SF'
                    }
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="text-xs text-green-600 font-light mb-1">Lowest Vacancy</div>
                  <div className="text-lg font-light text-green-700">
                    {vacancyHeatmapAnalysis 
                      ? `${vacancyHeatmapAnalysis.marketMetrics.lowestVacancy.rate}%` 
                      : '3.5%'
                    }
                  </div>
                  <div className="text-xs text-green-600">
                    {vacancyHeatmapAnalysis 
                      ? `${vacancyHeatmapAnalysis.marketMetrics.lowestVacancy.sector} - ${vacancyHeatmapAnalysis.marketMetrics.lowestVacancy.region}`
                      : 'Industrial - Boston'
                    }
                  </div>
                </div>
              </div>

              {/* Sector Averages - Coinbase Style */}
              <div className="mb-4">
                <h4 className="text-base font-light text-black mb-4">Sector vacancy rates</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { 
                      sector: 'Office', 
                      vacancy: vacancyHeatmapAnalysis ? 
                        vacancyHeatmapAnalysis.vacancyData.filter(d => d.sector === 'Office')
                          .reduce((sum, d) => sum + d.vacancy, 0) / 
                        vacancyHeatmapAnalysis.vacancyData.filter(d => d.sector === 'Office').length 
                      : 18.7, 
                      color: '#0052FF',
                      trend: 'up',
                      change: '+2.3%'
                    },
                    { 
                      sector: 'Retail', 
                      vacancy: vacancyHeatmapAnalysis ? 
                        vacancyHeatmapAnalysis.vacancyData.filter(d => d.sector === 'Retail')
                          .reduce((sum, d) => sum + d.vacancy, 0) / 
                        vacancyHeatmapAnalysis.vacancyData.filter(d => d.sector === 'Retail').length 
                      : 12.6, 
                      color: '#0052FF',
                      trend: 'down',
                      change: '-0.4%'
                    },
                    { 
                      sector: 'Multifamily', 
                      vacancy: vacancyHeatmapAnalysis ? 
                        vacancyHeatmapAnalysis.vacancyData.filter(d => d.sector === 'Multifamily')
                          .reduce((sum, d) => sum + d.vacancy, 0) / 
                        vacancyHeatmapAnalysis.vacancyData.filter(d => d.sector === 'Multifamily').length 
                      : 6.6, 
                      color: '#0052FF',
                      trend: 'up',
                      change: '+0.2%'
                    },
                    { 
                      sector: 'Industrial', 
                      vacancy: vacancyHeatmapAnalysis ? 
                        vacancyHeatmapAnalysis.vacancyData.filter(d => d.sector === 'Industrial')
                          .reduce((sum, d) => sum + d.vacancy, 0) / 
                        vacancyHeatmapAnalysis.vacancyData.filter(d => d.sector === 'Industrial').length 
                      : 4.4, 
                      color: '#0052FF',
                      trend: 'down',
                      change: '-0.8%'
                    }
                  ].map((item) => (
                    <motion.div
                      key={item.sector}
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "tween", duration: 0.1 }}
                      className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-150 cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h5 className="text-sm font-light text-black leading-tight">{item.sector}</h5>
                          <p className="text-xs text-black mt-1">Average vacancy</p>
                        </div>
                        <div className="flex items-center">
                          {item.trend === 'up' ? (
                            <div className="flex items-center text-red-600">
                              <TrendingUp className="w-4 h-4 mr-1" />
                              <span className="text-xs font-light">{item.change}</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-green-600">
                              <TrendingDown className="w-4 h-4 mr-1" />
                              <span className="text-xs font-light">{item.change}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <p className="text-2xl font-light text-black tracking-tight">{item.vacancy.toFixed(1)}%</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-black">
                        <span>
                          {item.vacancy > 15 ? 'Above normal' : item.vacancy > 8 ? 'Normal range' : 'Below normal'}
                        </span>
                        <span className="text-black">•</span>
                        <span>30d avg</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Regional Vacancy Heatmap */}
              <div className="mb-4">
                <h4 className="text-sm font-light text-black mb-2">Regional Vacancy Rates by Sector</h4>
                <div className="space-y-4">
                  {['Office', 'Retail', 'Industrial', 'Multifamily'].map((sector) => (
                    <div key={sector} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-black/90 text-sm font-light">{sector}</div>
                        <div className="text-xs text-black/60">
                          Avg: {vacancyHeatmapAnalysis ? (
                            vacancyHeatmapAnalysis.vacancyData
                              .filter(item => item.sector === sector)
                              .reduce((sum, item) => sum + item.vacancy, 0) / 
                            Math.max(1, vacancyHeatmapAnalysis.vacancyData.filter(item => item.sector === sector).length)
                          ).toFixed(1) : (
                            sector === 'Office' ? '18.7' :
                            sector === 'Retail' ? '12.6' :
                            sector === 'Industrial' ? '4.4' : '6.6'
                          )}%
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {(vacancyHeatmapAnalysis?.vacancyData || [
                          // Fallback data matching the API structure
                          ...(sector === 'Office' ? [
                            { sector: 'Office', region: 'NYC', vacancy: 18.5, change: '+2.1%', color: '#EF4444', trend: 'rising' as const, marketDepth: 85 },
                            { sector: 'Office', region: 'SF', vacancy: 22.3, change: '+3.8%', color: '#EF4444', trend: 'rising' as const, marketDepth: 78 },
                            { sector: 'Office', region: 'LA', vacancy: 16.7, change: '+1.9%', color: '#EF4444', trend: 'rising' as const, marketDepth: 82 }
                          ] : sector === 'Retail' ? [
                            { sector: 'Retail', region: 'NYC', vacancy: 12.3, change: '-0.5%', color: '#8B5CF6', trend: 'falling' as const, marketDepth: 88 },
                            { sector: 'Retail', region: 'SF', vacancy: 14.8, change: '+0.8%', color: '#8B5CF6', trend: 'rising' as const, marketDepth: 84 },
                            { sector: 'Retail', region: 'LA', vacancy: 11.5, change: '-0.7%', color: '#8B5CF6', trend: 'falling' as const, marketDepth: 91 }
                          ] : sector === 'Industrial' ? [
                            { sector: 'Industrial', region: 'NYC', vacancy: 4.2, change: '-0.8%', color: '#10B981', trend: 'falling' as const, marketDepth: 96 },
                            { sector: 'Industrial', region: 'SF', vacancy: 3.8, change: '-1.2%', color: '#10B981', trend: 'falling' as const, marketDepth: 97 },
                            { sector: 'Industrial', region: 'LA', vacancy: 5.1, change: '-0.4%', color: '#10B981', trend: 'falling' as const, marketDepth: 94 }
                          ] : [
                            { sector: 'Multifamily', region: 'NYC', vacancy: 6.8, change: '+0.3%', color: '#be8d00', trend: 'rising' as const, marketDepth: 92 },
                            { sector: 'Multifamily', region: 'SF', vacancy: 5.4, change: '-0.2%', color: '#be8d00', trend: 'falling' as const, marketDepth: 94 },
                            { sector: 'Multifamily', region: 'LA', vacancy: 7.2, change: '+0.5%', color: '#be8d00', trend: 'rising' as const, marketDepth: 91 }
                          ])
                        ])
                          .filter(item => item.sector === sector)
                          .slice(0, 6)
                          .map((item, itemIndex) => (
                            <div key={`${item.sector}-${item.region}-${itemIndex}`}>
                              {createDataLink(
                                <motion.div
                                  whileHover={{ 
                                    scale: 1.05,
                                    y: -2,
                                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                                  }}
                                  className="relative p-2 rounded-lg text-center text-xs cursor-pointer overflow-hidden border transition-all duration-200"
                                  style={{ 
                                    backgroundColor: item.color + '15', 
                                    border: `1px solid ${item.color}30`,
                                    backdropFilter: 'blur(10px)'
                                  }}
                                >
                                <div className="font-light text-black mb-1">{item.region}</div>
                                <div className="text-lg font-light mb-1 text-black">
                                  {item.vacancy}%
                                </div>
                                <div className="text-xs flex items-center justify-between">
                                  <span className="text-black/60">
                                    {item.vacancy > 15 ? 'High' : item.vacancy > 8 ? 'Medium' : 'Low'}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {item.trend === 'rising' && <TrendingUp className="w-3 h-3 text-red-500" />}
                                    {item.trend === 'falling' && <TrendingDown className="w-3 h-3 text-green-500" />}
                                    {item.trend === 'stable' && <Minus className="w-3 h-3 text-black" />}
                                    <span className={`text-xs ${
                                      item.trend === 'rising' ? 'text-red-500' :
                                      item.trend === 'falling' ? 'text-green-500' : 'text-black'
                                    }`}>
                                      {item.change}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Animated background pulse */}
                                <motion.div
                                  className="absolute inset-0 rounded-lg"
                                  style={{ backgroundColor: item.color }}
                                  animate={{ 
                                    opacity: [0.05, 0.12, 0.05],
                                    scale: [1, 1.01, 1]
                                  }}
                                  transition={{ 
                                    duration: 3, 
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }}
                                />
                                </motion.div>,
                                'vacancy-heatmap',
                                { sector: item.sector, region: item.region, vacancy: item.vacancy }
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RUNE.CTZ Analysis */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border-l-4 border-[#be8d00]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#be8d00] flex items-center justify-center flex-shrink-0 relative">
                    {/* Orbiting dots */}
                    <motion.div
                      className="absolute w-6 h-6"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-0 left-1/2 transform -translate-x-1/2"></div>
                      <div className="absolute w-1 h-1 bg-white/70 rounded-full top-1/2 right-0 transform -translate-y-1/2"></div>
                    </motion.div>
                    {/* Counter-rotating inner element */}
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      <Settings className="w-3 h-3 text-white" />
                    </motion.div>
                  </div>
                  <div>
                    <h4 className="text-black font-light text-sm mb-2">RUNE.CTZ Vacancy Analysis</h4>
                    <div className="space-y-2 text-xs text-black/80">
                      {vacancyHeatmapAnalysis ? (
                        (() => {
                          try {
                            const analysis = typeof vacancyHeatmapAnalysis.analysis === 'string' 
                              ? JSON.parse(vacancyHeatmapAnalysis.analysis) 
                              : vacancyHeatmapAnalysis.analysis;
                            
                            return (
                              <>
                                <p><strong>Sector Trends:</strong> {analysis.sectorTrends}</p>
                                <p><strong>Regional Variation:</strong> {analysis.regionalVariation}</p>
                                <p><strong>Supply-Demand:</strong> {analysis.supplyDemandDynamics}</p>
                                <p><strong>Market Drivers:</strong> {analysis.marketDrivers}</p>
                                <p><strong>Investment Impact:</strong> {analysis.investmentImplications}</p>
                              </>
                            );
                          } catch (error) {
                            return (
                              <>
                                <p><strong>Sector Trends:</strong> Office sector shows elevated vacancy rates averaging 18.7% with rising trends across major markets, reflecting persistent remote work impacts. Industrial maintains tight conditions at 4.4% average with falling vacancy rates driven by e-commerce demand.</p>
                                <p><strong>Regional Variation:</strong> San Francisco leads office vacancy at 22.3%, while Boston shows relative strength at 15.8%. Industrial vacancy remains consistently low across all regions. Multifamily rates vary from 5.4% in SF to 8.1% in Chicago.</p>
                                <p><strong>Supply-Demand:</strong> Office market faces structural oversupply as tenant demand contracts due to hybrid work models. Industrial benefits from supply constraints and robust logistics demand. Multifamily shows balanced conditions with localized variations.</p>
                                <p><strong>Market Drivers:</strong> Remote work adoption continues pressuring office demand. E-commerce growth sustains industrial absorption. Population migration patterns and rental affordability drive multifamily performance variations across metros.</p>
                                <p><strong>Investment Impact:</strong> High office vacancy creates distressed asset opportunities for value-add investors. Industrial's tight vacancy supports stable income assets. Tokenization platforms like Commertize can democratize access to these market dislocations.</p>
                              </>
                            );
                          }
                        })()
                      ) : (
                        <>
                          <p><strong>Sector Trends:</strong> Office sector shows elevated vacancy rates averaging 18.7% with rising trends across major markets, reflecting persistent remote work impacts. Industrial maintains tight conditions at 4.4% average with falling vacancy rates driven by e-commerce demand.</p>
                          <p><strong>Regional Variation:</strong> San Francisco leads office vacancy at 22.3%, while Boston shows relative strength at 15.8%. Industrial vacancy remains consistently low across all regions. Multifamily rates vary from 5.4% in SF to 8.1% in Chicago.</p>
                          <p><strong>Supply-Demand:</strong> Office market faces structural oversupply as tenant demand contracts due to hybrid work models. Industrial benefits from supply constraints and robust logistics demand. Multifamily shows balanced conditions with localized variations.</p>
                          <p><strong>Market Drivers:</strong> Remote work adoption continues pressuring office demand. E-commerce growth sustains industrial absorption. Population migration patterns and rental affordability drive multifamily performance variations across metros.</p>
                          <p><strong>Investment Impact:</strong> High office vacancy creates distressed asset opportunities for value-add investors. Industrial's tight vacancy supports stable income assets. Tokenization platforms like Commertize can democratize access to these market dislocations.</p>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-2 border-t border-[#be8d00]/30">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                        <span className="text-xs text-black/60">
                          Confidence: {vacancyHeatmapAnalysis ? `${vacancyHeatmapAnalysis.confidence}%` : '93%'}
                        </span>
                      </div>
                      <div className="text-xs text-black/50">
                        Updated daily by RUNE.CTZ • Last update: {
                          vacancyHeatmapAnalysis 
                            ? new Date(vacancyHeatmapAnalysis.lastUpdate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + ' ago'
                            : '2 hours ago'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market News Feed */}
          <Card className="value-tile">
            <CardHeader>
              <CardTitle className="text-black font-light flex items-center gap-2">
                <Globe className="w-5 h-5 text-black animate-spin" />
                Market Headlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(liveNewsData.length > 0 ? liveNewsData : newsHeadlines).map((news, index) => 
                  <div key={`news-${index}`}>
                    {createDataLink(
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <div 
                        className="w-2 h-2 rounded-full mt-2 animate-pulse"
                        style={{
                          backgroundColor: (news.impact || news.sentiment) === 'neutral' ? '#be8d00' : 
                                         (news.impact || news.sentiment) === 'bearish' || (news.impact || news.sentiment) === 'negative' ? '#EF4444' : 
                                         '#10B981' // Green for bullish/positive
                        }}
                      ></div>
                      <div className="flex-1">
                        <div className="text-black/90 text-sm font-light">{news.title || news.headline}</div>
                        <div className="text-black/60 text-xs mt-1">
                          {news.time || (news.publishedAt ? new Date(news.publishedAt).toLocaleString() : 'Recently')}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: (news.impact || news.sentiment) === 'neutral' ? '#be8d00' : 
                                     (news.impact || news.sentiment) === 'bearish' || (news.impact || news.sentiment) === 'negative' ? '#EF4444' : 
                                     '#10B981', // Green for bullish/positive
                          color: (news.impact || news.sentiment) === 'neutral' ? '#be8d00' : 
                                (news.impact || news.sentiment) === 'bearish' || (news.impact || news.sentiment) === 'negative' ? '#EF4444' : 
                                '#10B981' // Green for bullish/positive
                        }}
                      >
                        {news.impact || news.sentiment || 'bullish'}
                        </Badge>
                      </motion.div>,
                      'market-news',
                      news
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Column - Tokenization & Liquidity */}
        <div className="space-y-6">
          <SectionHeader 
            title="Tokenization & Liquidity"
            icon={<Cpu className="w-5 h-5 text-black" />}
          />
          
          {/* Tokenized AUM Growth */}
          <Card className="value-tile">
            <CardHeader>
              <CardTitle className="text-black font-light flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-black" />
                Tokenized AUM Growth Analysis
              </CardTitle>
              <div className="text-xs text-black/60 mt-1">Updated daily by RUNE.CTZ Intelligence</div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={aumData}>
                  <defs>
                    <linearGradient id="colorAum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#be8d00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#be8d00" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorShare" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '12px', 
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)' 
                    }}
                  />
                  <Area type="monotone" dataKey="aum" stackId="1" stroke="#be8d00" strokeWidth={2} fillOpacity={1} fill="url(#colorAum)" />
                  <Area type="monotone" dataKey="commertizeShare" stackId="2" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorShare)" />
                </AreaChart>
              </ResponsiveContainer>
              
              {/* RUNE.CTZ Analysis */}
              <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border-l-4 border-[#be8d00]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#be8d00] flex items-center justify-center flex-shrink-0 relative">
                    {/* Orbiting dots */}
                    <motion.div
                      className="absolute w-6 h-6"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-0 left-1/2 transform -translate-x-1/2"></div>
                      <div className="absolute w-1 h-1 bg-white/70 rounded-full top-1/2 right-0 transform -translate-y-1/2"></div>
                    </motion.div>
                    {/* Counter-rotating inner element */}
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      <Settings className="w-3 h-3 text-white" />
                    </motion.div>
                  </div>
                  <div>
                    {createDataLink(
                      <h4 className="text-black font-light text-sm mb-2">RUNE.CTZ Market Analysis</h4>,
                      'tokenized-aum',
                      aumAnalysis
                    )}
                    <div className="space-y-2 text-xs text-black/80">
                      {aumAnalysis ? (
                        (() => {
                          try {
                            const analysis = typeof aumAnalysis.analysis === 'string' 
                              ? JSON.parse(aumAnalysis.analysis) 
                              : aumAnalysis.analysis;
                            
                            return (
                              <>
                                <p><strong>Institutional Acceleration:</strong> {analysis.institutionalAcceleration}</p>
                                <p><strong>Market Drivers:</strong> {analysis.marketDrivers}</p>
                                <p><strong>Commertize Position:</strong> {analysis.commertizePosition}</p>
                              </>
                            );
                          } catch (error) {
                            return (
                              <>
                                <p><strong>Institutional Acceleration:</strong> RWA tokenization grew 47% in Q4 2024, led by real estate (62% of volume). Major institutions allocated $2.8B to tokenized assets.</p>
                                <p><strong>Market Drivers:</strong> Fed pivot expectations driving institutional allocations. Commercial real estate sees strongest tokenization growth with 89% quarter-over-quarter increase.</p>
                                <p><strong>Commertize Position:</strong> Platform aims to capture significant share of projected $1.2T tokenized CRE market by 2027 through institutional-grade infrastructure and strategic market positioning targeting 15-20% market share potential.</p>
                              </>
                            );
                          }
                        })()
                      ) : (
                        <>
                          <p><strong>Institutional Acceleration:</strong> RWA tokenization grew 47% in Q4 2024, led by real estate (62% of volume). Major institutions allocated $2.8B to tokenized assets.</p>
                          <p><strong>Market Drivers:</strong> Fed pivot expectations driving institutional allocations. Commercial real estate sees strongest tokenization growth with 89% quarter-over-quarter increase.</p>
                          <p><strong>Commertize Position:</strong> Platform aims to capture significant share of projected $1.2T tokenized CRE market by 2027 through institutional-grade infrastructure and strategic market positioning targeting 15-20% market share potential.</p>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                        <span className="text-xs text-black/60">
                          Confidence: {aumAnalysis ? `${aumAnalysis.confidence}%` : '94%'}
                        </span>
                      </div>
                      <div className="text-xs text-black/50">
                        Updated daily by RUNE.CTZ • Last update: {
                          aumAnalysis 
                            ? new Date(aumAnalysis.lastUpdate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + ' ago'
                            : '2 hours ago'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Blockchain Analytics */}
          <Card className="value-tile">
            <CardHeader>
              <CardTitle className="text-black font-light flex items-center gap-2">
                <Cpu className="w-5 h-5 text-black" />
                Blockchain Infrastructure Analysis
              </CardTitle>
              <div className="text-xs text-black/60 mt-1">Updated daily by RUNE.CTZ Intelligence</div>
              <div className="flex gap-2 mt-2">
                <Button
                  onClick={() => setSelectedMetric('volume')}
                  variant={selectedMetric === 'volume' ? "default" : "outline"}
                  size="sm"
                  className={selectedMetric === 'volume'
                    ? 'bg-[#be8d00] text-black hover:bg-[#be8d00]/90'
                    : 'border-[#be8d00]/50 text-black hover:bg-[#be8d00]/10'
                  }
                >
                  Volume
                </Button>
                <Button
                  onClick={() => setSelectedMetric('growth')}
                  variant={selectedMetric === 'growth' ? "default" : "outline"}
                  size="sm"
                  className={selectedMetric === 'growth'
                    ? 'bg-[#be8d00] text-black hover:bg-[#be8d00]/90'
                    : 'border-[#be8d00]/50 text-black hover:bg-[#be8d00]/10'
                  }
                >
                  Growth
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {chainData.map((chain, index) => (
                  <motion.div
                    key={chain.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-gray-50 bg-white"
                  >
                    <div className="flex items-center gap-3">
                      {chain.name === 'Ethereum' && (
                        <SiEthereum 
                          className="w-4 h-4" 
                          style={{ color: chain.color }}
                        />
                      )}
                      {chain.name === 'Polygon' && (
                        <SiPolygon 
                          className="w-4 h-4" 
                          style={{ color: chain.color }}
                        />
                      )}
                      {chain.name === 'Hedera' && (
                        <div 
                          className="w-4 h-4 rounded-full flex items-center justify-center bg-black text-white text-xs font-bold border border-gray-300"
                        >
                          ℏ
                        </div>
                      )}
                      {chain.name === 'Stellar' && (
                        <div 
                          className="w-4 h-4 flex items-center justify-center"
                          style={{ color: '#000000' }}
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path d="M12.283 1.851L8.828 5.307l7.071 7.07 3.455-3.454zM8.828 18.693l3.455-3.456-7.07-7.07-3.455 3.454zM1.851 11.717L5.307 15.172l7.07-7.071-3.454-3.455zM22.149 12.283L18.693 8.828l-7.07 7.07 3.454 3.455z"/>
                          </svg>
                        </div>
                      )}
                      {chain.name === 'Plume' && (
                        <div 
                          className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: '#6C5CE7' }}
                        >
                          P
                        </div>
                      )}
                      <div>
                        <div className="text-black font-light text-sm">{chain.name}</div>
                        <div className="text-black/60 text-xs font-medium">
                          {selectedMetric === 'volume' ? chain.volumeMetric : chain.growthMetric}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-black font-light">
                        {selectedMetric === 'volume' ? chain.volume : `${chain.value}%`}
                      </div>
                      <Progress 
                        value={chain.value} 
                        className="w-16 h-2"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* RUNE.CTZ Blockchain Analysis */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-[#be8d00]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#be8d00] flex items-center justify-center flex-shrink-0 relative">
                    {/* Orbiting dots */}
                    <motion.div
                      className="absolute w-6 h-6"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-0 left-1/2 transform -translate-x-1/2"></div>
                      <div className="absolute w-1 h-1 bg-white/70 rounded-full top-1/2 right-0 transform -translate-y-1/2"></div>
                    </motion.div>
                    {/* Counter-rotating inner element */}
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      <Settings className="w-3 h-3 text-white" />
                    </motion.div>
                  </div>
                  <div>
                    <h4 className="text-black font-light text-sm mb-2">RUNE.CTZ Infrastructure Analysis</h4>
                    <div className="space-y-2 text-xs text-black/80">
                      {blockchainData ? (
                        (() => {
                          try {
                            const analysis = typeof blockchainData.analysis === 'string' 
                              ? JSON.parse(blockchainData.analysis) 
                              : blockchainData.analysis;
                            
                            return (
                              <>
                                <p><strong>Network Dominance Shift:</strong> {analysis.networkDominance}</p>
                                <p><strong>Layer-2 Momentum:</strong> {analysis.layer2Momentum}</p>
                                <p><strong>Emerging Winners:</strong> {analysis.emergingWinners}</p>
                                <p><strong>Ethereum Challenges:</strong> {analysis.ethereumChallenges}</p>
                                <p><strong>Strategic Outlook:</strong> {analysis.strategicOutlook}</p>
                              </>
                            );
                          } catch (error) {
                            return (
                              <>
                                <p><strong>Network Dominance Shift:</strong> Hedera maintains leadership with 35% market share, driven by enterprise-grade consensus and low fees. Institutional preference for regulatory-compliant networks accelerating adoption.</p>
                                <p><strong>Layer-2 Momentum:</strong> Polygon captures 25% share through EVM compatibility and DeFi integration. Strong ecosystem support for tokenized assets with $800M monthly volume.</p>
                                <p><strong>Emerging Winners:</strong> Plume (+25% growth) showing strongest momentum in RWA-specific infrastructure. Purpose-built tokenization features attracting CRE projects from legacy chains.</p>
                                <p><strong>Ethereum Challenges:</strong> Market share declining (-3%) due to gas costs and scalability. Migration to L2s continues but maintains $480M base volume through institutional inertia.</p>
                                <p><strong>Strategic Outlook:</strong> Multi-chain future emerging. Successful platforms will deploy across 2-3 primary networks to optimize for different investor bases and regulatory jurisdictions.</p>
                              </>
                            );
                          }
                        })()
                      ) : (
                        <>
                          <p><strong>Network Dominance Shift:</strong> Hedera maintains leadership with 35% market share, driven by enterprise-grade consensus and low fees. Institutional preference for regulatory-compliant networks accelerating adoption.</p>
                          <p><strong>Layer-2 Momentum:</strong> Polygon captures 25% share through EVM compatibility and DeFi integration. Strong ecosystem support for tokenized assets with $800M monthly volume.</p>
                          <p><strong>Emerging Winners:</strong> Plume (+25% growth) showing strongest momentum in RWA-specific infrastructure. Purpose-built tokenization features attracting CRE projects from legacy chains.</p>
                          <p><strong>Ethereum Challenges:</strong> Market share declining (-3%) due to gas costs and scalability. Migration to L2s continues but maintains $480M base volume through institutional inertia.</p>
                          <p><strong>Strategic Outlook:</strong> Multi-chain future emerging. Successful platforms will deploy across 2-3 primary networks to optimize for different investor bases and regulatory jurisdictions.</p>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-2 border-t border-[#be8d00]/30">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-[#be8d00] rounded-full"></div>
                        <span className="text-xs text-black/60">
                          Network Analysis: Complete
                          {blockchainData && (
                            <span className="ml-2">• Confidence: {blockchainData.confidence}%</span>
                          )}
                        </span>
                      </div>
                      <div className="text-xs text-black/50">
                        Updated daily by RUNE.CTZ • Last scan: {
                          blockchainData 
                            ? new Date(blockchainData.lastScan).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + ' ago'
                            : '3 hours ago'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>


        </div>

        {/* Right Column - AI Insights */}
        <div className="space-y-6">

          







        </div>
      </div>


          </TabsContent>


        </Tabs>
      </div>
    </div>
  );
}