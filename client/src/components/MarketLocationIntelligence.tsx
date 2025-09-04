import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  TrendingUp, 
  Users, 
  Car, 
  Shield, 
  Building2, 
  ExternalLink,
  Loader2,
  BarChart3,
  Activity,
  Target
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface MarketLocationIntelligenceProps {
  propertyId: string;
  location: string;
}

interface LocationData {
  demographics: {
    population: number;
    medianIncome: number;
    medianAge: number;
    householdSize: number;
  };
  traffic: {
    dailyCount: number;
    peakHour: string;
    accessibility: string;
  };
  safety: {
    crimeRate: number;
    safetyGrade: string;
    trend: 'improving' | 'declining' | 'stable';
  };
  comparables: {
    averageRent: number;
    occupancyRate: number;
    capRate: number;
    pricePerSqFt: number;
  };
  neighborhoodGrade: {
    overall: string;
    score: number;
    factors: {
      accessibility: number;
      demographics: number;
      growth: number;
      safety: number;
    };
  };
}

interface MarketSignals {
  rentGrowth: {
    projected1Year: number;
    projected3Year: number;
    confidence: number;
    trend: 'accelerating' | 'decelerating' | 'stable';
  };
  absorption: {
    rate: number;
    timeToStabilization: number;
    demandDrivers: string[];
  };
  vacancy: {
    current: number;
    projected: number;
    marketComparison: 'above' | 'below' | 'at';
  };
  marketHealth: {
    score: number;
    outlook: 'strong' | 'moderate' | 'weak';
    keyFactors: string[];
  };
}

export default function MarketLocationIntelligence({ 
  propertyId, 
  location 
}: MarketLocationIntelligenceProps) {
  const [activeTab, setActiveTab] = useState('heatmap');

  // Fetch location intelligence data
  const { data: locationData, isLoading: locationLoading } = useQuery<LocationData>({
    queryKey: ['/api/commertizer-x/location-intelligence', propertyId],
    queryFn: async () => {
      const response = await fetch(`/api/commertizer-x/location-intelligence/${propertyId}`);
      if (!response.ok) throw new Error('Failed to fetch location data');
      const result = await response.json();
      return result.data;
    },
  });

  // Fetch market signals data
  const { data: marketSignals, isLoading: signalsLoading } = useQuery<MarketSignals>({
    queryKey: ['/api/commertizer-x/market-signals', propertyId],
    queryFn: async () => {
      const response = await fetch(`/api/commertizer-x/market-signals/${propertyId}`);
      if (!response.ok) throw new Error('Failed to fetch market signals');
      const result = await response.json();
      return result.data;
    },
  });

  const getGradeColor = (grade: string) => {
    // All grades use gold styling for consistency
    return 'bg-gold-100 text-gold-800';
  };

  const getTrendIcon = (trend: string) => {
    // All trend icons use gold color for consistency
    switch (trend) {
      case 'improving':
      case 'accelerating':
        return <TrendingUp className="h-4 w-4 text-gold-600" />;
      case 'declining':
      case 'decelerating':
        return <TrendingUp className="h-4 w-4 text-gold-600 rotate-180" />;
      default:
        return <Activity className="h-4 w-4 text-gold-600" />;
    }
  };

  if (locationLoading || signalsLoading) {
    return (
      <Card className="border-2 border-gold-300 bg-white shadow-lg">
        <CardHeader className="bg-gold-50 border-b-2 border-gold-200">
          <CardTitle className="text-2xl font-light text-black">
            Market & Location Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-gold-600 mx-auto" />
              <p className="text-sm text-gray-500">Analyzing market intelligence...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-gold-300 bg-white shadow-lg">
      <CardHeader className="bg-gold-50 border-b-2 border-gold-200">
        <CardTitle className="text-2xl font-light text-black">
          Market & Location Intelligence
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Powered by Commertizer X • Data from CoStar, Census Bureau, and local authorities
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="heatmap" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              AI Location Heatmap
            </TabsTrigger>
            <TabsTrigger value="signals" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Forward-Looking Market Signals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="heatmap" className="space-y-6 mt-6">
            {locationData && (
              <>
                {/* Neighborhood Grade */}
                <div className="bg-white border-2 border-gold-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-light text-black">Neighborhood Grade</h3>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-lg px-4 py-2 ${getGradeColor(locationData.neighborhoodGrade.overall)}`}>
                        {locationData.neighborhoodGrade.overall}
                      </Badge>
                      <span className="text-2xl font-light text-black">
                        {locationData.neighborhoodGrade.score}/100
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Accessibility</div>
                      <Progress value={locationData.neighborhoodGrade.factors.accessibility} className="mt-2" />
                      <div className="text-sm font-light text-black mt-1">
                        {locationData.neighborhoodGrade.factors.accessibility}/100
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Demographics</div>
                      <Progress value={locationData.neighborhoodGrade.factors.demographics} className="mt-2" />
                      <div className="text-sm font-light text-black mt-1">
                        {locationData.neighborhoodGrade.factors.demographics}/100
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Growth</div>
                      <Progress value={locationData.neighborhoodGrade.factors.growth} className="mt-2" />
                      <div className="text-sm font-light text-black mt-1">
                        {locationData.neighborhoodGrade.factors.growth}/100
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Safety</div>
                      <Progress value={locationData.neighborhoodGrade.factors.safety} className="mt-2" />
                      <div className="text-sm font-light text-black mt-1">
                        {locationData.neighborhoodGrade.factors.safety}/100
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Demographics */}
                  <Card className="border-gold-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg font-light text-black">
                        <Users className="h-5 w-5 text-gold-600" />
                        Demographics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Population</span>
                        <span className="font-light text-black">
                          {locationData.demographics.population.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Median Income</span>
                        <span className="font-light text-black">
                          ${locationData.demographics.medianIncome.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Median Age</span>
                        <span className="font-light text-black">
                          {locationData.demographics.medianAge} years
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Household Size</span>
                        <span className="font-light text-black">
                          {locationData.demographics.householdSize}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Traffic & Accessibility */}
                  <Card className="border-gold-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg font-light text-black">
                        <Car className="h-5 w-5 text-gold-600" />
                        Traffic & Access
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Daily Traffic</span>
                        <span className="font-light text-black">
                          {locationData.traffic.dailyCount.toLocaleString()} vehicles
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Peak Hour</span>
                        <span className="font-light text-black">
                          {locationData.traffic.peakHour}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Accessibility</span>
                        <span className="font-light text-black">
                          {locationData.traffic.accessibility}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Safety */}
                  <Card className="border-gold-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg font-light text-black">
                        <Shield className="h-5 w-5 text-gold-600" />
                        Safety & Security
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Crime Rate</span>
                        <span className="font-light text-black">
                          {locationData.safety.crimeRate} per 1,000
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Safety Grade</span>
                        <div className="flex items-center gap-2">
                          <Badge className={getGradeColor(locationData.safety.safetyGrade)}>
                            {locationData.safety.safetyGrade}
                          </Badge>
                          {getTrendIcon(locationData.safety.trend)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Local Comparables */}
                  <Card className="border-gold-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg font-light text-black">
                        <Building2 className="h-5 w-5 text-gold-600" />
                        Local Comparables
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg. Rent</span>
                        <span className="font-light text-black">
                          ${locationData.comparables.averageRent}/sq ft
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Occupancy Rate</span>
                        <span className="font-light text-black">
                          {locationData.comparables.occupancyRate}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg. Cap Rate</span>
                        <span className="font-light text-black">
                          {locationData.comparables.capRate}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Price/Sq Ft</span>
                        <span className="font-light text-black">
                          ${locationData.comparables.pricePerSqFt}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="signals" className="space-y-6 mt-6">
            {marketSignals && (
              <>
                {/* Market Health Overview */}
                <div className="bg-white border-2 border-gold-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-light text-black">Market Health Score</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-light text-black">
                        {marketSignals.marketHealth.score}/100
                      </span>
                      <Badge className="text-sm px-3 py-1 bg-gold-100 text-gold-800">
                        {marketSignals.marketHealth.outlook}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={marketSignals.marketHealth.score} className="mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Key Factors:</p>
                    <div className="flex flex-wrap gap-2">
                      {marketSignals.marketHealth.keyFactors.map((factor, index) => (
                        <Badge key={index} variant="outline" className="text-xs break-words">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Market Signals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Rent Growth Projections */}
                  <Card className="border-gold-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg font-light text-black">
                        <TrendingUp className="h-5 w-5 text-gold-600" />
                        Rent Growth Projections
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">1-Year Growth</span>
                        <div className="flex items-center gap-2">
                          <span className="font-light text-black">
                            {marketSignals.rentGrowth.projected1Year > 0 ? '+' : ''}
                            {marketSignals.rentGrowth.projected1Year}%
                          </span>
                          {getTrendIcon(marketSignals.rentGrowth.trend)}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">3-Year Growth</span>
                        <span className="font-light text-black">
                          {marketSignals.rentGrowth.projected3Year > 0 ? '+' : ''}
                          {marketSignals.rentGrowth.projected3Year}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Confidence Level</span>
                        <div className="flex items-center gap-2">
                          <Progress value={marketSignals.rentGrowth.confidence} className="w-16" />
                          <span className="text-xs font-light text-black">
                            {marketSignals.rentGrowth.confidence}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Absorption Analysis */}
                  <Card className="border-gold-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg font-light text-black">
                        <Target className="h-5 w-5 text-gold-600" />
                        Absorption Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Absorption Rate</span>
                        <span className="font-light text-black">
                          {marketSignals.absorption.rate}% annually
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Time to Stabilization</span>
                        <span className="font-light text-black">
                          {marketSignals.absorption.timeToStabilization} months
                        </span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Demand Drivers:</p>
                        <div className="space-y-1">
                          {marketSignals.absorption.demandDrivers.map((driver, index) => (
                            <div key={index} className="text-xs text-black">
                              • {driver}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Vacancy Trends */}
                  <Card className="border-gold-200 md:col-span-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg font-light text-black">
                        <Activity className="h-5 w-5 text-gold-600" />
                        Vacancy Trends & Market Comparison
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-2">Current Vacancy</div>
                          <div className="text-2xl font-light text-black">
                            {marketSignals.vacancy.current}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-2">Projected Vacancy</div>
                          <div className="text-2xl font-light text-black">
                            {marketSignals.vacancy.projected}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-2">Market Comparison</div>
                          <Badge className="text-sm px-3 py-1 bg-gold-100 text-gold-800">
                            {marketSignals.vacancy.marketComparison} market avg
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Data Sources */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Data sources: CoStar Group, U.S. Census Bureau, Local Authorities
            </span>
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <a
                href="https://costar.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                View CoStar Data <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}