import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FinanceCalculatorProps {
  property: {
    propertyValue?: number;
    projectedRentalIncome?: number;
    projectedAnnualIncomeApr?: number;
    estimatedTotalReturnIRR?: number;
    targetedIRR?: number;
    valueGrowth?: number;
    pricePerToken?: number;
    totalTokens?: number;
  };
  mode?: 'full' | 'calculator-only';
}

export default function FinanceCalculator({ property, mode = 'full' }: FinanceCalculatorProps) {
  const [activeTab, setActiveTab] = useState<'finance' | 'calculator'>('finance');
  
  // Calculator state
  const [tokens, setTokens] = useState(0);
  const [usdAmount, setUsdAmount] = useState(0);
  const [timeHorizon, setTimeHorizon] = useState([24]); // in months, default 24 months (2 years)
  
  // Finance tab data
  const propertyPrice = property.propertyValue || 729400;
  const irr = property.estimatedTotalReturnIRR ?? property.targetedIRR;
  const apr = property.projectedAnnualIncomeApr;
  const rentalIncome = property.projectedRentalIncome;
  const valueGrowth = property.valueGrowth;
  
  // Calculator functions
  const handleTokenChange = (value: string) => {
    const tokenValue = parseInt(value) || 0;
    setTokens(tokenValue);
    setUsdAmount(tokenValue * (property.pricePerToken || 1));
  };

  const handleUsdChange = (value: string) => {
    const usdValue = parseFloat(value) || 0;
    setUsdAmount(usdValue);
    setTokens(Math.floor(usdValue / (property.pricePerToken || 1)));
  };

  const calculateProjections = () => {
    const investment = usdAmount;
    const months = timeHorizon[0];
    const years = months / 12;
    
    // Calculate value growth over time - only if valueGrowth is defined
    const valueGrowthAmount = valueGrowth !== undefined ? investment * (valueGrowth / 100) * years : 0;
    
    // Calculate rental income over time - only if rentalIncome is defined
    const annualRentalReturn = rentalIncome !== undefined ? investment * (rentalIncome / 100) : 0;
    const totalRentalIncome = annualRentalReturn * years;
    
    // Final balance calculation
    const finalBalance = investment + valueGrowthAmount + totalRentalIncome;
    
    return {
      actualInvestment: investment,
      projectedTotalIncome: valueGrowthAmount + totalRentalIncome,
      valueGrowthAmount,
      rentalIncomeAmount: totalRentalIncome,
      finalBalance
    };
  };

  const projections = calculateProjections();

  // If calculator-only mode, render just the calculator content
  if (mode === 'calculator-only') {
    return (
      <TooltipProvider>
        <div className="space-y-6">
          {/* Token and USD Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="usd" className="text-sm text-gray-600">USD</Label>
              <Input
                id="usd"
                type="number"
                value={usdAmount || ''}
                onChange={(e) => handleUsdChange(e.target.value)}
                placeholder="0"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="tokens" className="text-sm text-gray-600">Token</Label>
              <Input
                id="tokens"
                type="number"
                value={tokens || ''}
                onChange={(e) => handleTokenChange(e.target.value)}
                placeholder="0"
                className="mt-1"
              />
            </div>
          </div>

          {/* Time Horizon Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>1/mo</span>
              <span className="text-black font-semibold">{timeHorizon[0]}/mo</span>
              <span>15/y</span>
            </div>
            <Slider
              value={timeHorizon}
              onValueChange={setTimeHorizon}
              max={180} // 15 years
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Investment Summary */}
          <div className="space-y-3">
            <div className="text-sm text-gray-600">Tokens issued to you</div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Investment</span>
              <span className="font-semibold text-black">
                ${projections.actualInvestment.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Expected Return</span>
              <span className="font-semibold text-black">
                ${projections.projectedTotalIncome.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Value Growth and Rental Income Cards */}
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Investment Return</div>
              <div className="text-lg font-bold text-gray-900">
                ${projections.valueGrowthAmount.toFixed(2)}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Rental income</div>
              <div className="text-lg font-bold text-gray-900">
                ${projections.rentalIncomeAmount.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Final Balance */}
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Ending Balance (USD)</div>
            <div className="text-2xl font-bold text-gray-900">
              ${projections.finalBalance.toFixed(2)}
            </div>
          </div>

          {/* Notify Button */}
          <Button className="w-full bg-gray-400 hover:bg-gray-500 text-white">
            Add Me to The Launch List
          </Button>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-0">
          {/* Tab Headers */}
          <div className="flex">
            <Button
              variant="ghost"
              className={cn(
                "flex-1 rounded-none border-b-2 py-4",
                activeTab === 'finance' 
                  ? "bg-blue-500 text-white border-blue-500" 
                  : "bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200"
              )}
              onClick={() => setActiveTab('finance')}
            >
              Financials
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "flex-1 rounded-none border-b-2 py-4",
                activeTab === 'calculator' 
                  ? "bg-blue-500 text-white border-blue-500" 
                  : "bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200"
              )}
              onClick={() => setActiveTab('calculator')}
            >
              Forecast
            </Button>
          </div>

          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-[400px]">
            {activeTab === 'finance' ? (
              // Finance Tab Content
              <div className="space-y-6">
                {/* Property Price */}
                <div className="text-center">
                  <Label className="text-sm text-gray-600">Property price</Label>
                  <div className="text-2xl font-bold text-black">
                    ${propertyPrice.toLocaleString()}
                  </div>
                </div>

                {/* IRR and APR - Vertical Layout */}
                <div className="space-y-4">
                  {irr !== undefined && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-600">IRR</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Internal Rate of Return</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="text-xl font-bold text-black">{irr}%</div>
                    </div>
                  )}

                  {apr !== undefined && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-600">APR</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Annual Percentage Rate</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="text-xl font-bold text-black">{apr}%</div>
                    </div>
                  )}
                </div>

                {/* Rental Income and Value Growth */}
                <div className="grid grid-cols-2 gap-6">
                  {rentalIncome !== undefined && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-sm text-gray-600">Rental income</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="h-3 w-3 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Expected annual rental yield</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="text-lg font-bold text-black">{rentalIncome}%</div>
                    </div>
                  )}
                  
                  {valueGrowth !== undefined && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-sm text-gray-600">Growth Value</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="h-3 w-3 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Expected annual property value growth</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="text-lg font-bold text-black">{valueGrowth}%</div>
                    </div>
                  )}
                </div>

                {/* Notify Button */}
                <Button className="w-full bg-gray-400 hover:bg-gray-500 text-white">
                  Add Me to The Launch List
                </Button>
              </div>
            ) : (
              // Calculator Tab Content
              <div className="space-y-6">
                {/* Token and USD Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="usd" className="text-sm text-gray-600">USD</Label>
                    <Input
                      id="usd"
                      type="number"
                      value={usdAmount || ''}
                      onChange={(e) => handleUsdChange(e.target.value)}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tokens" className="text-sm text-gray-600">Token</Label>
                    <Input
                      id="tokens"
                      type="number"
                      value={tokens || ''}
                      onChange={(e) => handleTokenChange(e.target.value)}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Time Horizon Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>1/mo</span>
                    <span className="text-blue-600 font-semibold">{timeHorizon[0]}/mo</span>
                    <span>15/y</span>
                  </div>
                  <Slider
                    value={timeHorizon}
                    onValueChange={setTimeHorizon}
                    max={180} // 15 years
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Investment Summary */}
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">Tokens issued to you</div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Investment</span>
                    <span className="font-semibold text-black">
                      ${projections.actualInvestment.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Expected Return</span>
                    <span className="font-semibold text-black">
                      ${projections.projectedTotalIncome.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Value Growth and Rental Income Cards */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Investment Return</div>
                    <div className="text-lg font-bold text-gray-900">
                      ${projections.valueGrowthAmount.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Rental income</div>
                    <div className="text-lg font-bold text-gray-900">
                      ${projections.rentalIncomeAmount.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Final Balance */}
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">Ending Balance (USD)</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${projections.finalBalance.toFixed(2)}
                  </div>
                </div>

                {/* Notify Button */}
                <Button className="w-full bg-gray-400 hover:bg-gray-500 text-white">
                  Add Me to The Launch List
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}