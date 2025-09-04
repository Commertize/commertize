import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, MoreHorizontal, MessageSquare } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { useMarketUpdates } from "../hooks/useMarketUpdates";
import { MarketUpdate } from "../types/marketUpdates";
import { MarketHeadline } from "./MarketHeadline";
import { Link } from "wouter";

interface MarketUpdateCardProps {
  className?: string;
}

export function MarketUpdateCard({ className }: MarketUpdateCardProps) {
  const { data: updates, isLoading, error } = useMarketUpdates({ 
    type: 'daily', 
    limit: 1 
  });

  if (isLoading) {
    return (
      <Card className={`bg-card border-border ${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded mb-3"></div>
            <div className="h-8 bg-muted rounded mb-4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !updates || updates.length === 0) {
    return (
      <Card className={`bg-card border-border ${className}`}>
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-light text-foreground mb-2">Market Update</h3>
            <p className="text-muted-foreground text-sm">No recent updates available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const update = updates[0];
  
  // Prepare mini chart data
  const chartData = update.chart?.series[0]?.data?.map((value, index) => ({
    name: update.chart?.labels[index] || '',
    value
  })) || [];

  // Get primary metric for display
  const primaryMetric = update.metrics.tokenizedAUM || update.metrics.capRate || 0;
  const metricLabel = update.metrics.tokenizedAUM ? 'Tokenized AUM' : 'Cap Rate';
  const metricValue = typeof primaryMetric === 'number' 
    ? (metricLabel === 'Tokenized AUM' ? `$${primaryMetric.toFixed(1)}B` : `${primaryMetric.toFixed(1)}%`)
    : primaryMetric;

  return (
    <Card className={`bg-card border-border hover:border-primary/30 transition-all duration-300 ${className}`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <Badge 
              variant="outline" 
              className="bg-primary/10 text-primary border-primary/30 mb-2"
            >
              Today's CRE Market Update
            </Badge>
            <h3 className="text-lg font-light text-foreground leading-tight">
              {update.title}
            </h3>
          </div>
          <MarketHeadline 
            title="Market Update"
            lastUpdated={update.publishedAt || update.createdAt}
            variant="compact"
            className="text-foreground"
          />
        </div>

        {/* Key Metric */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 text-primary">
            <TrendingUp size={16} />
            <span className="text-sm font-light">{metricLabel}</span>
          </div>
          <div className="text-xl font-light text-foreground">
            {metricValue}
          </div>
        </div>

        {/* Mini Chart */}
        {chartData.length > 0 && (
          <div className="h-24 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#be8d00" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Summary */}
        <p className="text-sm text-foreground font-light mb-4 line-clamp-2">
          {update.summary}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link href={`/market-updates/${update.id}`}>
            <Button 
              variant="outline" 
              size="sm"
              className="text-primary hover:text-primary/80 font-light"
            >
              View Full Update
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <MessageSquare size={14} className="mr-1" />
            Ask RUNE
          </Button>
        </div>

        {/* Timestamp */}
        <div className="text-xs text-muted-foreground mt-3">
          {update.publishedAt ? 
            new Date(update.publishedAt).toLocaleString() : 
            'Draft'
          }
        </div>
      </CardContent>
    </Card>
  );
}