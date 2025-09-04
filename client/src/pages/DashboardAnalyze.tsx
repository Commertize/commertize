import React, { useState } from "react";
import { Link } from "wouter";

// Import components from Property Whisperer
import { UploadAnalyzeWidget, ReconciliationPanel, FinancialsTable, DebtCard, AssumptionsCard, useDealStore, fmt, maskTenants } from "./PropertyWhisperer";
import { RUNEAutomationButton } from "@/components/RUNEAutomationButton";

export default function DashboardAnalyze() {
  const setExtraction = useDealStore((s: any) => s.setExtraction);
  const extraction = useDealStore((s: any) => s.extraction);
  const [savedToAccount, setSavedToAccount] = useState(false);

  const handleSaveToAccount = async () => {
    // In a real implementation, this would save the extraction to the user's account
    console.log("Saving extraction to account:", extraction);
    setSavedToAccount(true);
    
    // Simulate API call
    setTimeout(() => setSavedToAccount(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-logo font-light text-black">Analyze PDFs</h1>
            <p className="text-black font-logo font-light">Upload documents for comprehensive financial analysis and reconciliation</p>
          </div>
          <Link href="/dashboard" className="py-2 px-4 border border-[#be8d00]/30 rounded-xl text-black font-logo font-light hover:bg-[#be8d00]/5 transition">
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Upload Widget */}
      <div className="mb-8 space-y-4">
        <UploadAnalyzeWidget onExtracted={setExtraction} context="dashboard" />
        
        {/* RUNE Automation Alternative */}
        <div className="border-t border-[#be8d00]/20 pt-4">
          <div className="text-sm font-logo font-light text-black mb-2">Or let AI handle everything:</div>
          <RUNEAutomationButton 
            size="md"
            onSuccess={(result) => {
              console.log('RUNE completed:', result);
            }}
          >
            🤖 Let RUNE automate this
          </RUNEAutomationButton>
        </div>
      </div>
      
      {/* Results Display */}
      {extraction && (
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-logo font-light text-black">Analysis Results</h2>
            <div className="flex gap-3">
              <button 
                onClick={handleSaveToAccount}
                className={`py-2 px-4 rounded-xl font-logo font-light transition ${
                  savedToAccount 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-[#be8d00] text-white hover:bg-[#be8d00]/90'
                }`}
                disabled={savedToAccount}
              >
                {savedToAccount ? 'Saved to Account ✓' : 'Save to Account'}
              </button>
              <Link href="/dashboard/review" className="py-2 px-4 border border-[#be8d00]/30 rounded-xl text-black font-logo font-light hover:bg-[#be8d00]/5 transition">
                Review Items
              </Link>
            </div>
          </div>

          <ReconciliationPanel data={extraction} />
          
          <FinancialsTable
            title="T‑12 Summary"
            columns={[
              { key: "month", header: "Month" }, 
              { key: "category", header: "Category" }, 
              { key: "subcategory", header: "Subcategory" }, 
              { key: "amount", header: "Amount", render: (v: number) => fmt(v) },
              { key: "source_page", header: "Page", render: (v: number) => v ? `p.${v}` : "—" }
            ]}
            rows={extraction.t12Lines?.slice(0, 100) || []}
            emptyHint="Upload to view parsed T‑12 lines"
          />

          <FinancialsTable
            title="Rent Roll"
            columns={[
              { key: "unit_id", header: "Unit" }, 
              { key: "tenant_name", header: "Tenant (masked)" }, 
              { key: "sqft", header: "SqFt", render: (v: number) => v ? v.toLocaleString() : "—" }, 
              { key: "start_date", header: "Start" }, 
              { key: "end_date", header: "End" }, 
              { key: "base_rent", header: "Base Rent", render: (v: number) => fmt(v) },
              { key: "escalations", header: "Escalations" }
            ]}
            rows={maskTenants(extraction.rentRoll || []).slice(0, 100)}
            emptyHint="Upload to view parsed rent roll"
          />

          <DebtCard data={extraction.debtTerms} covenants={extraction.covenants} />

          <AssumptionsCard assumptions={extraction.assumptions} />

          {/* Confidence Levels */}
          {extraction.confidences && (
            <div className="border border-[#be8d00]/30 rounded-xl p-4 bg-white shadow-sm">
              <h3 className="text-lg font-logo font-light text-black mb-3">Confidence Levels</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(extraction.confidences).map(([key, confidence]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm font-logo font-light text-black capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${confidence >= 0.9 ? 'bg-green-500' : confidence >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-logo font-light text-black">{Math.round(confidence * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processing Complete Message */}
          <div className="border border-[#be8d00]/30 rounded-xl p-6 bg-[#be8d00]/5">
            <h3 className="text-lg font-logo font-light text-black mb-2">Document Analysis Complete</h3>
            <p className="text-black font-logo font-light mb-4">
              Your document has been successfully processed and financial data extracted. 
              Review the results above and use the tools below for next steps.
            </p>
            <div className="flex gap-3">
              <Link href="/submit" className="py-2 px-4 bg-[#be8d00] text-white rounded-xl font-logo font-light hover:bg-[#be8d00]/90 transition">
                Submit Property with This Data
              </Link>
              <Link href="/deals/new/financials" className="py-2 px-4 border border-[#be8d00]/30 rounded-xl text-black font-logo font-light hover:bg-[#be8d00]/5 transition">
                Start Deal Wizard
              </Link>
              {extraction.document?.id && (
                <button 
                  onClick={() => {
                    const id = extraction.document?.id;
                    if (id) window.open(`/api/documents/${id}/audit.zip`, '_blank');
                  }}
                  className="py-2 px-4 border border-[#be8d00]/30 rounded-xl text-black font-logo font-light hover:bg-[#be8d00]/5 transition"
                >
                  Download Audit Package
                </button>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}