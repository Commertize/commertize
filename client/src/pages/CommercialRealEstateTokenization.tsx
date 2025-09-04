import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Building2, Coins, TrendingUp, Shield, Users, Zap } from "lucide-react";

export default function CommercialRealEstateTokenization() {
  useEffect(() => {
    // SEO optimization for this specific page
    document.title = "Commercial Real Estate Tokenization | #1 Blockchain CRE Platform | Commertize";
    
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

    updateMetaTag('description', 'Leading commercial real estate tokenization platform. Democratize CRE investment through blockchain technology, enabling fractional ownership of premium commercial properties with AI-powered insights.');
    updateMetaTag('keywords', 'commercial real estate tokenization, blockchain CRE, tokenized commercial properties, real estate blockchain, CRE tokenization platform, commercial property tokens, blockchain real estate investment');
    
    // Open Graph tags
    updateMetaTag('og:title', 'Commercial Real Estate Tokenization | #1 Blockchain CRE Platform | Commertize', true);
    updateMetaTag('og:description', 'Leading commercial real estate tokenization platform. Democratize CRE investment through blockchain technology with fractional ownership.', true);
    updateMetaTag('og:url', `${window.location.origin}/commercial-real-estate-tokenization`, true);

    // Structured data for this page
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Commercial Real Estate Tokenization",
      "description": "Leading commercial real estate tokenization platform enabling fractional ownership through blockchain technology",
      "url": `${window.location.origin}/commercial-real-estate-tokenization`,
      "mainEntity": {
        "@type": "Service",
        "name": "Commercial Real Estate Tokenization",
        "provider": {
          "@type": "Organization",
          "name": "Commertize"
        },
        "description": "Blockchain-based platform for tokenizing commercial real estate properties, enabling fractional ownership and democratized access to premium CRE investments",
        "serviceType": "Real Estate Investment Platform",
        "areaServed": "United States",
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Commercial Real Estate Investment Opportunities",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Fractional CRE Ownership"
              }
            },
            {
              "@type": "Offer", 
              "itemOffered": {
                "@type": "Service",
                "name": "AI-Powered Property Analysis"
              }
            }
          ]
        }
      }
    };

    // Remove existing structured data
    const existingScript = document.querySelector('script[data-page="cre-tokenization"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-page', 'cre-tokenization');
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
            Commercial Real Estate
            <br />
            <span className="text-foreground">Tokenization</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
            Revolutionizing commercial real estate investment through <strong>blockchain tokenization</strong>. 
            Access premium CRE properties with <strong>fractional ownership</strong> starting from $100.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg">
                <Building2 className="mr-2" size={20} />
                Browse Tokenized Properties
              </Button>
            </Link>
            <Link href="/invest">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                <Coins className="mr-2" size={20} />
                Start Investing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Why Choose <span className="text-primary">Tokenized CRE</span>?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Coins className="text-primary" size={24} />
                  Fractional Ownership
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Invest in premium commercial real estate with as little as $100. 
                  Own fractions of high-value properties previously accessible only to institutional investors.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="text-primary" size={24} />
                  Blockchain Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All transactions secured by blockchain technology with immutable records, 
                  smart contracts, and transparent ownership verification.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <TrendingUp className="text-primary" size={24} />
                  Enhanced Liquidity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Trade property tokens on secondary markets, providing liquidity 
                  to traditionally illiquid real estate investments.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            How Commercial Real Estate <span className="text-primary">Tokenization</span> Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Building2 className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Property Selection</h3>
              <p className="text-muted-foreground">
                We identify premium commercial properties with strong cash flow and appreciation potential.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
              <p className="text-muted-foreground">
                Our AI-powered system analyzes market data, cash flows, and risk factors for each property.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Coins className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Tokenization</h3>
              <p className="text-muted-foreground">
                Properties are tokenized on the blockchain, creating digital shares representing ownership.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Investment Access</h3>
              <p className="text-muted-foreground">
                Investors can purchase tokens representing fractional ownership and receive proportional returns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Start Your <span className="text-primary">Tokenized CRE</span> Journey Today
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of investors accessing premium commercial real estate through blockchain tokenization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg">
                Explore Properties
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