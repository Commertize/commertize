import React, { useState } from "react";
import { Link } from "wouter";

// Import components from Property Whisperer
import { UploadAnalyzeWidget, ReconciliationPanel, useDealStore } from "./PropertyWhisperer";

interface DealField {
  label: string;
  key: string;
  value: any;
  unit?: string;
  editable: boolean;
}

export default function DealWizardFinancials() {
  const setExtraction = useDealStore((s: any) => s.setExtraction);
  const extraction = useDealStore((s: any) => s.extraction);
  const [dealFields, setDealFields] = useState<DealField[]>([]);
  const [currentStep, setCurrentStep] = useState(2); // Financials step

  // Initialize deal fields when extraction is available
  React.useEffect(() => {
    if (extraction) {
      const fields: DealField[] = [
        {
          label: "Effective Gross Income",
          key: "egi",
          value: extraction.totals?.egi || 0,
          unit: "USD",
          editable: true
        },
        {
          label: "Operating Expenses",
          key: "opex",
          value: extraction.totals?.opex || 0,
          unit: "USD",
          editable: true
        },
        {
          label: "NOI (Derived)",
          key: "noi",
          value: extraction.totals?.noi || 0,
          unit: "USD",
          editable: false
        },
        {
          label: "Annual Debt Service",
          key: "annual_debt_service",
          value: extraction.totals?.annual_debt_service || 0,
          unit: "USD",
          editable: true
        },
        {
          label: "DSCR",
          key: "dscr",
          value: extraction.totals?.dscr || 0,
          unit: "",
          editable: false
        },
        {
          label: "WALT (years)",
          key: "walt",
          value: estimateWALT(extraction.rentRoll),
          unit: "years",
          editable: true
        }
      ];
      setDealFields(fields);
    }
  }, [extraction]);

  const estimateWALT = (rentRoll: any[] = []) => {
    const today = new Date();
    let num = 0, den = 0;
    rentRoll.forEach((r) => {
      if (!r.end_date || !r.base_rent) return;
      const end = new Date(r.end_date);
      const yrs = Math.max(0, (end.getTime() - today.getTime()) / (365.25 * 24 * 3600 * 1000));
      num += yrs * (r.base_rent || 0);
      den += (r.base_rent || 0);
    });
    return den > 0 ? Number((num / den).toFixed(2)) : 0;
  };

  const updateDealField = (key: string, newValue: any) => {
    setDealFields(prev => prev.map(field => {
      if (field.key === key) {
        return { ...field, value: newValue };
      }
      // Recalculate derived fields
      if (key === 'egi' || key === 'opex') {
        const egi = key === 'egi' ? newValue : (prev.find(f => f.key === 'egi')?.value || 0);
        const opex = key === 'opex' ? newValue : (prev.find(f => f.key === 'opex')?.value || 0);
        if (field.key === 'noi') {
          return { ...field, value: egi - opex };
        }
      }
      if ((key === 'noi' || key === 'annual_debt_service') && field.key === 'dscr') {
        const noi = key === 'noi' ? newValue : (prev.find(f => f.key === 'noi')?.value || 0);
        const ads = key === 'annual_debt_service' ? newValue : (prev.find(f => f.key === 'annual_debt_service')?.value || 0);
        return { ...field, value: ads > 0 ? Number((noi / ads).toFixed(2)) : 0 };
      }
      return field;
    }));
  };

  const saveAndContinue = () => {
    // Save deal field mappings
    const mappedData = dealFields.reduce((acc, field) => {
      acc[field.key] = field.value;
      return acc;
    }, {} as Record<string, any>);

    console.log('Saving deal wizard data:', { extraction, mappedFields: mappedData });
    
    // Navigate to next step
    alert('Financial data saved! Proceeding to Terms step.');
    setCurrentStep(3);
  };

  const steps = ["Basics", "Documents", "Financials", "Terms", "Preview"];

  const formatValue = (value: any, unit: string = "") => {
    if (typeof value === 'number') {
      if (unit === 'USD') {
        return value.toLocaleString(undefined, { style: "currency", currency: "USD" });
      }
      return value.toLocaleString();
    }
    return value || "—";
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-3 text-sm mb-8">
        {steps.map((step, i) => (
          <React.Fragment key={step}>
            <div className="flex items-center gap-3">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-logo font-light ${
                i + 1 <= currentStep ? "bg-[#be8d00]" : "bg-gray-300"
              }`}>
                {i + 1}
              </div>
              <div className={`font-logo font-light ${i + 1 <= currentStep ? "text-black" : "text-gray-400"}`}>
                {step}
              </div>
            </div>
            {i < steps.length - 1 && <div className="w-8 h-px bg-gray-300" />}
          </React.Fragment>
        ))}
      </div>

      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-logo font-light text-black">Deal Wizard - Financials</h1>
            <p className="text-black font-logo font-light">Upload documents and map financial data to deal fields</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard" className="py-2 px-4 border border-[#be8d00]/30 rounded-xl text-black font-logo font-light hover:bg-[#be8d00]/5 transition">
              Save & Exit
            </Link>
            <button 
              onClick={() => setCurrentStep(1)}
              className="py-2 px-4 border border-[#be8d00]/30 rounded-xl text-black font-logo font-light hover:bg-[#be8d00]/5 transition"
            >
              ← Previous
            </button>
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column - Document Analysis */}
        <div>
          <h2 className="text-lg font-logo font-light text-black mb-3">Analyze PDFs</h2>
          <p className="text-black font-logo font-light mb-4">Drop your T‑12, rent roll, and debt docs. We'll extract structured data and run reconciliation checks.</p>
          
          <UploadAnalyzeWidget onExtracted={setExtraction} context="wizard" />
          
          {extraction && (
            <>
              <div className="mt-6">
                <h3 className="text-sm font-logo font-light text-black mb-3">Reconciliation</h3>
                <ReconciliationPanel data={extraction} />
              </div>
              
              <div className="mt-4 p-3 border border-[#be8d00]/30 rounded-xl bg-[#be8d00]/5">
                <div className="text-xs font-logo font-light text-black">
                  💡 Tip: Add a rate cap certificate to potentially improve DQI scoring.
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column - Deal Field Mapping */}
        <div>
          <h2 className="text-lg font-logo font-light text-black mb-3">Map to Deal Fields</h2>
          
          {extraction ? (
            <div className="space-y-4">
              {dealFields.map((field) => (
                <div key={field.key} className="border border-[#be8d00]/30 rounded-xl p-4 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-logo font-light text-black">{field.label}</label>
                    {!field.editable && (
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 font-logo font-light">
                        Calculated
                      </span>
                    )}
                  </div>
                  {field.editable ? (
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-[#be8d00]/30 rounded-lg font-logo font-light text-black focus:outline-none focus:ring-2 focus:ring-[#be8d00]/20"
                      value={field.value || ''}
                      onChange={(e) => updateDealField(field.key, parseFloat(e.target.value) || 0)}
                    />
                  ) : (
                    <div className="text-lg font-logo font-light text-[#be8d00]">
                      {formatValue(field.value, field.unit)}
                    </div>
                  )}
                </div>
              ))}

              {/* Debt Terms Summary */}
              {extraction.debtTerms && (
                <div className="border border-[#be8d00]/30 rounded-xl p-4 bg-white shadow-sm">
                  <h3 className="text-sm font-logo font-light text-black mb-3">Debt Terms Summary</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-black font-logo font-light opacity-60">Lender</div>
                      <div className="text-black font-logo font-light">{extraction.debtTerms.lender || "—"}</div>
                    </div>
                    <div>
                      <div className="text-black font-logo font-light opacity-60">All-in Rate</div>
                      <div className="text-black font-logo font-light">
                        {extraction.debtTerms.all_in_rate ? `${(extraction.debtTerms.all_in_rate * 100).toFixed(2)}%` : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-black font-logo font-light opacity-60">Maturity</div>
                      <div className="text-black font-logo font-light">{extraction.debtTerms.maturity_date || "—"}</div>
                    </div>
                    <div>
                      <div className="text-black font-logo font-light opacity-60">Rate Cap</div>
                      <div className="text-black font-logo font-light">{extraction.debtTerms.rate_cap || "—"}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={saveAndContinue}
                  className="flex-1 py-3 px-6 bg-[#be8d00] text-white rounded-xl font-logo font-light hover:bg-[#be8d00]/90 transition"
                >
                  Save & Continue
                </button>
                <Link href="/dashboard/review" className="py-3 px-6 border border-[#be8d00]/30 rounded-xl text-black font-logo font-light hover:bg-[#be8d00]/5 transition">
                  Review Low‑Confidence Items
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border border-[#be8d00]/30 rounded-xl bg-white">
              <div className="text-sm font-logo font-light text-black opacity-60">
                No document analyzed yet. Upload a document to begin mapping financial data.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}