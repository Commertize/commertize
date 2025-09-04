import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NewsArticle, NewsArticleFilters, GenerateNewsRequest } from '../types/newsArticles';

const API_BASE = '/api/news-articles';

// Fetch news articles list
export function useNewsArticles(filters?: NewsArticleFilters) {
  return useQuery({
    queryKey: [API_BASE, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.tags?.length) {
        filters.tags.forEach(tag => params.append('tags', tag));
      }
      
      const url = `${API_BASE}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch news articles');
      }
      
      const data = await response.json();
      return data.data as NewsArticle[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch single news article
export function useNewsArticle(identifier: string) {
  return useQuery({
    queryKey: [API_BASE, identifier],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/${identifier}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch news article');
      }
      
      const data = await response.json();
      return data.data as NewsArticle;
    },
    enabled: !!identifier,
  });
}

// Generate new news article
export function useGenerateNewsArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (request: GenerateNewsRequest) => {
      const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate news article');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch news articles
      queryClient.invalidateQueries({ queryKey: [API_BASE] });
    },
  });
}

// Admin: Generate single news article
export function useGenerateSingleNews() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (category?: string) => {
      const response = await fetch(`/api/admin/news-articles/generate-single`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate news article');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch news articles
      queryClient.invalidateQueries({ queryKey: [API_BASE] });
    },
  });
}

// Admin: Generate weekly news articles (keep for manual admin use)
export function useGenerateWeeklyNews() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/news-articles/generate-weekly`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate weekly news');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch news articles
      queryClient.invalidateQueries({ queryKey: [API_BASE] });
    },
  });
}