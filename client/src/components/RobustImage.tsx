import { useState, useCallback, useEffect } from 'react';
import { Newspaper } from 'lucide-react';

interface RobustImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackText?: string;
  fallbackSubtext?: string;
  fallbackSrc?: string;
  articleId?: string;
  onError?: () => void;
}

export function RobustImage({ 
  src, 
  alt, 
  className = "", 
  fallbackText = "Professional Content",
  fallbackSubtext = "Image unavailable",
  fallbackSrc,
  articleId,
  onError
}: RobustImageProps) {
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [fallbackImageSrc, setFallbackImageSrc] = useState<string | null>(null);
  const [forcedFallback, setForcedFallback] = useState<string | null>(null);
  const [isLoadingFallback, setIsLoadingFallback] = useState(false);
  const maxRetries = 2;

  const handleImageError = useCallback(async () => {
    console.log(`Image failed to load (attempt ${retryCount + 1}):`, src);
    
    if (retryCount < maxRetries) {
      // Retry loading the image with a slight delay
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, 1000);
    } else {
      // Max retries reached, try to use provided fallbackSrc or get a fallback image
      if (fallbackSrc) {
        setFallbackImageSrc(fallbackSrc);
      } else {
        try {
          // Try DALL-E generated fallback first for news articles
          if (articleId) {
            setFallbackImageSrc('/generated-images/fallback-news-dalle.jpg');
          } else {
            const fallbackUrl = `/api/fallback-image`;
            const response = await fetch(fallbackUrl);
            const data = await response.json();
            if (data.exists && data.url) {
              setFallbackImageSrc(data.url);
            } else {
              setFallbackImageSrc('/generated-images/fallback-news-dalle.jpg');
            }
          }
        } catch {
          setFallbackImageSrc('/generated-images/fallback-news-dalle.jpg');
        }
      }
      onError?.();
    }
  }, [src, retryCount, maxRetries, fallbackSrc, onError, articleId]);

  // Reset error state when src changes
  useEffect(() => {
    if (src) {
      setImageError(false);
      setRetryCount(0);
      setFallbackImageSrc(null);
      setForcedFallback(null);
    }
  }, [src]);

  // Fetch emergency fallback when image fails completely
  useEffect(() => {
    if ((!src || imageError) && !fallbackImageSrc && !forcedFallback && !isLoadingFallback) {
      setIsLoadingFallback(true);
      
      const getFallbackImage = async () => {
        try {
          // Use DALL-E generated fallback for articles
          setForcedFallback('/generated-images/fallback-news-dalle.jpg');
        } catch {
          // Professional gradient as absolute fallback
          setForcedFallback('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzFmMjkzNztzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3R5bGU9InN0b3AtY29sb3I6IzM3NDE1MTtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM2YjcyODA7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmFkKSIgLz48Y2lyY2xlIGN4PSI4MDAiIGN5PSIyMDAiIHI9IjE1MCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiAvPjxjaXJjbGUgY3g9IjIwMCIgY3k9IjgwMCIgcj0iMjAwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiAvPjx0ZXh0IHg9IjUxMiIgeT0iNDUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZENzAwIiBmb250LXNpemU9IjQ4IiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5DT01NRVJUSV9FPC90ZXh0Pjx0ZXh0IHg9IjUxMiIgeT0iNTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuOSkiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiI+Q29tbWVyY2lhbCBSZWFsIEVzdGF0ZSBUb2tlbml6YXRpb248L3RleHQ+PHJlY3QgeD0iNDEyIiB5PSI1NTAiIHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSJyZ2JhKDI1NSwyMTUsMCwwLjMpIiBzdHJva2U9IiNGRkQ3MDAiIHN0cm9rZS13aWR0aD0iNCIgLz48L3N2Zz4=');
        } finally {
          setIsLoadingFallback(false);
        }
      };
      
      getFallbackImage();
    }
  }, [src, imageError, articleId, forcedFallback, isLoadingFallback, fallbackImageSrc]);

  // If we have a fallback image, show it
  if (fallbackImageSrc) {
    return (
      <img 
        src={fallbackImageSrc}
        alt={alt}
        className={className}
        loading="lazy"
        onError={() => setImageError(true)}
      />
    );
  }

  // If we have a forced fallback (professional image), show it
  if (forcedFallback) {
    return (
      <img 
        src={forcedFallback}
        alt={alt}
        className={className}
        loading="lazy"
        onError={() => {
          // Last resort professional gradient
          setForcedFallback('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzFmMjkzNztzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3R5bGU9InN0b3AtY29sb3I6IzM3NDE1MTtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM2YjcyODA7c3RvcC1vcGFjaXR5OjEiIC0+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmFkKSIgLz48dGV4dCB4PSI1MTIiIHk9IjUxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0ZGRDcwMCIgZm9udC1zaXplPSI0OCIgZm9udC1mYW1pbHk9IkFyaWFsIj5DT01NRVJUSV9FPC90ZXh0Pjwvc3ZnPg==');
        }}
      />
    );
  }

  // If no src provided or error after retries, show professional loading state
  if (!src || imageError) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="w-6 h-6 mx-auto mb-2 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Normalize the src URL
  const normalizedSrc = src?.startsWith('http') ? src : src;
  
  return (
    <img 
      src={retryCount > 0 ? `${normalizedSrc}?retry=${retryCount}` : normalizedSrc}
      alt={alt}
      className={className}
      onError={handleImageError}
      loading="lazy"
    />
  );
}