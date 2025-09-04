import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, TrendingUp, Loader2, ArrowLeft, Share2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
// Using REST API instead of Firebase direct access
import type { NewsArticle } from "@/components/AdminNews";
import { useToast } from "@/hooks/use-toast";
import { RobustImage } from "@/components/RobustImage";

const NewsArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["news-article", id],
    queryFn: async () => {
      if (!id) throw new Error("Article ID is required");
      
      const response = await fetch(`/api/news-articles/${id}`);
      if (!response.ok) {
        throw new Error("Article not found");
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch article");
      }
      
      return result.data as NewsArticle;
    },
    enabled: !!id,
  });

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.description,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Article link has been copied to your clipboard.",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to copy link to clipboard.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen w-full bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 text-center">
              <CardContent>
                <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
                <p className="text-muted-foreground mb-6">
                  The article you're looking for doesn't exist or has been removed.
                </p>
                <Button onClick={() => setLocation("/news")} variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to News
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <div className="mb-6 md:mb-8">
            <Button 
              onClick={() => setLocation("/news")} 
              variant="ghost" 
              className="mb-4 font-light text-foreground hover:text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to News
            </Button>
          </div>

          {/* Article */}
          <Card className={`bg-card/50 backdrop-blur-sm border-0 shadow-2xl ${article.featured ? 'ring-2 ring-primary/20' : ''}`}>
            {/* Article Image - Full Width */}
            <div className="relative h-48 sm:h-64 md:h-80 w-full overflow-hidden rounded-t-lg bg-muted">
              <RobustImage
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
                fallbackText="Article Image"
                fallbackSubtext="Content loading"
                articleId={article.id}
              />
              {/* Overlay badges on image */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <Badge className="bg-primary text-primary-foreground">
                  {article.category}
                </Badge>
                {article.featured && (
                  <Badge variant="outline" className="text-primary border-primary bg-background/90">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {(article as any).aiGenerated === 'true' && (
                  <Badge variant="outline" className="text-primary border-primary/30 bg-background/90">
                    <div className="relative mr-1">
                      <div className="w-2 h-1.5 bg-primary rounded-sm animate-pulse"></div>
                      <div className="absolute inset-0 w-2 h-1.5 bg-primary/50 rounded-sm animate-ping"></div>
                    </div>
                    AI
                  </Badge>
                )}
              </div>
              {/* Share button on image */}
              <div className="absolute top-4 right-4">
                <Button onClick={handleShare} variant="outline" size="sm" className="bg-background/90 backdrop-blur-sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <CardHeader className="px-6 md:px-8 py-6 md:py-8">
              {/* Badges for articles without images */}
              {(!article.imageUrl || !article.imageUrl.trim()) && (
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-primary text-primary-foreground">
                      {article.category}
                    </Badge>
                    {article.featured && (
                      <Badge variant="outline" className="text-primary border-primary">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}

                  </div>
                  <Button onClick={handleShare} variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <CardTitle className="text-2xl md:text-3xl lg:text-4xl leading-tight mb-4 md:mb-6 font-light text-foreground">
                {article.title}
              </CardTitle>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-foreground font-light">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  {article.createdAt.toDate().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  {article.readTime}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="px-6 md:px-8 pb-8 md:pb-10">
              {/* Article Summary/Description */}
              <div className="text-lg md:text-xl leading-relaxed text-foreground mb-8 md:mb-10 pb-6 md:pb-8 border-b border-border/50 font-light">
                {article.description}
              </div>
              
              {/* Article Content */}
              <div 
                className="prose prose-lg md:prose-xl max-w-none 
                         prose-headings:text-foreground prose-headings:font-light
                         prose-p:text-foreground prose-p:font-light prose-p:leading-relaxed
                         prose-strong:text-foreground prose-strong:font-medium
                         prose-li:text-foreground prose-li:font-light
                         prose-blockquote:text-foreground prose-blockquote:font-light prose-blockquote:border-primary/30
                         prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                         prose-h1:text-foreground prose-h1:font-light prose-h1:text-2xl md:prose-h1:text-3xl prose-h1:mb-6
                         prose-h2:text-foreground prose-h2:font-light prose-h2:text-xl md:prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8
                         prose-h3:text-foreground prose-h3:font-light prose-h3:text-lg md:prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6
                         prose-p:mb-4 prose-p:mt-0
                         prose-ul:text-foreground prose-ol:text-foreground prose-ul:mb-6 prose-ol:mb-6
                         text-foreground font-light"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </CardContent>
          </Card>

          {/* Navigation Footer */}
          <div className="mt-8 md:mt-12 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button 
              onClick={() => setLocation("/news")} 
              variant="outline"
              className="font-light text-foreground hover:text-primary w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              More Articles
            </Button>
            
            <Button 
              onClick={handleShare} 
              variant="outline" 
              className="font-light text-foreground hover:text-primary w-full sm:w-auto"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Article
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsArticlePage;