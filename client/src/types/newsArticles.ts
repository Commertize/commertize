export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: 'CRE' | 'Tokenization' | 'RWA' | 'Crypto' | 'Digital Assets' | 'Regulation' | 'Technology' | 'Markets';
  tags: string[];
  imageUrl?: string;
  readTime: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  aiGenerated: string;
}

export interface NewsArticleFilters {
  category?: string;
  limit?: number;
  tags?: string[];
}

export interface GenerateNewsRequest {
  category: string;
  tags?: string[];
}