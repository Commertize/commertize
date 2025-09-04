import { Calendar } from "lucide-react";

interface MarketHeadlineProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  variant?: 'full' | 'compact';
  className?: string;
}

export function MarketHeadline({ 
  title, 
  subtitle, 
  lastUpdated, 
  variant = 'full',
  className = '' 
}: MarketHeadlineProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (variant === 'compact') {
    return (
      <div className={`text-right ${className}`}>
        <h3 className={`text-sm font-light ${className?.includes('text-white') ? 'text-white' : 'text-foreground'}`}>{title}</h3>
        {lastUpdated && (
          <div className={`flex items-center justify-end gap-1 text-xs font-light mt-1 ${className?.includes('text-white') ? 'text-white/60' : 'text-muted-foreground'}`}>
            <Calendar size={12} />
            {formatDate(lastUpdated)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div>
        <h1 className="text-2xl font-light text-primary flex items-center gap-3">
          {title}
          {title === "Market Updates" && (
            <div className="relative">
              <div className="w-3 h-2 bg-primary rounded-sm animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-2 bg-primary/50 rounded-sm animate-ping"></div>
            </div>
          )}
        </h1>
        {subtitle && (
          <p className="text-foreground text-sm font-light mt-1">{subtitle}</p>
        )}
      </div>
      {lastUpdated && (
        <div className="flex items-center gap-2 text-sm text-foreground font-light">
          <Calendar size={16} />
          Last updated: {formatDate(lastUpdated)}
        </div>
      )}
    </div>
  );
}