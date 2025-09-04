import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, ArrowRight, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { RobustImage } from "@/components/RobustImage";

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  readTime: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  aiGenerated: string;
}

const LatestNews = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const { data: articles, isLoading } = useQuery({
    queryKey: ["latest-news", 6],
    queryFn: async () => {
      const response = await fetch("/api/news-articles?limit=6");
      if (!response.ok) {
        throw new Error("Failed to fetch news articles");
      }
      const data = await response.json();
      return data.data as NewsArticle[];
    }
  });

  // Auto-advance carousel every 4 seconds
  useEffect(() => {
    if (!isAutoPlaying || !articles || articles.length <= 3) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = articles.length - 3;
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, articles]);

  const nextSlide = () => {
    if (!articles || articles.length <= 3) return;
    setCurrentIndex((prev) => {
      const maxIndex = articles.length - 3;
      return prev >= maxIndex ? 0 : prev + 1;
    });
  };

  const prevSlide = () => {
    if (!articles || articles.length <= 3) return;
    setCurrentIndex((prev) => {
      const maxIndex = articles.length - 3;
      return prev <= 0 ? maxIndex : prev - 1;
    });
  };

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'CRE': 'bg-blue-100 text-blue-700',
      'Tokenization': 'bg-purple-100 text-purple-700',
      'RWA': 'bg-green-100 text-green-700',
      'Crypto': 'bg-orange-100 text-orange-700',
      'Digital Assets': 'bg-cyan-100 text-cyan-700',
      'Regulation': 'bg-red-100 text-red-700',
      'Technology': 'bg-indigo-100 text-indigo-700',
      'Markets': 'bg-yellow-100 text-yellow-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50/50 to-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_#be8d00_1px,_transparent_0)] bg-[length:32px_32px]"></div>
      </div>
      
      <div className="container relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="relative h-12 sm:h-16 md:h-20 flex items-center overflow-hidden mb-4 sm:mb-6">
              <motion.div
                animate={{ x: [-800, 0] }}
                transition={{
                  duration: 16,
                  repeat: Infinity,
                  ease: "linear",
                  repeatType: "loop"
                }}
                className="flex items-center space-x-24"
                style={{ minWidth: "1600px" }}
              >
                {/* Multiple complete sets to ensure seamless looping */}
                {["Latest News & Insights", "Latest News & Insights", 
                  "Latest News & Insights", "Latest News & Insights"].map((text, index) => (
                  <motion.h2 
                    key={`${text}-${index}`}
                    className="text-4xl md:text-5xl font-logo font-light text-black flex-shrink-0"
                    style={{ minWidth: "400px", textAlign: "center" }}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                  >
                    Latest News & <span className="text-primary">Insights</span>
                  </motion.h2>
                ))}
              </motion.div>
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-yellow-600 rounded-full mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 font-logo font-light max-w-3xl mx-auto">
              Stay informed with the latest developments in commercial real estate, tokenization, and market intelligence
            </p>
          </motion.div>

          {/* Articles Carousel */}
          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border-2 border-[#d4a017] overflow-hidden">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
                    <div className="h-20 bg-gray-200 animate-pulse rounded"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-20"></div>
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : articles && articles.length > 0 ? (
            <div 
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* Carousel Container */}
              <div className="overflow-hidden">
                <motion.div
                  className="flex transition-transform duration-700 ease-in-out"
                  animate={{ 
                    x: `-${currentIndex * (100 / 3)}%` 
                  }}
                  transition={{ 
                    duration: 0.7, 
                    ease: [0.25, 0.46, 0.45, 0.94] 
                  }}
                >
                  {articles.map((article, index) => (
                    <motion.article
                      key={article.id}
                      className="w-full md:w-1/3 flex-shrink-0 px-4"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: (index % 3) * 0.1, ease: "easeOut" }}
                      viewport={{ once: true }}
                    >
                      <div className="bg-white rounded-2xl shadow-sm border-2 border-[#d4a017] overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                        <Link href={`/news/${article.slug}`}>
                          <div className="cursor-pointer h-full flex flex-col">
                            {/* Article Image */}
                            <div className="relative h-48 overflow-hidden flex-shrink-0">
                              <RobustImage
                                src={article.imageUrl}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                fallbackText="Latest News"
                                fallbackSubtext="Professional Content"
                                articleId={article.id}
                              />
                              {/* Category Badge */}
                              <div className="absolute top-4 left-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                                  {article.category}
                                </span>
                              </div>
                              {/* Auto-play indicator */}
                              {isAutoPlaying && articles.length > 3 && (
                                <div className="absolute top-4 right-4">
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Article Content */}
                            <div className="p-6 flex-grow flex flex-col">
                              <h3 className="text-lg font-logo font-light text-black mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-200">
                                {article.title}
                              </h3>
                              
                              <p className="text-gray-600 font-logo font-light text-sm mb-4 line-clamp-3 flex-grow">
                                {article.summary}
                              </p>

                              {/* Article Meta */}
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                <div className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock size={12} />
                                  <span>{article.readTime} min</span>
                                </div>
                              </div>

                              {/* Read More */}
                              <div className="flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all duration-200 mt-auto">
                                <span>Read More</span>
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              </div>

              {/* Navigation Controls */}
              {articles.length > 3 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-all duration-200 group z-10"
                    aria-label="Previous articles"
                  >
                    <ChevronLeft size={20} className="text-gray-600 group-hover:text-primary transition-colors" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-all duration-200 group z-10"
                    aria-label="Next articles"
                  >
                    <ChevronRight size={20} className="text-gray-600 group-hover:text-primary transition-colors" />
                  </button>
                </>
              )}

              {/* Carousel Indicators */}
              {articles.length > 3 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: articles.length - 2 }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentIndex 
                          ? 'bg-primary w-8' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              viewport={{ once: true }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-yellow-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <TrendingUp size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-logo font-light text-black mb-2">
                No articles available yet
              </h3>
              <p className="text-gray-600 font-logo font-light">
                Check back soon for the latest insights and market updates
              </p>
            </motion.div>
          )}

          {/* View All News Link */}
          {articles && articles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Link href="/news">
                <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-yellow-600 text-white rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                  <span>View All News & Insights</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LatestNews;