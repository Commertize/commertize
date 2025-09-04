export interface MarketUpdate {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  title: string;
  summary: string;
  metrics: Record<string, number | string>;
  chart?: {
    labels: string[];
    series: Array<{
      name: string;
      data: number[];
    }>;
  };
  sections: Array<{
    heading: string;
    body: string;
    bullets?: string[];
    citations?: string[];
  }>;
  tags: string[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MarketUpdateFilters {
  type?: 'daily' | 'weekly' | 'monthly';
  tags?: string[];
  limit?: number;
}

export interface GenerateUpdateRequest {
  type: 'daily' | 'weekly' | 'monthly';
  force?: boolean;
  focus?: string[];
}

export interface RuneMarketQuestion {
  question: string;
  updateId: string;
}