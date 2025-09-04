import React, { useState, useEffect } from "react";
import { CommertizerX, type CalcInputs } from "@/lib/commertizerXClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface InvestmentCalculatorProps {
  property?: {
    propertyValue?: number;
    netOperatingIncome?: number;
    capRate?: number;
    targetedIRR?: number;
    estimatedTotalReturnIRR?: number;
    type?: string;
    location?: string;
  };
}

export default function InvestmentCalculator({ property }: InvestmentCalculatorProps) {
  const { toast } = useToast();
  
  // Helper function to get intelligent defaults based on property data
  const getIntelligentDefaults = (): CalcInputs => {
    // Calculate exit cap based on current cap rate or use property type defaults
    let exitCap = 0.060; // default
    if (property?.capRate) {
      exitCap = property.capRate + 0.005; // slightly higher for exit
    } else if (property?.type) {
      // Property type-based exit cap estimates
      const typeDefaults: { [key: string]: number } = {
        'office': 0.065,
        'retail': 0.070,
        'industrial': 0.060,
        'multifamily': 0.055,
        'mixed-use': 0.065
      };
      exitCap = typeDefaults[property.type.toLowerCase()] || 0.060;
    }

    // Location-based interest rate adjustments
    let interestRate = 0.065; // base rate
    if (property?.location?.toLowerCase().includes('san francisco') || 
        property?.location?.toLowerCase().includes('new york')) {
      interestRate = 0.060; // lower rates for tier 1 cities
    }

    return {
      purchasePrice: property?.propertyValue || 10_000_000,
      equityPct: 0.40,
      interestRate,
      amortYears: 30,
      holdYears: 5,
      noiY1: property?.netOperatingIncome || (property?.propertyValue ? property.propertyValue * 0.065 : 650_000),
      noiGrowth: 0.025,
      exitCap,
    };
  };

  const [inputs, setInputs] = useState<CalcInputs>(getIntelligentDefaults());
  
  // Update inputs when property data changes
  useEffect(() => {
    if (property) {
      const newDefaults = getIntelligentDefaults();
      setInputs(prev => ({
        ...prev,
        purchasePrice: property.propertyValue || prev.purchasePrice,
        noiY1: property.netOperatingIncome || newDefaults.noiY1,
        exitCap: newDefaults.exitCap,
        interestRate: newDefaults.interestRate,
      }));
    }
  }, [property?.propertyValue, property?.netOperatingIncome, property?.capRate, property?.type, property?.location]);
  const [explain, setExplain] = useState<{summary:string; bullets:string[]; sensitivities?:string[]} | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function onAssumptions() {
    console.log("onAssumptions clicked");
    setBusy("Assumptions");
    try {
      console.log("Calling suggestAssumptions with:", inputs);
      const sugg = await CommertizerX.suggestAssumptions(inputs);
      console.log("Got suggestions:", sugg);
      setInputs(prev => ({ ...prev, ...sugg }));
      toast({
        title: "Assumptions Updated",
        description: `Updated: NOI Growth ${(sugg.noiGrowth * 100).toFixed(1)}%, Exit Cap ${(sugg.exitCap * 100).toFixed(1)}%`,
      });
    } catch (error) {
      console.error("Error in onAssumptions:", error);
      toast({
        title: "Error",
        description: `Failed to generate assumptions: ${error.message}`,
        variant: "destructive",
      });
    }
    setBusy(null);
  }

  async function onScenarios() {
    console.log("onScenarios clicked");
    setBusy("Scenarios");
    try {
      console.log("Generating scenarios for:", inputs);
      const scenarios = await CommertizerX.generateScenarios(inputs);
      console.log("Generated scenarios:", scenarios);
      
      // Show all scenarios in toast and apply conservative
      const conservative = scenarios.find(s => s.label === "Conservative");
      if (conservative) setInputs(prev => ({ ...prev, ...conservative.inputs }));
      
      toast({
        title: "Scenarios Generated",
        description: "Applied Conservative scenario. Check console for all scenarios.",
      });
    } catch (error) {
      console.error("Error in onScenarios:", error);
      toast({
        title: "Error",
        description: `Failed to generate scenarios: ${error.message}`,
        variant: "destructive",
      });
    }
    setBusy(null);
  }

  async function onExplain() {
    console.log("onExplain clicked");
    setBusy("Explain");
    try {
      const outputs = computeOutputs(inputs);
      console.log("Computed outputs:", outputs);
      const e = await CommertizerX.explainResults(inputs, outputs);
      console.log("Got explanation:", e);
      setExplain(e);
      toast({
        title: "Analysis Complete",
        description: "Investment explanation generated below.",
      });
    } catch (error) {
      console.error("Error in onExplain:", error);
      toast({
        title: "Error",
        description: `Failed to explain results: ${error.message}`,
        variant: "destructive",
      });
    }
    setBusy(null);
  }

  async function onOptimize() {
    console.log("onOptimize clicked");
    setBusy("Optimize");
    try {
      console.log("Optimizing for IRR with:", inputs);
      const upd = await CommertizerX.optimizeForIRR(inputs, 0.15);
      console.log("Got optimization updates:", upd);
      setInputs(prev => ({ ...prev, ...upd }));
      toast({
        title: "Optimization Complete",
        description: `Optimized equity to ${(upd.equityPct * 100).toFixed(0)}% for 15% IRR target.`,
      });
    } catch (error) {
      console.error("Error in onOptimize:", error);
      toast({
        title: "Error",
        description: `Failed to optimize investment: ${error.message}`,
        variant: "destructive",
      });
    }
    setBusy(null);
  }

  async function onValidate() {
    console.log("onValidate clicked");
    setBusy("Validate");
    try {
      console.log("Validating inputs:", inputs);
      const res = await CommertizerX.validate(inputs);
      console.log("Validation results:", res);
      const messages = [...res.errors, ...res.warnings];
      if (messages.length > 0) {
        toast({
          title: "Risk Assessment",
          description: messages.join(" • "),
          variant: res.errors.length > 0 ? "destructive" : "default",
        });
      } else {
        toast({
          title: "Risk Assessment",
          description: "✅ No significant risks identified. Investment parameters look solid.",
        });
      }
    } catch (error) {
      console.error("Error in onValidate:", error);
      toast({
        title: "Error",
        description: `Failed to validate investment: ${error.message}`,
        variant: "destructive",
      });
    }
    setBusy(null);
  }

  // Real-time calculation that updates immediately when inputs change
  const out = React.useMemo(() => computeOutputs(inputs), [inputs]);
  
  // Real-time validation
  const validation = React.useMemo(() => {
    const warnings: string[] = [];
    if (inputs.equityPct < 0.25) warnings.push("Low equity increases risk");
    if (inputs.exitCap < inputs.interestRate) warnings.push("Exit cap below interest rate");
    if (out.irr < 0.08) warnings.push("IRR below market expectations");
    return warnings;
  }, [inputs, out]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 lg:gap-8">
      {/* Left: Inputs + Results */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Investment Inputs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <NumberField 
                label="Purchase Price" 
                value={inputs.purchasePrice} 
                onChange={v=>setInputs({...inputs, purchasePrice:v})} 
                prefix="$"
              />
              <PercentField 
                label="Equity %" 
                value={inputs.equityPct} 
                onChange={v=>setInputs({...inputs, equityPct:v})}
              />
              <PercentField 
                label="Interest Rate (APR)" 
                value={inputs.interestRate} 
                onChange={v=>setInputs({...inputs, interestRate:v})}
              />
              <NumberField 
                label="Amortization (years)" 
                value={inputs.amortYears} 
                onChange={v=>setInputs({...inputs, amortYears:v})}
              />
              <NumberField 
                label="Hold Period (years)" 
                value={inputs.holdYears} 
                onChange={v=>setInputs({...inputs, holdYears:v})}
              />
              <NumberField 
                label="NOI (Year 1)" 
                value={inputs.noiY1} 
                onChange={v=>setInputs({...inputs, noiY1:v})} 
                prefix="$"
              />
              <PercentField 
                label="NOI Growth (annual)" 
                value={inputs.noiGrowth} 
                onChange={v=>setInputs({...inputs, noiGrowth:v})}
              />
              <PercentField 
                label="Exit Cap Rate" 
                value={inputs.exitCap} 
                onChange={v=>setInputs({...inputs, exitCap:v})}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Investment Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <Kpi 
                label="IRR" 
                value={`${(out.irr*100).toFixed(1)}%`} 
                warning={out.irr < 0.08}
              />
              <Kpi 
                label="Year-1 CoC" 
                value={`${(out.coc*100).toFixed(1)}%`} 
                warning={out.coc < 0.06}
              />
              <Kpi 
                label="Equity Multiple" 
                value={`${out.em.toFixed(2)}×`} 
                warning={out.em < 1.5}
              />
              <Kpi 
                label="Annual Debt Service" 
                value={fmt(out.annualDebt)} 
              />
            </div>
            
            {validation.length > 0 && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="text-sm text-amber-800">
                  ⚠️ Considerations: {validation.join(" • ")}
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onExplain}
                disabled={busy === "Explain"}
              >
                Ask X: Explain IRR
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onScenarios}
                disabled={busy === "Scenarios"}
              >
                Ask X: Scenarios
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onValidate}
                disabled={busy === "Validate"}
              >
                Ask X: Risk Check
              </Button>
            </div>
            
            {explain && (
              <div className="mt-4 rounded-xl border p-4 bg-gray-50 text-sm text-gray-700">
                <div className="mb-2">{explain.summary}</div>
                <ul className="list-disc pl-4 space-y-1 mb-2">
                  {explain.bullets.map((b,i)=><li key={i}>{b}</li>)}
                </ul>
                {explain.sensitivities?.length ? (
                  <div className="text-gray-600 text-xs">
                    Sensitivities: {explain.sensitivities.join(" · ")}
                  </div>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right: Commertizer X panel */}
      <aside className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-[#be8d00]">Commertizer X</CardTitle>
              {busy && <span className="text-xs text-gray-500">Working: {busy}…</span>}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 mb-4">
              <Button 
                variant="outline" 
                onClick={onAssumptions}
                disabled={!!busy}
                className="justify-start"
              >
                Auto-Fill Assumptions
              </Button>
              <Button 
                variant="outline" 
                onClick={onScenarios}
                disabled={!!busy}
                className="justify-start"
              >
                Generate 3 Scenarios
              </Button>
              <Button 
                variant="outline" 
                onClick={onOptimize}
                disabled={!!busy}
                className="justify-start"
              >
                Optimize to 15% IRR
              </Button>
              <Button 
                variant="outline" 
                onClick={onExplain}
                disabled={!!busy}
                className="justify-start"
              >
                Explain These Results
              </Button>
              <Button 
                variant="outline" 
                onClick={onValidate}
                disabled={!!busy}
                className="justify-start"
              >
                Run Risk Assessment
              </Button>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              AI-assisted estimates only. Not investment advice.
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

/* ------- UI Helper Components ------- */
function Kpi({label, value, warning}:{label:string; value:string; warning?: boolean}) {
  return (
    <div className={`rounded-xl border p-4 shadow-sm transition-colors ${
      warning ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'
    }`}>
      <div className={`text-xs uppercase tracking-wide mb-1 ${
        warning ? 'text-amber-600' : 'text-gray-500'
      }`}>{label}</div>
      <div className={`text-xl ${
        warning ? 'text-amber-800' : 'text-gray-900'
      }`}>{value}</div>
    </div>
  );
}

function NumberField({label, value, onChange, prefix}:{label:string; value:number; onChange:(v:number)=>void; prefix?:string}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-gray-600">{label}</Label>
      <Input
        value={value.toLocaleString()}
        onChange={e=>onChange(Number((e.target.value || "0").replace(/[^0-9.]/g,"")))}
        inputMode="decimal"
        placeholder="0"
        className="rounded-xl"
      />
    </div>
  );
}

function PercentField({label, value, onChange}:{label:string; value:number; onChange:(v:number)=>void}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-gray-600">{label}</Label>
      <Input
        value={(value*100).toFixed(2)}
        onChange={e=>onChange(Number(e.target.value)/100)}
        inputMode="decimal"
        placeholder="0.00"
        className="rounded-xl"
      />
    </div>
  );
}

function fmt(n:number){ return n.toLocaleString(undefined,{style:"currency",currency:"USD",maximumFractionDigits:0}); }

function pmt(rate:number, nper:number, pv:number){ 
  return (rate*pv)/(1-Math.pow(1+rate,-nper)); 
}

function computeOutputs(i: CalcInputs){
  const monthly = i.interestRate/12;
  const n = i.amortYears*12;
  const loan = i.purchasePrice*(1-i.equityPct);
  const pay = pmt(monthly,n,loan);
  const annualDebt = pay*12;
  
  // Build cashflows for IRR
  const flows: number[] = [];
  flows.push(-i.purchasePrice*i.equityPct);
  let noi = i.noiY1;
  let bal = loan;
  
  for (let y=1;y<=i.holdYears;y++){
    for(let m=0;m<12;m++){
      const interest=bal*monthly;
      const principal=pay-interest;
      bal-=principal;
    }
    const cfe = noi - annualDebt;
    flows.push(cfe);
    noi *= (1+i.noiGrowth);
  }
  
  const sale = (noi/(1+i.noiGrowth))/i.exitCap;
  const sellingCosts = sale*0.02;
  flows[flows.length-1] += (sale - sellingCosts - bal);
  
  const irr = irrNewton(flows);
  const equityIn = -flows[0];
  const totalBack = flows.slice(1).reduce((a,b)=>a+b,0);
  const em = totalBack / equityIn;
  const coc = (i.noiY1 - annualDebt)/equityIn;
  
  return { irr, em, coc, annualDebt };
}

function irrNewton(cashflows:number[]){
  let r=0.12;
  for (let k=0;k<50;k++){
    let npv=0, d=0;
    for (let t=0;t<cashflows.length;t++){
      const df = Math.pow(1+r,t);
      npv += cashflows[t]/df;
      if (t>0) d -= t*cashflows[t]/(df*(1+r));
    }
    const newR = r - npv/d;
    if (!isFinite(newR) || Math.abs(newR-r)<1e-7) break;
    r = Math.max(-0.99,newR);
  }
  return r;
}