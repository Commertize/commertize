import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ExpenseBenchmarkingProps {
  propertyId: string;
}

interface ExpenseData {
  totalOpex: number;
  opexPsf: number;
  marketAverage: number;
  percentile: number;
  categories: Array<{
    category: string;
    actual: number;
    market: number;
    variance: number;
    flag: 'normal' | 'above_market' | 'below_market';
  }>;
  outliers: Array<{
    category: string;
    actual: number;
    market: number;
    variance: number;
    impact: string;
  }>;
}

export default function ExpenseBenchmarking({ propertyId }: ExpenseBenchmarkingProps) {
  const { data: expenseData } = useQuery<ExpenseData>({
    queryKey: ['expense-benchmarking', propertyId],
    queryFn: async () => {
      const response = await fetch(`/api/commertizer-x/expense-benchmarking/${propertyId}`);
      if (!response.ok) throw new Error('Failed to fetch expense benchmarking');
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 30000
  });

  const getVarianceIcon = (variance: number) => {
    if (variance > 15) return <TrendingUp className="w-4 h-4 text-red-600" />;
    if (variance < -15) return <TrendingDown className="w-4 h-4 text-green-600" />;
    return null;
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 15) return 'text-red-600';
    if (variance < -15) return 'text-green-600';
    return 'text-gray-600';
  };

  const getFlagColor = (flag: string) => {
    switch (flag) {
      case 'above_market': return 'bg-red-100 text-red-800 border-red-200';
      case 'below_market': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!expenseData) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-600">Analyzing expense benchmarks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Commertizer X compares property expenses against market data, identifying outliers and optimization opportunities.
      </p>

      {/* Overall Performance */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-logo font-light text-[#be8d00] mb-1">
              ${expenseData.opexPsf.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">OPEX per SF</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-logo font-light text-[#be8d00] mb-1">
              ${expenseData.marketAverage.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Market Average</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-logo font-light text-[#be8d00] mb-1">
              {expenseData.percentile}th
            </div>
            <div className="text-sm text-gray-600">Percentile</div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-logo font-light text-black mb-4">Expense Category Analysis</h4>
          <div className="space-y-4">
            {expenseData.categories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-light text-black">{category.category}</span>
                  <div className="flex items-center space-x-2">
                    {getVarianceIcon(category.variance)}
                    <Badge variant="outline" className={getFlagColor(category.flag)}>
                      {category.variance > 0 ? '+' : ''}{category.variance}%
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Actual: </span>
                    <span className="font-light text-[#be8d00]">
                      ${category.actual.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Market: </span>
                    <span className="font-light">
                      ${category.market.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <Progress 
                  value={Math.min(100, (category.actual / category.market) * 100)} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Outliers & Optimization Opportunities */}
      {expenseData.outliers.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-logo font-light text-black mb-4 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-yellow-600" />
              Optimization Opportunities
            </h4>
            <div className="space-y-3">
              {expenseData.outliers.map((outlier, index) => (
                <div key={index} className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-light text-black">{outlier.category}</span>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      {outlier.variance > 0 ? '+' : ''}{outlier.variance}%
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{outlier.impact}</p>
                  <div className="text-sm">
                    <span className="text-gray-600">Potential Savings: </span>
                    <span className="font-light text-[#be8d00]">
                      ${(outlier.actual - outlier.market).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}