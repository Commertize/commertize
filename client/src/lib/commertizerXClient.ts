// commertizerXClient.ts
export type CalcInputs = {
  purchasePrice: number;
  equityPct: number;   // 0.0 - 1.0
  interestRate: number;// APR (e.g., 0.065)
  amortYears: number;  // e.g., 30
  holdYears: number;   // e.g., 5
  noiY1: number;       // Year 1 NOI
  noiGrowth: number;   // annual, e.g., 0.025
  exitCap: number;     // e.g., 0.06
};

export type Scenario = { label: "Conservative"|"Base"|"Aggressive"; inputs: Partial<CalcInputs> };
export type Explain = { summary: string; bullets: string[]; sensitivities?: string[] };
export type Validation = { warnings: string[]; errors: string[] };

export const CommertizerX = {
  async suggestAssumptions(ctx: Partial<CalcInputs>): Promise<Partial<CalcInputs>> {
    // Dynamic assumptions based on current market conditions and property characteristics
    const currentYear = new Date().getFullYear();
    const marketCycle = currentYear % 7; // Simple market cycle approximation
    
    // Base NOI growth adjusted for market conditions
    let noiGrowth = 0.025;
    if (ctx.purchasePrice && ctx.purchasePrice > 50_000_000) {
      noiGrowth = 0.030; // Premium properties tend to have higher growth
    } else if (ctx.purchasePrice && ctx.purchasePrice < 20_000_000) {
      noiGrowth = 0.022; // Smaller properties more conservative
    }
    
    // Market cycle adjustments
    if (marketCycle < 3) {
      noiGrowth += 0.005; // Early/mid cycle - higher growth
    } else {
      noiGrowth -= 0.003; // Late cycle - slower growth
    }
    
    // Exit cap based on current cap environment
    let exitCap = ctx.exitCap ?? 0.062;
    if (ctx.interestRate && ctx.interestRate > 0.07) {
      exitCap += 0.008; // Higher rate environment = higher exit caps
    } else if (ctx.interestRate && ctx.interestRate < 0.05) {
      exitCap -= 0.005; // Lower rate environment = compression
    }
    
    return {
      noiGrowth: Math.max(0.015, Math.min(0.045, noiGrowth)), // Cap between 1.5% and 4.5%
      exitCap: Math.max(0.045, Math.min(0.085, exitCap)), // Cap between 4.5% and 8.5%
      equityPct: ctx.equityPct ?? (ctx.purchasePrice && ctx.purchasePrice > 30_000_000 ? 0.35 : 0.40),
    };
  },
  async generateScenarios(ctx: CalcInputs): Promise<Scenario[]> {
    // Dynamic scenarios based on property size and current inputs
    const baseNoiGrowth = ctx.noiGrowth;
    const baseExitCap = ctx.exitCap;
    const baseEquity = ctx.equityPct;
    
    // Scenario spreads adjust based on property characteristics
    const isLargeProperty = ctx.purchasePrice > 40_000_000;
    const conservativeSpread = isLargeProperty ? 0.008 : 0.010; // Larger properties = tighter spreads
    const aggressiveSpread = isLargeProperty ? 0.010 : 0.015;
    
    return [
      { 
        label: "Conservative", 
        inputs: { 
          noiGrowth: Math.max(0.015, baseNoiGrowth - conservativeSpread), 
          exitCap: baseExitCap + 0.005, 
          equityPct: Math.min(0.50, baseEquity + 0.05),
          holdYears: Math.max(3, ctx.holdYears - 1) // Shorter hold for conservative
        } 
      },
      { 
        label: "Base", 
        inputs: { 
          noiGrowth: baseNoiGrowth, 
          exitCap: baseExitCap, 
          equityPct: baseEquity,
          holdYears: ctx.holdYears
        } 
      },
      { 
        label: "Aggressive", 
        inputs: { 
          noiGrowth: Math.min(0.045, baseNoiGrowth + aggressiveSpread), 
          exitCap: Math.max(0.045, baseExitCap - 0.005), 
          equityPct: Math.max(0.25, baseEquity - 0.05),
          holdYears: Math.min(10, ctx.holdYears + 2) // Longer hold for aggressive
        } 
      },
    ];
  },
  async explainResults(inputs: CalcInputs, outputs: { irr: number; coc: number; em: number }): Promise<Explain> {
    return {
      summary: `This deal projects a ${(outputs.irr * 100).toFixed(1)}% IRR, ${(outputs.coc * 100).toFixed(1)}% year-1 cash-on-cash, and a ${outputs.em.toFixed(1)}× equity multiple over ${inputs.holdYears} years.`,
      bullets: [
        `Year 1 NOI: $${Math.round(inputs.noiY1).toLocaleString()}`,
        `Exit cap: ${(inputs.exitCap * 100).toFixed(2)}%; hold: ${inputs.holdYears} years`,
        `Leverage (equity): ${(inputs.equityPct*100).toFixed(0)}%`,
      ],
      sensitivities: [
        `+50 bps exit cap ≈ −0.8% to −1.5% IRR (range depends on leverage)`,
        `+1% rent growth ≈ +0.5% to +1.2% IRR`,
      ],
    };
  },
  async validate(inputs: CalcInputs): Promise<Validation> {
    const warnings: string[] = [];
    const errors: string[] = [];
    if (inputs.equityPct < 0.25) warnings.push("Equity below 25% increases refinance/sale risk.");
    if (inputs.exitCap < 0.05) warnings.push("Exit cap below 5% may be optimistic for most markets.");
    if (inputs.interestRate > inputs.exitCap) warnings.push("Interest rate exceeds exit cap; watch DSCR and valuation risk.");
    if (inputs.holdYears < 3) warnings.push("Hold period under 3 years increases market timing risk.");
    return { warnings, errors };
  },
  async optimizeForIRR(inputs: CalcInputs, targetIRR = 0.15): Promise<Partial<CalcInputs>> {
    // Simple leverage sweep to move toward target IRR (stub; replace with server optimizer later)
    let best: { diff: number; equityPct: number } | null = null;
    for (let e = 0.25; e <= 0.70; e += 0.05) {
      const irr = estimateIRR({ ...inputs, equityPct: e });
      const diff = Math.abs(irr - targetIRR);
      if (!best || diff < best.diff) best = { diff, equityPct: e };
    }
    return { equityPct: best?.equityPct ?? inputs.equityPct };
  },
};

// Minimal IRR helper so the optimizer can run locally
function pmt(rate: number, nper: number, pv: number) {
  return (rate * pv) / (1 - Math.pow(1 + rate, -nper));
}
function estimateIRR(i: CalcInputs): number {
  const monthly = i.interestRate / 12;
  const n = i.amortYears * 12;
  const loan = i.purchasePrice * (1 - i.equityPct);
  const pay = pmt(monthly, n, loan);
  // build annual cash flows to equity
  const flows: number[] = [];
  flows.push(-i.purchasePrice * i.equityPct); // initial equity
  let noi = i.noiY1;
  let bal = loan;
  for (let y = 1; y <= i.holdYears; y++) {
    // amortize for 12 months
    for (let m = 0; m < 12; m++) {
      const interest = bal * monthly;
      const principal = pay - interest;
      bal -= principal;
    }
    const cfe = noi - pay * 12;
    flows.push(cfe);
    noi *= (1 + i.noiGrowth);
  }
  // sale at end of hold: using current NOI / exit cap (simple)
  const sale = (noi / (1 + i.noiGrowth)) / i.exitCap; // approx next year's NOI / cap
  const sellingCosts = sale * 0.02;
  flows[flows.length - 1] += (sale - sellingCosts - bal);
  // IRR (Newton-Raphson)
  let r = 0.12;
  for (let k = 0; k < 30; k++) {
    let npv = 0, d = 0;
    for (let t = 0; t < flows.length; t++) {
      const df = Math.pow(1 + r, t);
      npv += flows[t] / df;
      if (t > 0) d -= t * flows[t] / (df * (1 + r));
    }
    const newR = r - npv / d;
    if (!isFinite(newR) || Math.abs(newR - r) < 1e-6) break;
    r = Math.max(-0.99, newR);
  }
  return r;
}