import { useQuery } from '@tanstack/react-query';

interface DQIMetric {
  name: string;
  score: number;
  weight: number;
  description: string;
  details: string[];
  sourceUrl: string;
  lastUpdated: string;
  drivers: string[];
  improvements: string[];
}

interface DQIAnalysis {
  propertyId: string;
  propertyName: string;
  overallScore: number;
  rating: 'Excellent' | 'Good' | 'Fair' | 'Below Average' | 'Poor';
  band: string;
  drivers: string[];
  improvements: string[];
  metrics: DQIMetric[];
  safeguards: {
    hardFails: string[];
    warnings: string[];
  };
  governance: {
    peerRank: string;
    confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    backtestedAccuracy: number;
  };
  correlationData: {
    historicalPerformance: string;
    investorDecisionTime: string;
  };
  runeAnalysis: string;
  timestamp: string;
}

export function useDealQualityIndex(propertyId: string) {
  return useQuery({
    queryKey: ['deal-quality-index', propertyId],
    queryFn: async (): Promise<DQIAnalysis> => {
      const response = await fetch(`/api/deal-quality-index/${propertyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Deal Quality Index');
      }
      const result = await response.json();
      return result.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}