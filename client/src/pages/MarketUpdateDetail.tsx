import { useState } from "react";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { ArrowLeft, MessageSquare, Share2 } from "lucide-react";
import { useMarketUpdateDetail, useRuneMarketQuestion } from "../hooks/useMarketUpdates";
import { MarketHeadline } from "../components/MarketHeadline";
import { Link } from "wouter";

export default function MarketUpdateDetail() {
  const { id } = useParams();
  const [runeQuestion, setRuneQuestion] = useState('');
  const [runeAnswer, setRuneAnswer] = useState<string | null>(null);
  
  const { data: update, isLoading } = useMarketUpdateDetail(id || '');
  const runeQuery = useRuneMarketQuestion();

  const handleRuneQuestion = async () => {
    if (!runeQuestion.trim() || !update) return;
    
    try {
      const result = await runeQuery.mutateAsync({
        question: runeQuestion,
        updateId: update.id
      });
      setRuneAnswer(result.answer);
    } catch (error) {
      console.error('Error asking RUNE:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-primary/10 text-primary border-primary/30';
      case 'weekly': return 'bg-primary/10 text-primary border-primary/30';
      case 'monthly': return 'bg-primary/10 text-primary border-primary/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
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

  if (!update) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-light text-foreground mb-4">Market Update Not Found</h1>
          <Link href="/market-updates">
            <Button variant="outline" className="font-light">
              <ArrowLeft size={16} className="mr-2" />
              Back to Market Updates
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <MarketHeadline 
              title="Market Analysis"
              lastUpdated={update.publishedAt || update.createdAt}
            />
            <div className="flex items-center gap-3">
              <Link href="/market-updates">
                <Button variant="outline" size="sm" className="font-light">
                  <ArrowLeft size={16} className="mr-2" />
                  Back
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="font-light">
                <Share2 size={16} className="mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Badge className={getTypeColor(update.type)}>
                    {update.type.charAt(0).toUpperCase() + update.type.slice(1)} Update
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-light text-foreground">
                  {update.title}
                </CardTitle>
                <p className="text-foreground font-light text-lg">
                  {update.summary}
                </p>
              </CardHeader>
              <CardContent>
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {Object.entries(update.metrics).map(([key, value]) => (
                    <div key={key} className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-foreground text-xs uppercase tracking-wide font-light mb-1">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </div>
                      <div className="text-primary text-2xl font-light">
                        {typeof value === 'number' ? 
                          (key.includes('Rate') || key.includes('Growth') || key.includes('vacancy') ? `${value.toFixed(1)}%` : 
                           key.includes('AUM') ? `$${value.toFixed(1)}B` : 
                           value.toLocaleString()) : 
                          String(value)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                {update.chart && (
                  <div className="mb-8">
                    <h3 className="text-lg font-light text-foreground mb-4">Market Trends</h3>
                    <div className="h-64 bg-muted rounded-lg p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={update.chart.labels.map((label: string, i: number) => ({
                          name: label,
                          value: update.chart?.series[0]?.data[i] || 0
                        }))}>
                          <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-foreground" />
                          <YAxis axisLine={false} tickLine={false} className="text-foreground" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              color: 'hsl(var(--foreground))'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#be8d00" 
                            fill="rgba(190, 141, 0, 0.1)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Sections */}
                <div className="space-y-6">
                  {update.sections.map((section: any, index: number) => (
                    <div key={index}>
                      <h2 className="text-xl font-light text-foreground mb-3">{section.heading}</h2>
                      <p className="text-foreground font-light leading-relaxed mb-4">
                        {section.body}
                      </p>
                      {section.bullets && section.bullets.length > 0 && (
                        <ul className="space-y-2 text-foreground font-light">
                          {section.bullets.map((bullet: string, bulletIndex: number) => (
                            <li key={bulletIndex} className="flex items-start">
                              <span className="text-primary mr-2">•</span>
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RUNE.CTZ Q&A Sidebar */}
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-light text-foreground flex items-center gap-2">
                  <MessageSquare size={20} className="text-primary" />
                  Ask RUNE.CTZ
                </CardTitle>
                <p className="text-foreground text-sm font-light">
                  Get insights on this market analysis
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask about this analysis..."
                      value={runeQuestion}
                      onChange={(e) => setRuneQuestion(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleRuneQuestion()}
                      className="bg-muted border-border text-foreground placeholder:text-foreground font-light"
                    />
                    <Button 
                      onClick={handleRuneQuestion}
                      disabled={!runeQuestion.trim() || runeQuery.isPending}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 font-light"
                    >
                      {runeQuery.isPending ? '...' : 'Ask'}
                    </Button>
                  </div>

                  {/* Suggested Questions */}
                  <div className="space-y-2">
                    <div className="text-foreground text-xs uppercase tracking-wide font-light">Quick Questions</div>
                    {[
                      "Summarize the key findings",
                      "What are the investment implications?",
                      "How does this compare to last month?",
                      "What should investors watch for?"
                    ].map((question) => (
                      <Button
                        key={question}
                        variant="ghost"
                        size="sm"
                        onClick={() => setRuneQuestion(question)}
                        className="w-full text-left justify-start text-foreground hover:text-foreground text-xs font-light"
                      >
                        {question}
                      </Button>
                    ))}
                  </div>

                  {/* Answer Display */}
                  {runeAnswer && (
                    <div className="border-t border-border pt-4">
                      <div className="text-muted-foreground text-xs uppercase tracking-wide mb-2 font-light">RUNE.CTZ Response</div>
                      <div className="text-foreground font-light text-sm leading-relaxed">
                        {runeAnswer}
                      </div>
                      <div className="text-muted-foreground text-xs mt-2 font-light">
                        Analysis based on available data. Projections are estimates.
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}