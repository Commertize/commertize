import { useMutation, useQuery } from '@tanstack/react-query';

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

interface RuneQueryResponse {
  success: boolean;
  result: {
    type: 'calculator_update' | 'scenarios' | 'explanation';
    inputs?: CalculatorInputs;
    scenarios?: any;
    drivers?: any[];
    explanation?: string;
    summary?: string;
  };
  disclaimer?: string;
}

interface ScenariosResponse {
  success: boolean;
  scenarios: {
    downside: { irr: number; cashYield: number; multiple: number; adjustments: string };
    base: { irr: number; cashYield: number; multiple: number; adjustments: string };
    upside: { irr: number; cashYield: number; multiple: number; adjustments: string };
  };
  disclaimer?: string;
}

interface DocumentQAResponse {
  success: boolean;
  answer: string;
  disclaimer?: string;
}

// RUNE.CTZ natural language query hook
export const useRuneQuery = () => {
  return useMutation<RuneQueryResponse, Error, { 
    query: string; 
    currentInputs: CalculatorInputs; 
    propertyData: PropertyData;
  }>({
    mutationFn: async ({ query, currentInputs, propertyData }) => {
      const response = await fetch('/api/rune/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, currentInputs, propertyData }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to process RUNE.CTZ query');
      }
      
      return response.json();
    },
  });
};

// Generate investment scenarios hook
export const useRuneScenarios = () => {
  return useMutation<ScenariosResponse, Error, { propertyData: PropertyData }>({
    mutationFn: async ({ propertyData }) => {
      const response = await fetch('/api/rune/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyData }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate scenarios');
      }
      
      return response.json();
    },
  });
};

// Document Q&A hook
export const useRuneDocumentQA = () => {
  return useMutation<DocumentQAResponse, Error, { 
    question: string; 
    propertyData: PropertyData;
  }>({
    mutationFn: async ({ question, propertyData }) => {
      const response = await fetch('/api/rune/document-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, propertyData }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to process document question');
      }
      
      return response.json();
    },
  });
};