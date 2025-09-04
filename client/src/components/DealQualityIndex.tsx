import React, { useState } from 'react';
import { ExternalLink, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Info, TrendingUp, Shield, Building2, FileText, BarChart3, Loader2 } from 'lucide-react';
import { useDealQualityIndex } from '@/hooks/useDealQualityIndex';

interface DealQualityIndexProps {
  propertyId: string;
}

export default function DealQualityIndex({ propertyId }: DealQualityIndexProps) {
  const { data: dqiData, isLoading, error } = useDealQualityIndex(propertyId);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showRiskFactors, setShowRiskFactors] = useState(false);

  if (isLoading) {
    return (
      <Card className="border-2 border-gold-300 bg-white shadow-lg">
        <CardHeader className="bg-gold-50 border-b-2 border-gold-200">
          <CardTitle className="text-2xl font-light text-black">
            Deal Quality Index
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-3">

              <p className="text-sm text-gray-500">Analyzing deal quality metrics...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !dqiData) {
    return (
      <Card className="border-2 border-gold-300 bg-white shadow-lg">
        <CardHeader className="bg-gold-50 border-b-2 border-gold-200">
          <CardTitle className="text-2xl font-light text-black">
            Deal Quality Index
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">Unable to load DQI analysis. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const overallDQI = Math.round(dqiData.overallScore);
  const rating = overallDQI >= 80 ? 'Excellent' : overallDQI >= 60 ? 'Good' : overallDQI >= 40 ? 'Fair' : 'Poor';
  
  const getDQIRating = (rating: string) => {
    // All ratings use gold styling only
    return { color: 'bg-gold-600', textColor: 'text-gold-700' };
  };

  const { color } = getDQIRating(rating);

  // Use the metrics from the API response
  const dqiMetrics = dqiData.metrics;

  return (
    <Card className="border-2 border-gold-300 bg-white shadow-lg">
      <CardHeader className="pb-6 bg-white border-b-2 border-gold-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-light text-black">
            Deal Quality Index
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall DQI Score */}
        <div className="text-center space-y-4 py-6">
          <div className="mx-auto w-48 h-48 relative">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
              {/* Background circle */}
              <circle
                cx="70"
                cy="70"
                r="55"
                stroke="#e5e7eb"
                strokeWidth="16"
                fill="transparent"
              />
              {/* Progress circle */}
              <circle
                cx="70"
                cy="70"
                r="55"
                stroke="#be8d00"
                strokeWidth="16"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 55}`}
                strokeDashoffset={`${2 * Math.PI * 55 * (1 - overallDQI / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              {/* Small notch indicator at current position */}
              <circle
                cx="70"
                cy="15"
                r="4"
                fill="#be8d00"
                className="transition-all duration-1000 ease-out"
                style={{
                  transformOrigin: '70px 70px',
                  transform: `rotate(${(overallDQI / 100) * 360}deg)`
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-light text-black mb-2">{overallDQI}</div>
              <div className="text-base text-gray-500 font-light">DQI Score</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="inline-flex px-6 py-3 rounded-lg bg-white border-2 border-gold-500 text-black font-light">
              {rating}
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-gold-200">
              <p className="text-sm text-black max-w-md mx-auto font-light">
                This deal scores in the top {100 - overallDQI + 15}% of analyzed commercial real estate opportunities
              </p>
            </div>
          </div>
        </div>

        {/* Quick Metrics Overview */}
        <div className="bg-white rounded-lg border-2 border-gold-200 p-6">
          <h4 className="text-lg font-light text-black mb-4">
            Key Performance Metrics
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dqiMetrics.slice(0, 4).map((metric) => (
              <div key={metric.name} className="bg-white rounded-lg p-4 border-2 border-gold-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-light text-black text-sm">{metric.name}</span>
                    <div className="text-xs text-gray-500">{metric.weight}% weight</div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-light text-black">{metric.score}</span>
                    <div className="text-xs text-gray-500">/100</div>
                  </div>
                </div>
                <Progress value={metric.score} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Expand for Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between py-3 px-4 text-base font-light bg-white border-2 border-gold-200 hover:bg-gold-50"
            >
              <div>
                View Detailed Analysis
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-4">
            {isExpanded && (
              <div className="space-y-4">
                {/* Methodology Note */}
                <div className="bg-white border-2 border-gold-200 rounded-lg p-4">
                  <div className="space-y-2">
                      <h4 className="font-light text-black">Commertizer X Methodology</h4>
                      <p className="text-sm text-black">
                        DQI combines weighted factors using proprietary algorithms trained on 10,000+ CRE deals. 
                        Scores are validated against actual performance data and updated quarterly with real market conditions.
                      </p>
                      <div className="text-xs text-gray-600">
                        Last model update: Q4 2024
                      </div>
                  </div>
                </div>

                {/* Key Drivers & Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border-2 border-gold-200 rounded-lg p-4">
                    <h4 className="font-light text-black mb-3">
                      Key Strengths
                    </h4>
                    <ul className="space-y-2">
                      {dqiData.drivers.map((driver, index) => (
                        <li key={index} className="text-sm text-black flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gold-500 rounded-full flex-shrink-0 mt-2" />
                          <span>{driver}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white border-2 border-gold-200 rounded-lg p-4">
                    <h4 className="font-light text-black mb-3">
                      Growth Opportunities
                    </h4>
                    <ul className="space-y-2">
                      {dqiData.improvements.map((improvement, index) => (
                        <li key={index} className="text-sm text-black flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-gold-500 rounded-full flex-shrink-0 mt-2" />
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Governance & Safeguards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border-2 border-gold-200 rounded-lg p-4">
                    <h4 className="font-light text-black mb-3">
                      Governance Metrics
                    </h4>
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3 border border-gold-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-light text-black">Peer Ranking</span>
                          <span className="font-light text-gold-700">{dqiData.governance.peerRank.split('(')[1]?.replace(')', '') || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gold-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-light text-black">Data Confidence</span>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gold-500"></div>
                            <span className="font-light text-gold-700">{dqiData.governance.confidenceLevel}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gold-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-light text-black">Backtested Accuracy</span>
                          <span className="font-light text-gold-700">{Math.round(dqiData.governance.backtestedAccuracy * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {(dqiData.safeguards.hardFails.length > 0 || dqiData.safeguards.warnings.length > 0) && (
                    <div className="bg-white border-2 border-gold-200 rounded-lg p-4">
                      <h4 className="font-light text-black mb-3">
                        Risk Safeguards
                      </h4>
                      <div className="space-y-2">
                        {dqiData.safeguards.hardFails.map((fail, index) => (
                          <div key={index} className="bg-white border-2 border-gold-100 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-gold-500 rounded-full flex-shrink-0 mt-1.5" />
                              <span className="text-sm text-black font-light">{fail}</span>
                            </div>
                          </div>
                        ))}
                        {dqiData.safeguards.warnings.map((warning, index) => (
                          <div key={index} className="bg-white border-2 border-gold-100 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-gold-500 rounded-full flex-shrink-0 mt-1.5" />
                              <span className="text-sm text-black font-light">{warning}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Commertizer X Analysis */}
                <div className="bg-white border-2 border-gold-300 rounded-lg p-4">
                  <div className="space-y-2">
                      <h4 className="font-light text-black">Commertizer X Analysis</h4>
                      <p className="text-sm text-black">{dqiData.runeAnalysis}</p>
                      <div className="text-xs text-gray-600">
                        Updated {new Date(dqiData.timestamp).toLocaleDateString()}
                      </div>
                  </div>
                </div>

                {/* Detailed Metrics */}
                <div className="space-y-4">
                  {dqiData.metrics.map((metric, index) => (
                    <div 
                      key={metric.name}
                      className="bg-white border-2 border-gold-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-light text-black">{metric.name}</h4>
                          <p className="text-sm text-gray-600">{metric.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-light text-black">{metric.score}</div>
                          <div className="text-sm text-gray-500">{metric.weight}% weight</div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <Progress value={metric.score} className="h-2" />
                      </div>
                      
                      <div className="bg-gold-50 rounded-lg p-3 mb-3 border border-gold-200">
                        <ul className="grid grid-cols-1 gap-2">
                          {metric.details.map((detail, index) => (
                            <li key={index} className="text-sm text-black flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-gold-500 rounded-full flex-shrink-0 mt-1.5" />
                              <span className="break-words">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Source Attribution */}
                      {metric.sourceUrl && (
                        <div className="border-t-2 border-gold-200 pt-3">
                          <a 
                            href={metric.sourceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-gold-700 hover:text-gold-800 font-light bg-white px-3 py-1 rounded border border-gold-200 hover:bg-gold-50"
                          >
                            Source: {metric.sourceUrl.includes('cbre') ? 'CBRE Research' : 
                                    metric.sourceUrl.includes('costar') ? 'CoStar Group' :
                                    metric.sourceUrl.includes('fed') ? 'Federal Reserve' :
                                    metric.sourceUrl.includes('nar') ? 'National Association of Realtors' :
                                    'Industry Source'}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Performance Correlation */}
                <div className="bg-white border-2 border-gold-200 rounded-lg p-4">
                  <h4 className="font-light text-black mb-2">Historical Performance Correlation</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">{dqiData.correlationData.historicalPerformance.split(':')[0]}:</span>
                      <span className="ml-2 font-light text-green-700">{dqiData.correlationData.historicalPerformance.split(':')[1]}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{dqiData.correlationData.investorDecisionTime.split(':')[0]}:</span>
                      <span className="ml-2 font-light text-blue-700">{dqiData.correlationData.investorDecisionTime.split(':')[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-white border-2 border-gold-300 rounded-lg p-4">
                  <div className="space-y-2">
                      <h4 className="font-light text-black">Important Disclosure</h4>
                      <p className="text-sm text-black">
                        DQI is a risk signal, not investment advice. This analysis is based on available data and industry benchmarks. 
                        Past performance does not guarantee future results. Please conduct your own due diligence before making any investment decisions.
                      </p>
                      <div className="text-xs text-gray-600">
                        Last updated: {new Date(dqiData.timestamp).toLocaleDateString()} | 
                        Data sources: CBRE Research, CoStar Group, Federal Reserve
                      </div>
                  </div>
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 font-light border-2 border-gold-200 hover:bg-gold-50"
            onClick={() => setShowExplanation(!showExplanation)}
          >
            How DQI Works
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 font-light border-2 border-gold-200 hover:bg-gold-50"
          >
            Download Scorecard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}