import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { DollarSign, PieChart, Users, TrendingUp, Shield, ArrowRight } from "lucide-react";

export default function FractionalOwnership() {
  useEffect(() => {
    document.title = "Fractional Ownership | Commercial Real Estate Investment | Commertize";
    
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

    updateMetaTag('description', 'Fractional ownership of commercial real estate through Commertize. Invest in premium CRE properties with as little as $100. Democratizing access to high-value commercial real estate investments.');
    updateMetaTag('keywords', 'fractional ownership, fractional real estate, commercial real estate fractional ownership, shared ownership, fractional property investment, real estate tokenization, CRE fractional shares');
    
    updateMetaTag('og:title', 'Fractional Ownership | Commercial Real Estate Investment | Commertize', true);
    updateMetaTag('og:description', 'Fractional ownership of commercial real estate. Invest in premium CRE properties with as little as $100 through blockchain technology.', true);
    updateMetaTag('og:url', `${window.location.origin}/fractional-ownership`, true);

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Fractional Ownership",
      "description": "Fractional ownership of commercial real estate properties enabling democratic access to premium CRE investments",
      "url": `${window.location.origin}/fractional-ownership`,
      "mainEntity": {
        "@type": "FinancialProduct",
        "name": "Fractional Real Estate Ownership",
        "description": "Investment product enabling fractional ownership of commercial real estate properties through blockchain tokenization",
        "provider": {
          "@type": "Organization",
          "name": "Commertize"
        },
        "category": "Real Estate Investment",
        "audience": {
          "@type": "Audience",
          "audienceType": "Individual Investors"
        }
      }
    };

    const existingScript = document.querySelector('script[data-page="fractional-ownership"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-page', 'fractional-ownership');
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
            Fractional Ownership
            <br />
            <span className="text-foreground">Redefined</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
            Own a piece of premium commercial real estate with <strong>fractional ownership</strong> starting from $100. 
            Democratizing access to high-value CRE investments through blockchain technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg">
                <PieChart className="mr-2" size={20} />
                Start Fractional Investing
              </Button>
            </Link>
            <Link href="/invest">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                <DollarSign className="mr-2" size={20} />
                Learn How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Benefits of <span className="text-primary">Fractional Ownership</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <DollarSign className="text-primary" size={24} />
                  Low Minimum Investment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Start investing in commercial real estate with as little as $100, 
                  making premium properties accessible to all investors.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• $100 minimum investment</li>
                  <li>• No large capital requirements</li>
                  <li>• Diversify with multiple properties</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <PieChart className="text-primary" size={24} />
                  Portfolio Diversification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Spread risk across multiple commercial properties and geographic markets 
                  with fractional ownership.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Multiple property types</li>
                  <li>• Geographic diversification</li>
                  <li>• Risk mitigation strategy</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <TrendingUp className="text-primary" size={24} />
                  Professional Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Benefit from professional property management and AI-powered 
                  investment insights without hands-on involvement.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Professional property management</li>
                  <li>• AI-powered analytics</li>
                  <li>• Passive income generation</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="text-primary" size={24} />
                  Transparent Ownership
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Blockchain technology ensures transparent, immutable ownership records 
                  and automated dividend distribution.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Blockchain-verified ownership</li>
                  <li>• Immutable transaction records</li>
                  <li>• Automated distributions</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="text-primary" size={24} />
                  Community Investment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Join a community of like-minded investors sharing ownership 
                  in premium commercial real estate assets.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Investor community access</li>
                  <li>• Shared investment insights</li>
                  <li>• Collective decision-making</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <ArrowRight className="text-primary" size={24} />
                  Enhanced Liquidity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Trade your fractional ownership tokens on secondary markets 
                  for enhanced liquidity compared to traditional real estate.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Secondary market trading</li>
                  <li>• Enhanced liquidity options</li>
                  <li>• Flexible exit strategies</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            How <span className="text-primary">Fractional Ownership</span> Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose Property</h3>
              <p className="text-muted-foreground">
                Browse our curated selection of premium commercial real estate properties.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Select Investment</h3>
              <p className="text-muted-foreground">
                Decide how much to invest and how many fractional shares to purchase.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Complete Purchase</h3>
              <p className="text-muted-foreground">
                Secure your fractional ownership through blockchain-verified transactions.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-xl">
                4
              </div>
              <h3 className="text-xl font-semibold mb-2">Earn Returns</h3>
              <p className="text-muted-foreground">
                Receive proportional rental income and benefit from property appreciation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Fractional Ownership <span className="text-primary">Impact</span>
          </h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">$100</div>
              <div className="text-muted-foreground">Minimum Investment</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-muted-foreground">Lower Entry Barrier</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Market Access</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">∞</div>
              <div className="text-muted-foreground">Diversification Options</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Start Your <span className="text-primary">Fractional Ownership</span> Journey
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of investors accessing premium commercial real estate through fractional ownership.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg">
                Browse Properties
              </Button>
            </Link>
            <Link href="/news">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}