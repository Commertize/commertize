import { motion } from "framer-motion";
import { 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Building2,
  Maximize,
  Coins,
  Star,
  Brain,
  Settings
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';

interface Property {
  id: string;
  name: string;
  location: string;
  type: string;
  imageUrl: string;
  imageUrls?: string[];
  images?: string[];
  minInvestment: number;
  targetedIRR: number;
  targetedYield: number;
  equityMultiple: number;
  riskFactor?: "low" | "moderate" | "high";
  daysLeft?: number;
  status?: string;
  propertyClass?: string;
  symbol?: string;
  active?: boolean;
  pricePerToken?: number;
  totalTokens?: number;
  tokensAvailable?: number;
  propertyValue?: number;
  walletAddress?: string;
  squareFeet?: number;
  propertyType?: string;
  totalArea?: number;
  measure?: string;
  projectedRentalIncome?: number;
  valueGrowth?: number;
  holdPeriod?: number;
  ltv?: number;
  assetType?: string;
}

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [dqiScore, setDqiScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchDQI = async () => {
      if (!property.id) return;
      
      try {
        const response = await fetch(`/api/deal-quality-index/${property.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.overallScore) {
            setDqiScore(data.data.overallScore);
          }
        }
      } catch (error) {
        console.error('Error fetching DQI score:', error);
      }
    };

    fetchDQI();
  }, [property.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="property-card group relative w-full h-full min-h-[650px] bg-white border-2 border-[#d4a017] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col"
    >
      {/* Image Section */}
      <div className="relative overflow-hidden">
        <motion.div
          className="relative h-48 overflow-hidden flex-shrink-0"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent z-20" />
          
          {(property.images && property.images.length > 0) || 
           (property.imageUrls && property.imageUrls.length > 0) || 
           property.imageUrl ? (
            <img
              src={property.images?.[0] || property.imageUrls?.[0] || property.imageUrl}
              alt={property.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          
          <div className={`w-full h-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center ${
            (property.images && property.images.length > 0) || 
            (property.imageUrls && property.imageUrls.length > 0) || 
            property.imageUrl ? 'hidden' : ''
          }`}>
            <Building2 className="w-16 h-16 text-yellow-600/50" />
          </div>



          {/* Status Badge */}
          <div className="absolute top-4 left-4 z-30">
            <div className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs font-light rounded-full shadow-lg">
              {property.status || 'Available'}
            </div>
          </div>

          {/* Favorite Button */}
          <div className="absolute top-4 right-4 z-30">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                // Favorite functionality would be added here
              }}
            >
              <Star className="w-4 h-4 text-white" />
            </motion.button>
          </div>


        </motion.div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-4 flex-1 flex flex-col">
        
        {/* Property Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-light text-xl text-black group-hover:text-yellow-600 transition-colors duration-300 leading-tight flex-1">
              {property.name}
            </h3>
            <div className="px-3 py-1 bg-white border-2 border-yellow-500 rounded-full flex-shrink-0">
              <span className="text-xs font-light text-black uppercase tracking-wide">
                {property.assetType || (
                  property.name?.toLowerCase().includes('hotel') ? 'Hotel' :
                  property.name?.toLowerCase().includes('office') ? 'Office' :
                  property.name?.toLowerCase().includes('tower') ? 'Office' :
                  property.name?.toLowerCase().includes('retail') ? 'Retail' :
                  property.name?.toLowerCase().includes('residential') ? 'Multifamily' :
                  property.name?.toLowerCase().includes('logistics') ? 'Industrial' :
                  'Mixed-use'
                )}
              </span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
            <div className="flex items-center text-gray-700">
              <MapPin className="w-4 h-4 mr-2 text-yellow-600" />
              <span className="text-sm font-light text-black">{property.location}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-black font-light">
            <span>Tokens Sold</span>
            <span>
              {property.totalTokens && property.tokensAvailable 
                ? `${((property.totalTokens - property.tokensAvailable) / property.totalTokens * 100).toFixed(1)}%`
                : '0%'
              }
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 shadow-inner border border-yellow-400">
            <div 
              className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 h-2 rounded-full shadow-lg transition-all duration-1000 ease-out" 
              style={{ 
                width: property.totalTokens && property.tokensAvailable 
                  ? `${((property.totalTokens - property.tokensAvailable) / property.totalTokens * 100)}%`
                  : '0%'
              }}
            ></div>
          </div>
        </div>

        {/* Property Value Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-yellow-600" />
            <span className="text-xs font-light text-black uppercase tracking-wide">Property Value</span>
          </div>
          <div className="text-2xl font-light text-black font-sans">
            {property.propertyValue ? `$${property.propertyValue.toLocaleString()}` : "TBD"}
          </div>
          

        </div>

        {/* Investment Details */}
        {(property.propertyValue || property.squareFeet || property.minInvestment) && (
          <div className="bg-gradient-to-br from-muted/30 to-muted/20 border border-border/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-yellow-600" />
              <span className="text-xs font-light text-black uppercase tracking-wide">Investment Details</span>
            </div>
            
            <div className="grid grid-cols-1 gap-2 text-sm">
              {property.pricePerToken && (
                <div className="flex justify-between items-center">
                  <span className="text-black font-light">Price Per Token</span>
                  <span className="text-black font-light">${property.pricePerToken}</span>
                </div>
              )}
              {property.minInvestment && (
                <div className="flex justify-between items-center">
                  <span className="text-black font-light">Minimum Entry</span>
                  <span className="text-black font-light">${property.minInvestment.toLocaleString()}</span>
                </div>
              )}
              {property.totalTokens && (
                <div className="flex justify-between items-center">
                  <span className="text-black font-light">Token Supply</span>
                  <span className="text-black font-light">{property.totalTokens.toLocaleString()}</span>
                </div>
              )}
              {property.squareFeet && (
                <div className="flex justify-between items-center">
                  <span className="text-black font-light">Square Feet</span>
                  <span className="text-black font-light">{property.squareFeet.toLocaleString()} sq ft</span>
                </div>
              )}
              {property.propertyClass && (
                <div className="flex justify-between items-center">
                  <span className="text-black font-light">Property Class</span>
                  <span className="text-black font-light">{property.propertyClass}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Financial Metrics Section */}
        <div className="bg-gradient-to-br from-yellow-500/8 to-yellow-500/15 border border-yellow-500/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-light text-black uppercase tracking-wide">Financial Metrics</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-black font-light">Target IRR</span>
                <span className="text-black font-light">{property.targetedIRR || 'N/A'}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-black font-light">Cash Yield</span>
                <span className="text-black font-light">{property.targetedYield ? `${property.targetedYield}%` : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-black font-light">Equity Multiple</span>
                <span className="text-black font-light">{property.equityMultiple ? `${property.equityMultiple}x` : 'N/A'}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-black font-light">Hold Period</span>
                <span className="text-black font-light">{property.holdPeriod ? `${property.holdPeriod} yrs` : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-black font-light">LTV</span>
                <span className="text-black font-light">{property.ltv ? `${property.ltv}%` : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Risk Level Indicator */}
          {property.riskFactor && (
            <div className="pt-2 border-t border-yellow-200/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-black font-light">Risk Level</span>
                <div className={`px-2 py-1 rounded-full text-xs font-light ${
                  property.riskFactor === 'low' ? 'bg-gradient-to-br from-yellow-300/80 to-yellow-400/80 text-black border border-yellow-500/30' :
                  property.riskFactor === 'moderate' ? 'bg-gradient-to-br from-yellow-400/80 to-yellow-500/80 text-black border border-yellow-500/50' :
                  'bg-gradient-to-br from-yellow-500/80 to-yellow-600/80 text-black border border-yellow-600/50'
                }`}>
                  {property.riskFactor.charAt(0).toUpperCase() + property.riskFactor.slice(1)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CommertizerX Insights */}
        <div className="bg-gradient-to-br from-yellow-500/8 to-yellow-500/15 border border-yellow-500/30 rounded-xl p-4 mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {/* RUNE.CTZ Style Icon */}
              <div className="w-8 h-8 rounded-full bg-[#be8d00] flex items-center justify-center flex-shrink-0 relative">
                {/* Orbiting dots */}
                <motion.div
                  className="absolute w-6 h-6"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <div className="absolute w-1.5 h-1.5 bg-white rounded-full top-0 left-1/2 transform -translate-x-1/2"></div>
                  <div className="absolute w-1 h-1 bg-white/70 rounded-full top-1/2 right-0 transform -translate-y-1/2"></div>
                </motion.div>
                {/* Counter-rotating inner element */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Settings className="w-3 h-3 text-white" />
                </motion.div>
              </div>
              <div>
                <span className="text-sm font-light text-black uppercase tracking-wide">CommertizerX Insights</span>
                <div className="text-xs text-black">AI Analysis</div>
              </div>
            </div>
            {dqiScore && (
              <div className="flex items-center gap-1 bg-white border border-gray-300 px-2 py-1 rounded-full shadow-sm">
                <div className="flex items-center gap-1">
                  {/* DQI Circular Progress Icon */}
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 relative">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 20 20">
                        {/* Background circle */}
                        <circle
                          cx="10"
                          cy="10"
                          r="7"
                          stroke="#be8d00"
                          strokeWidth="2.5"
                          fill="transparent"
                          opacity="0.3"
                        />
                        {/* Progress circle */}
                        <circle
                          cx="10"
                          cy="10"
                          r="7"
                          stroke="#be8d00"
                          strokeWidth="3"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 7}`}
                          strokeDashoffset={`${2 * Math.PI * 7 * (1 - parseInt(dqiScore.toString()) / 100)}`}
                          strokeLinecap="round"
                        />
                        {/* Small indicator dot */}
                        <circle
                          cx="10"
                          cy="3"
                          r="1.5"
                          fill="#be8d00"
                          style={{
                            transformOrigin: '10px 10px',
                            transform: `rotate(${(parseInt(dqiScore.toString()) / 100) * 360}deg)`
                          }}
                        />
                      </svg>
                    </div>
                    <span className="text-xs font-light text-[#be8d00]">{dqiScore}</span>
                  </div>
                  <span className="text-xs font-light text-[#be8d00]">DQI</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2 text-xs text-black">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <span>Market Analysis Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span>Risk Assessment Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
              <span>Performance Forecasting</span>
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-yellow-200/50">
            <div className="text-xs text-black italic">
              Access detailed insights and forecasts with CommertizerX.
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link to={`/property/${property.id}`} className="block w-full">
            <Button 
              className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white font-light py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              View Property
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// Add default export
export default PropertyCard;