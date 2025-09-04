import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Building2, Coins, Brain, TrendingUp } from "lucide-react";

interface SEOInternalLinksProps {
  currentPage?: string;
  variant?: 'footer' | 'sidebar' | 'content';
}

export function SEOInternalLinks({ currentPage, variant = 'content' }: SEOInternalLinksProps) {
  const [, setLocation] = useLocation();
  const keywordPages = [
    {
      path: '/commercial-real-estate-tokenization',
      title: 'Commercial Real Estate Tokenization',
      description: 'Blockchain-based CRE investment platform',
      keywords: 'commercial real estate tokenization, blockchain CRE, tokenized properties',
      icon: Building2
    },
    {
      path: '/fractional-ownership',
      title: 'Fractional Ownership',
      description: 'Own fractions of premium CRE properties',
      keywords: 'fractional ownership, fractional real estate, shared ownership',
      icon: Coins
    },
    {
      path: '/ai-powered-cre',
      title: 'AI-Powered CRE',
      description: 'Artificial intelligence for smart real estate investment',
      keywords: 'AI-powered CRE, artificial intelligence real estate, smart property analysis',
      icon: Brain
    }
  ];

  const corePages = [
    {
      path: '/marketplace',
      title: 'Property Marketplace',
      description: 'Browse tokenized commercial real estate properties',
      icon: Building2
    },
    {
      path: '/news',
      title: 'CRE News & Insights',
      description: 'Latest commercial real estate tokenization news',
      icon: TrendingUp
    }
  ];

  if (variant === 'footer') {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <h4 className="font-semibold mb-3 text-primary">Tokenization Solutions</h4>
          <ul className="space-y-2 text-sm">
            {keywordPages.map((page) => (
              <li key={page.path}>
                <button 
                  onClick={() => setLocation(page.path)}
                  className="text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  {page.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-primary">Investment Platform</h4>
          <ul className="space-y-2 text-sm">
            {corePages.map((page) => (
              <li key={page.path}>
                <button 
                  onClick={() => setLocation(page.path)}
                  className="text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  {page.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-primary">Learn More</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <button 
                onClick={() => setLocation("/about")}
                className="text-muted-foreground hover:text-primary transition-colors text-left"
              >
                About Commertize
              </button>
            </li>
            <li>
              <button 
                onClick={() => setLocation("/faq")}
                className="text-muted-foreground hover:text-primary transition-colors text-left"
              >
                Frequently Asked Questions
              </button>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Explore CRE Tokenization</h3>
        {keywordPages.filter(page => page.path !== currentPage).map((page) => {
          const IconComponent = page.icon;
          return (
            <div 
              key={page.path}
              onClick={() => setLocation(page.path)}
              className="p-3 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <IconComponent size={20} className="text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">{page.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{page.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Content variant for in-page linking
  return (
    <div className="bg-muted/30 rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4 text-center">
        Discover More About <span className="text-primary">CRE Tokenization</span>
      </h3>
      <div className="grid md:grid-cols-3 gap-4">
        {keywordPages.filter(page => page.path !== currentPage).map((page) => {
          const IconComponent = page.icon;
          return (
            <div 
              key={page.path}
              onClick={() => setLocation(page.path)}
              className="text-center p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
            >
              <IconComponent size={32} className="text-primary mx-auto mb-2" />
              <h4 className="font-semibold text-sm mb-1">{page.title}</h4>
              <p className="text-xs text-muted-foreground">{page.description}</p>
            </div>
          );
        })}
      </div>
      <div className="text-center mt-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setLocation("/marketplace")}
        >
          Browse All Properties
        </Button>
      </div>
    </div>
  );
}