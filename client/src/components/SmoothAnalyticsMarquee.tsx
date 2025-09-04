import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign,
  Building2,
  Users,
  Zap,
  Globe
} from "lucide-react";

interface AnalyticsMetric {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "neutral";
  type: "currency" | "percentage" | "number" | "text";
  icon: React.ComponentType<any>;
  color: string;
}

export function SmoothAnalyticsMarquee() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Enhanced analytics metrics with smooth scrolling data
  const analyticsMetrics: AnalyticsMetric[] = useMemo(() => [
    {
      id: "total-investments",
      label: "Total Investments",
      value: "$47.2M",
      delta: "+12.4%",
      trend: "up",
      type: "currency",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      id: "active-properties",
      label: "Active Properties",
      value: "23",
      delta: "+3 this week",
      trend: "up",
      type: "number",
      icon: Building2,
      color: "text-yellow-600"
    },
    {
      id: "investor-count",
      label: "Total Investors",
      value: "1,247",
      delta: "+89 this month",
      trend: "up",
      type: "number",
      icon: Users,
      color: "text-blue-600"
    },
    {
      id: "tokenization-rate",
      label: "Tokenization Rate",
      value: "94.2%",
      delta: "+5.1%",
      trend: "up",
      type: "percentage",
      icon: Zap,
      color: "text-purple-600"
    },
    {
      id: "average-roi",
      label: "Average ROI",
      value: "12.8%",
      delta: "+0.8%",
      trend: "up",
      type: "percentage",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      id: "market-coverage",
      label: "Market Coverage",
      value: "Global",
      delta: "24/7 Active",
      trend: "neutral",
      type: "text",
      icon: Globe,
      color: "text-indigo-600"
    },
    {
      id: "processing-speed",
      label: "Processing Speed",
      value: "2.3s",
      delta: "Real-time",
      trend: "up",
      type: "text",
      icon: Activity,
      color: "text-emerald-600"
    },
    {
      id: "compliance-score",
      label: "Compliance Score",
      value: "98.7%",
      delta: "Excellent",
      trend: "up",
      type: "percentage",
      icon: TrendingUp,
      color: "text-green-600"
    }
  ], []);

  // Duplicate metrics for seamless scrolling
  const duplicatedMetrics = [...analyticsMetrics, ...analyticsMetrics];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    
    if (scrollWidth <= clientWidth) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame
    
    const animate = () => {
      if (!isPaused) {
        scrollPosition += scrollSpeed;
        
        // Reset when we've scrolled past half the content (since we duplicated it)
        if (scrollPosition >= scrollWidth / 2) {
          scrollPosition = 0;
        }
        
        container.scrollLeft = scrollPosition;
      }
      
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPaused]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-black">Live Analytics Feed</h3>
          <p className="text-sm text-gray-600">Real-time platform performance metrics</p>
        </div>
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          Live
        </Badge>
      </div>
      
      <div 
        className="relative overflow-hidden bg-gradient-to-r from-yellow-50 via-white to-yellow-50 rounded-xl border border-yellow-200 p-4"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          ref={containerRef}
          className="flex gap-6 overflow-hidden"
          style={{ scrollBehavior: 'auto' }}
        >
          {duplicatedMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            
            return (
              <Card 
                key={`${metric.id}-${index}`}
                className="flex-shrink-0 w-64 bg-white shadow-sm hover:shadow-md transition-all duration-200 border-yellow-100"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className={`w-5 h-5 ${metric.color}`} />
                      <span className="text-sm font-medium text-gray-700">
                        {metric.label}
                      </span>
                    </div>
                    {getTrendIcon(metric.trend)}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-black">
                      {metric.value}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-medium ${
                        metric.trend === "up" ? "text-green-600" : 
                        metric.trend === "down" ? "text-red-600" : 
                        "text-gray-600"
                      }`}>
                        {metric.delta}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Gradient overlays for smooth edges */}
        <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-yellow-50 to-transparent pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-yellow-50 to-transparent pointer-events-none"></div>
      </div>
      
      <div className="mt-2 text-xs text-gray-500 text-center">
        Hover to pause • Updates every 30 seconds • Powered by RUNE.CTZ Analytics
      </div>
    </div>
  );
}