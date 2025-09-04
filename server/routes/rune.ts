import express from 'express';
import OpenAI from 'openai';
import CommertizerX from '../services/commertizerX.js';

const router = express.Router();

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

interface CalculatorInputs {
  amount?: number;
  termYears?: number;
  reinvest?: boolean;
  exitCap?: number;
  rentGrowth?: number[];
  expenseGrowth?: number;
  vacancyAdjPct?: number;
  taxRate?: number;
}

interface PropertyData {
  targetedIRR?: number;
  projectedAnnualIncomeApr?: number;
  equityMultiple?: string;
  pricePerToken?: number;
  minInvestment?: number;
  propertyValue?: number;
  netOperatingIncome?: number;
}

// RUNE.CTZ query handler
router.post('/query', async (req, res) => {
  try {
    const { query, currentInputs, propertyData } = req.body;

    const systemPrompt = `You are RUNE.CTZ, an AI investment analyst for Commertize's tokenized real estate platform. 

Your capabilities:
1. Parse natural language queries into calculator settings
2. Generate conservative, base, and aggressive scenarios
3. Explain investment calculations and results
4. Suggest sensitivity adjustments
5. Answer questions about property documents and assumptions

Current property data: ${JSON.stringify(propertyData)}
Current calculator inputs: ${JSON.stringify(currentInputs)}

For calculator adjustment requests, respond with JSON in this format:
{
  "type": "calculator_update",
  "inputs": {
    "amount": 25000,
    "termYears": 3,
    "reinvest": false,
    "vacancyAdjPct": 0.02,
    "exitCapAdjustment": 0.005
  },
  "explanation": "Applied conservative scenario with +50 bps exit cap and +2% vacancy adjustment."
}

For scenario generation, respond with:
{
  "type": "scenarios",
  "scenarios": {
    "downside": { "irr": 6.2, "multiple": 1.4, "adjustments": "..." },
    "base": { "irr": 8.0, "multiple": 1.8, "adjustments": "..." },
    "upside": { "irr": 11.8, "multiple": 2.3, "adjustments": "..." }
  },
  "explanation": "Generated scenarios based on property fundamentals..."
}

For explanations, respond with:
{
  "type": "explanation",
  "drivers": [
    { "factor": "Management fees", "impact": "-0.8% IRR", "explanation": "..." },
    { "factor": "Exit timing", "impact": "-0.3% IRR", "explanation": "..." }
  ],
  "summary": "Your IRR is lower due to..."
}

Always include disclaimers about projections being illustrative and not guaranteed.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 1000
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    res.json({
      success: true,
      result,
      disclaimer: "Projections are illustrative estimates based on current assumptions. Actual results may vary significantly."
    });

  } catch (error) {
    console.error('RUNE.CTZ query error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process query',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Generate scenarios endpoint
router.post('/scenarios', async (req, res) => {
  try {
    const { propertyData } = req.body;

    const baseIRR = propertyData.targetedIRR || 8.0;
    const baseCashYield = propertyData.projectedAnnualIncomeApr || 6.5;
    const baseMultiple = parseFloat(propertyData.equityMultiple?.replace('x', '') || '1.8');

    const scenarios = {
      downside: {
        irr: Math.max(0, baseIRR - 2.5),
        cashYield: Math.max(0, baseCashYield - 1.5),
        multiple: Math.max(1.0, baseMultiple - 0.4),
        adjustments: "+2% vacancy, +50 bps exit cap, slower lease-up"
      },
      base: {
        irr: baseIRR,
        cashYield: baseCashYield,
        multiple: baseMultiple,
        adjustments: "Sponsor assumptions"
      },
      upside: {
        irr: baseIRR + 3.5,
        cashYield: baseCashYield + 2.0,
        multiple: baseMultiple + 0.5,
        adjustments: "-1% vacancy, -25 bps exit cap, faster stabilization"
      }
    };

    res.json({
      success: true,
      scenarios,
      disclaimer: "Scenarios are illustrative. Actual performance may vary significantly."
    });

  } catch (error) {
    console.error('Scenario generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate scenarios'
    });
  }
});

// Document Q&A endpoint
router.post('/document-qa', async (req, res) => {
  try {
    const { question, propertyData } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are RUNE.CTZ answering questions about a commercial real estate investment property. 
          
          Property data: ${JSON.stringify(propertyData)}
          
          Provide helpful answers based on the available data. If specific document information isn't available, 
          acknowledge this and provide general guidance. Always include appropriate disclaimers.`
        },
        { role: "user", content: question }
      ],
      max_completion_tokens: 500,
    });

    res.json({
      success: true,
      answer: response.choices[0].message.content,
      disclaimer: "Answer based on available property data. Consult full documentation for complete details."
    });

  } catch (error) {
    console.error('Document Q&A error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process question'
    });
  }
});

// Trigger Commertizer X orchestration after RUNE completion
router.post('/trigger-orchestration', async (req, res) => {
  try {
    const { runeInsights } = req.body;
    
    console.log('RUNE: Triggering Commertizer X orchestration');
    
    const result = await CommertizerX.processRUNEInsights(runeInsights);
    
    res.json(result);
  } catch (error) {
    console.error('RUNE orchestration trigger error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to trigger orchestration' 
    });
  }
});

export default router;