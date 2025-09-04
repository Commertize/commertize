import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Brain, BarChart3, Target, Zap, TrendingUp, PieChart } from "lucide-react";

export default function AIPoweredCRE() {
  useEffect(() => {
    document.title = "AI-Powered Commercial Real Estate | Smart CRE Investment Platform | Commertize";
    
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

    updateMetaTag('description', 'AI-powered commercial real estate investment platform by Commertize. Advanced artificial intelligence analyzes market data, predicts trends, and optimizes CRE investment decisions with machine learning insights.');
    updateMetaTag('keywords', 'AI-powered CRE, artificial intelligence real estate, smart commercial real estate, AI property analysis, machine learning real estate, AI CRE investment, intelligent property platform, AI real estate insights');
    
    updateMetaTag('og:title', 'AI-Powered Commercial Real Estate | Smart CRE Investment Platform | Commertize', true);
    updateMetaTag('og:description', 'AI-powered commercial real estate platform using artificial intelligence for smart CRE investment decisions and market analysis.', true);
    updateMetaTag('og:url', `${window.location.origin}/ai-powered-cre`, true);

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "AI-Powered Commercial Real Estate",
      "description": "Artificial intelligence-powered commercial real estate investment platform with advanced analytics and machine learning insights",
      "url": `${window.location.origin}/ai-powered-cre`,
      "mainEntity": {
        "@type": "SoftwareApplication",
        "name": "AI-Powered CRE Platform",
        "applicationCategory": "Real Estate Investment Software",
        "description": "Advanced AI system for commercial real estate analysis, market prediction, and investment optimization",
        "featureList": [
          "Artificial Intelligence Market Analysis",
          "Machine Learning Property Valuation",
          "Predictive Analytics",
          "Automated Risk Assessment",
          "Smart Investment Recommendations"
        ],
        "provider": {
          "@type": "Organization",
          "name": "Commertize"
        }
      }
    };

    const existingScript = document.querySelector('script[data-page="ai-powered-cre"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-page', 'ai-powered-cre');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      document.title = 'Commertize - Tokenized Commercial Real Estate Investment';
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            AI-Powered
            <br />
            <span className="text-foreground">Commercial Real Estate</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
            Harness the power of <strong>artificial intelligence</strong> for smarter commercial real estate investments. 
            Advanced machine learning algorithms analyze market data and optimize investment decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg">
                <Brain className="mr-2" size={20} />
                Explore AI Analytics
              </Button>
            </Link>
            <Link href="/invest">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                <BarChart3 className="mr-2" size={20} />
                View Market Insights
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            <span className="text-primary">AI-Powered</span> Investment Intelligence
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Brain className="text-primary" size={24} />
                  Machine Learning Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Advanced ML algorithms analyze vast datasets to identify market trends, 
                  property valuations, and investment opportunities.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Deep learning market analysis</li>
                  <li>• Pattern recognition</li>
                  <li>• Predictive modeling</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BarChart3 className="text-primary" size={24} />
                  Real-Time Market Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  AI processes real-time market data from multiple sources to provide 
                  instant insights and recommendations.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Live market data processing</li>
                  <li>• Multi-source data integration</li>
                  <li>• Instant analysis updates</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Target className="text-primary" size={24} />
                  Smart Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  AI-driven risk models evaluate market volatility, tenant stability, 
                  and economic factors for comprehensive risk analysis.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Automated risk scoring</li>
                  <li>• Multi-factor analysis</li>
                  <li>• Predictive risk modeling</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <TrendingUp className="text-primary" size={24} />
                  Predictive Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Forecast property performance, market trends, and investment returns 
                  using advanced predictive AI models.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Performance forecasting</li>
                  <li>• Trend prediction</li>
                  <li>• Return optimization</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Zap className="text-primary" size={24} />
                  Automated Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  AI automatically optimizes portfolios, rebalances investments, 
                  and suggests strategic adjustments based on market conditions.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Portfolio optimization</li>
                  <li>• Automated rebalancing</li>
                  <li>• Strategic recommendations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <PieChart className="text-primary" size={24} />
                  Intelligent Diversification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  AI analyzes correlations and market dynamics to suggest optimal 
                  diversification strategies across property types and markets.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Correlation analysis</li>
                  <li>• Market diversification</li>
                  <li>• Risk distribution</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Process */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            How Our <span className="text-primary">AI</span> Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Data Collection</h3>
              <p className="text-muted-foreground">
                AI aggregates data from market sources, property records, economic indicators, and transaction history.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Brain className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analysis & Learning</h3>
              <p className="text-muted-foreground">
                Machine learning algorithms process data patterns, identify trends, and continuously improve predictions.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Target className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Insights</h3>
              <p className="text-muted-foreground">
                AI generates actionable insights, risk assessments, and investment recommendations.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Optimization</h3>
              <p className="text-muted-foreground">
                Automated optimization adjusts strategies and portfolios based on AI analysis and market changes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            AI-Powered <span className="text-primary">Performance</span>
          </h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-muted-foreground">Prediction Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">100M+</div>
              <div className="text-muted-foreground">Data Points Analyzed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Market Monitoring</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">85%</div>
              <div className="text-muted-foreground">Risk Reduction</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Experience <span className="text-primary">AI-Powered</span> CRE Investment
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join the future of commercial real estate investment with artificial intelligence driving your success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg">
                Start AI-Powered Investing
              </Button>
            </Link>
            <Link href="/news">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                Learn About Our AI
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}