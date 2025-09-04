import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface ScenarioSimulatorProps {
  propertyId: string;
}

interface ScenarioData {
  conservative: {
    rentGrowth: number;
    expenses: number;
    exitCapRate: number;
    projectedValue: number;
    irr: number;
  };
  base: {
    rentGrowth: number;
    expenses: number;
    exitCapRate: number;
    projectedValue: number;
    irr: number;
  };
  aggressive: {
    rentGrowth: number;
    expenses: number;
    exitCapRate: number;
    projectedValue: number;
    irr: number;
  };
}

export default function ScenarioSimulator({ propertyId }: ScenarioSimulatorProps) {
  const [rentGrowth, setRentGrowth] = useState([3.2]);
  const [expenseGrowth, setExpenseGrowth] = useState([2.8]);
  const [exitCapRate, setExitCapRate] = useState([7.5]);

  const { data: scenarioData } = useQuery<ScenarioData>({
    queryKey: ['scenario-analysis', propertyId, rentGrowth[0], expenseGrowth[0], exitCapRate[0]],
    queryFn: async () => {
      const response = await fetch(`/api/commertizer-x/scenario-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          userInputs: {
            rentGrowth: rentGrowth[0],
            expenseGrowth: expenseGrowth[0],
            exitCapRate: exitCapRate[0]
          }
        })
      });
      if (!response.ok) throw new Error('Failed to fetch scenario analysis');
      const result = await response.json();
      return result.data;
    },
    refetchInterval: 5000
  });

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600 mb-4">
        Commertizer X scenario modeling with conservative, base, and aggressive forecasts. 
        Adjust sliders to test sensitivity to key variables.
      </p>
      
      {/* User Controls */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="text-sm font-light text-black block mb-2">
            Annual Rent Growth: {rentGrowth[0]}%
          </label>
          <Slider
            value={rentGrowth}
            onValueChange={setRentGrowth}
            max={8}
            min={0}
            step={0.1}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="text-sm font-light text-black block mb-2">
            Annual Expense Growth: {expenseGrowth[0]}%
          </label>
          <Slider
            value={expenseGrowth}
            onValueChange={setExpenseGrowth}
            max={6}
            min={0}
            step={0.1}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="text-sm font-light text-black block mb-2">
            Exit Cap Rate: {exitCapRate[0]}%
          </label>
          <Slider
            value={exitCapRate}
            onValueChange={setExitCapRate}
            max={12}
            min={4}
            step={0.1}
            className="w-full"
          />
        </div>
      </div>

      {/* Scenario Results */}
      {scenarioData ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Badge variant="outline" className="mb-2">Conservative</Badge>
              <div className="space-y-2">
                <div>
                  <div className="text-lg sm:text-xl font-logo font-light text-[#be8d00]">
                    ${scenarioData.conservative.projectedValue.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">5-Year Value</div>
                </div>
                <div>
                  <div className="text-base sm:text-lg font-logo font-light text-[#be8d00]">
                    {scenarioData.conservative.irr}%
                  </div>
                  <div className="text-xs text-gray-600">IRR</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Badge className="mb-2 bg-[#be8d00] text-white">Base Case</Badge>
              <div className="space-y-2">
                <div>
                  <div className="text-lg sm:text-xl font-logo font-light text-[#be8d00]">
                    ${scenarioData.base.projectedValue.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">5-Year Value</div>
                </div>
                <div>
                  <div className="text-base sm:text-lg font-logo font-light text-[#be8d00]">
                    {scenarioData.base.irr}%
                  </div>
                  <div className="text-xs text-gray-600">IRR</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Badge variant="outline" className="mb-2">Aggressive</Badge>
              <div className="space-y-2">
                <div>
                  <div className="text-lg sm:text-xl font-logo font-light text-[#be8d00]">
                    ${scenarioData.aggressive.projectedValue.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">5-Year Value</div>
                </div>
                <div>
                  <div className="text-base sm:text-lg font-logo font-light text-[#be8d00]">
                    {scenarioData.aggressive.irr}%
                  </div>
                  <div className="text-xs text-gray-600">IRR</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-600">Loading scenario analysis...</p>
        </div>
      )}
    </div>
  );
}