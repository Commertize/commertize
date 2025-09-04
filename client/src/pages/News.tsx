import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, TrendingUp, Loader2, ArrowRight, Newspaper, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useNewsArticles } from "../hooks/useNewsArticles";
import { MarketHeadline } from "../components/MarketHeadline";
import type { NewsArticle } from "../types/newsArticles";
import { Link } from "wouter";
import { RobustImage } from "@/components/RobustImage";

const News = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const { data: articles = [], isLoading } = useNewsArticles();

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
      <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-8 w-8 text-primary" />
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <MarketHeadline 
                title="Latest News"
                subtitle="Daily Insights on CRE, Tokenization, RWA, and Digital Assets."
                lastUpdated={articles[0]?.publishedAt}
              />

            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid gap-8"
          >
            {articles.length === 0 ? (
              <Card className="bg-card/50 backdrop-blur-sm border-0 shadow-2xl">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 mb-6 rounded-full bg-primary/10 flex items-center justify-center"
                  >
                    <Newspaper className="h-8 w-8 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-light text-foreground mb-2">No Articles Available</h3>
                  <p className="text-foreground text-center max-w-md font-light">
                    New articles are published daily. Check back soon for the latest insights on commercial real estate and tokenization.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {articles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                  >
                    <Link href={`/news-articles/${article.slug}`}>
                      <Card className="cursor-pointer hover:shadow-2xl transition-all duration-300 overflow-hidden bg-card/50 backdrop-blur-sm transform hover:scale-105 group border-border">
                        {/* Image Section */}
                        <div className="relative h-48 sm:h-56 md:h-48 w-full overflow-hidden bg-muted">
                          <RobustImage
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            fallbackText="Professional Content"
                            fallbackSubtext="Image refreshing soon"
                            articleId={article.id}
                          />
                          <div className="absolute top-4 left-4 flex items-center gap-2">
                            <Badge className={getCategoryColor(article.category)}>
                              {article.category}
                            </Badge>
                          </div>
                        </div>
                        
                        <CardHeader>
                          <CardTitle className="text-xl leading-tight line-clamp-2 font-light text-foreground group-hover:text-primary transition-colors duration-300">
                            {article.title}
                          </CardTitle>
                          <CardDescription className="text-base line-clamp-3 font-light text-foreground">
                            {article.summary}
                          </CardDescription>
                          <div className="flex items-center gap-4 text-sm text-foreground mt-4 font-light">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-primary" />
                              {new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-primary" />
                              {article.readTime} min read
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default News;