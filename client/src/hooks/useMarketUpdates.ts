import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MarketUpdate, MarketUpdateFilters, GenerateUpdateRequest, RuneMarketQuestion } from '../types/marketUpdates';

const API_BASE = '/api/market-updates';

// Fetch market updates list
export function useMarketUpdates(filters?: MarketUpdateFilters) {
  return useQuery({
    queryKey: [API_BASE, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.tags?.length) {
        filters.tags.forEach(tag => params.append('tags', tag));
      }
      
      const url = `${API_BASE}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch market updates');
      }
      
      const data = await response.json();
      return data.data as MarketUpdate[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch single market update
export function useMarketUpdate(id: string) {
  return useQuery({
    queryKey: [API_BASE, id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch market update');
      }
      
      const data = await response.json();
      return data.data as MarketUpdate;
    },
    enabled: !!id,
  });
}

// Alias for detail page
export const useMarketUpdateDetail = useMarketUpdate;

// Generate new market update
export function useGenerateMarketUpdate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (request: GenerateUpdateRequest) => {
      const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate market update');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch market updates
      queryClient.invalidateQueries({ queryKey: [API_BASE] });
    },
  });
}

// Publish market update
export function usePublishMarketUpdate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to publish market update');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_BASE] });
    },
  });
}

// Ask RUNE.CTZ about market update
export function useRuneMarketQuestion() {
  return useMutation({
    mutationFn: async ({ question, updateId }: RuneMarketQuestion) => {
      const response = await fetch(`${API_BASE}/${updateId}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get answer');
      }
      
      const data = await response.json();
      return {
        answer: data.answer,
        disclaimer: data.disclaimer,
      };
    },
  });
}