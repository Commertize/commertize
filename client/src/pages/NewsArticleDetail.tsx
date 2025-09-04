import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Share2, Clock, Calendar } from "lucide-react";
import { useNewsArticle } from "../hooks/useNewsArticles";
import { MarketHeadline } from "../components/MarketHeadline";
import { Link } from "wouter";
import { RobustImage } from "@/components/RobustImage";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function NewsArticleDetail() {
  const { identifier } = useParams();
  const { data: article, isLoading } = useNewsArticle(identifier || '');
  const { toast } = useToast();

  const handleShare = async () => {
    if (!article) return;

    const shareData = {
      title: article.title,
      text: article.summary,
      url: window.location.href
    };

    try {
      // Use Web Share API if available (mobile devices and some browsers)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast({
          title: "Article shared successfully",
          description: "Thank you for sharing this article!"
        });
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied to clipboard",
          description: "You can now paste this link anywhere to share the article."
        });
      }
    } catch (error: any) {
      // If both methods fail, show the URL in a fallback way
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error);
        toast({
          title: "Share URL",
          description: window.location.href,
          duration: 10000
        });
      }
    }
  };

  // Update meta tags for SEO
  useEffect(() => {
    if (article) {
      const siteDomain = window.location.origin;
      const articleUrl = `${siteDomain}/news-articles/${article.slug}`;
      const imageUrl = article.imageUrl ? `${siteDomain}${article.imageUrl}` : `${siteDomain}/logo.png`;
      const plainTextContent = article.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      const metaDescription = article.summary || plainTextContent.substring(0, 160) + '...';

      // Update document title
      document.title = `${article.title} | Commertize Intelligence`;

      // Update or create meta tags
      const updateMetaTag = (name: string, content: string, property = false) => {
        const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
        let meta = document.querySelector(selector) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          if (property) {
            meta.setAttribute('property', name);
          } else {
            meta.setAttribute('name', name);
          }
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      // Primary meta tags
      updateMetaTag('description', metaDescription);
      updateMetaTag('keywords', `${article.tags.join(', ')}, commercial real estate, tokenization, fractional ownership, RWA, real world assets`);
      updateMetaTag('author', 'Commertize Intelligence');

      // Open Graph tags
      updateMetaTag('og:type', 'article', true);
      updateMetaTag('og:url', articleUrl, true);
      updateMetaTag('og:title', article.title, true);
      updateMetaTag('og:description', metaDescription, true);
      updateMetaTag('og:image', imageUrl, true);
      updateMetaTag('og:site_name', 'Commertize', true);
      updateMetaTag('article:published_time', new Date(article.publishedAt || article.createdAt).toISOString(), true);
      updateMetaTag('article:modified_time', new Date(article.updatedAt).toISOString(), true);
      updateMetaTag('article:section', article.category, true);

      // Twitter Card tags
      updateMetaTag('twitter:card', 'summary_large_image', true);
      updateMetaTag('twitter:url', articleUrl, true);
      updateMetaTag('twitter:title', article.title, true);
      updateMetaTag('twitter:description', metaDescription, true);
      updateMetaTag('twitter:image', imageUrl, true);
      updateMetaTag('twitter:creator', '@CommertizeRE', true);

      // Canonical URL
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', articleUrl);

      // Add structured data
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": article.title,
        "description": metaDescription,
        "image": imageUrl,
        "datePublished": new Date(article.publishedAt || article.createdAt).toISOString(),
        "dateModified": new Date(article.updatedAt).toISOString(),
        "author": {
          "@type": "Organization",
          "name": "Commertize Intelligence",
          "url": "https://commertize.com"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Commertize",
          "logo": {
            "@type": "ImageObject",
            "url": `${siteDomain}/logo.png`
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": articleUrl
        },
        "keywords": article.tags.join(', '),
        "articleSection": article.category,
        "wordCount": plainTextContent.split(' ').length
      };

      // Remove existing structured data
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Add new structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    // Cleanup function to reset meta tags when component unmounts
    return () => {
      document.title = 'Commertize - Tokenized Commercial Real Estate Investment';
    };
  }, [article]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'CRE': 'bg-blue-100 text-blue-800 border-blue-200',
      'Tokenization': 'bg-purple-100 text-purple-800 border-purple-200',
      'RWA': 'bg-green-100 text-green-800 border-green-200',
      'Crypto': 'bg-orange-100 text-orange-800 border-orange-200',
      'Digital Assets': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Regulation': 'bg-red-100 text-red-800 border-red-200',
      'Technology': 'bg-teal-100 text-teal-800 border-teal-200',
      'Markets': 'bg-primary/10 text-primary border-primary/30'
    };
    return colors[category] || 'bg-muted text-muted-foreground border-border';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-light text-foreground mb-4">Article Not Found</h1>
          <Link href="/news">
            <Button variant="outline" className="font-light">
              <ArrowLeft size={16} className="mr-2" />
              Back to News
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-8">
      <div className="max-w-4xl mx-auto p-6">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/news">
            <Button variant="outline" size="sm" className="font-light">
              <ArrowLeft size={16} className="mr-2" />
              Back to News
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            className="font-light hover:bg-primary/10 hover:border-primary transition-colors" 
            onClick={handleShare}
          >
            <Share2 size={16} className="mr-2" />
            Share
          </Button>
        </div>
        <div className="space-y-6">
          <Card className="bg-card/95 backdrop-blur-sm border-2 border-primary/30 shadow-2xl shadow-primary/10 ring-1 ring-primary/20">
            <CardHeader className="relative">
              {/* Decorative gold corner elements */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary"></div>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Badge className={`${getCategoryColor(article.category)} ring-1 ring-primary/20`}>
                    {article.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-foreground font-light">
                  <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
                    <Clock size={14} className="text-primary" />
                    {article.readTime} min read
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
                    <Calendar size={14} className="text-primary" />
                    {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <CardTitle className="text-3xl md:text-4xl font-light text-foreground mb-6 leading-tight relative">
                <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-1 h-16 bg-gradient-to-b from-primary to-primary/60"></div>
                {article.title}
              </CardTitle>
              
              <p className="text-foreground font-light text-lg leading-relaxed bg-primary/5 p-4 rounded-lg border-l-4 border-primary">
                {article.summary}
              </p>
              
              {/* Article Image */}
              {article.imageUrl && (
                <div className="mt-8 relative">
                  <div className="relative overflow-hidden rounded-lg shadow-lg border border-primary/20">
                    <RobustImage
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-64 md:h-80 object-cover"
                      fallbackText="Article Image"
                      fallbackSubtext="Visual content"
                      articleId={article.id}
                    />
                    {/* Image overlay for better text readability if needed */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
                  </div>
                </div>
              )}
            </CardHeader>
            
            <CardContent className="relative">
              {/* Subtle gold accent line */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              
              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8 pt-4">
                  {article.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="font-light bg-primary/10 text-foreground border border-primary/20 hover:bg-primary/20 transition-colors">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Article Content */}
              <div className="relative">
                <div className="absolute -left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-primary/30 to-transparent"></div>
                <div 
                  className="prose prose-lg max-w-none pl-4
                           prose-headings:text-foreground prose-headings:font-light
                           prose-p:text-foreground prose-p:font-light prose-p:leading-relaxed prose-p:mb-6
                           prose-strong:text-foreground prose-strong:font-medium
                           prose-li:text-foreground prose-li:font-light
                           prose-blockquote:text-foreground prose-blockquote:font-light prose-blockquote:border-primary/50 prose-blockquote:bg-primary/5 prose-blockquote:pl-6 prose-blockquote:py-2
                           prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
                           prose-h1:text-foreground prose-h1:font-light prose-h1:border-b prose-h1:border-primary/20 prose-h1:pb-2
                           prose-h2:text-foreground prose-h2:font-light prose-h2:border-b prose-h2:border-primary/20 prose-h2:pb-2
                           prose-h3:text-foreground prose-h3:font-light
                           prose-ul:text-foreground prose-ol:text-foreground
                           prose-hr:border-primary/30
                           text-foreground font-light leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </div>

              {/* Enhanced Footer */}
              <div className="mt-12 pt-8 border-t border-primary/20 bg-primary/5 -mx-6 px-6 pb-6 rounded-b-lg">
                <div className="text-center">
                  <div className="w-16 h-px bg-primary mx-auto mb-4"></div>
                  <div className="text-sm text-foreground font-light">
                    Information is for educational purposes and should not be considered financial advice.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}