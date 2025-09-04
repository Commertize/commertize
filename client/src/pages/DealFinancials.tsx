import React, { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { ReconciliationPanel, FinancialsTable, DebtCard, AssumptionsCard, fmt, maskTenants } from "./PropertyWhisperer";

interface DealData {
  id: string;
  name: string;
  extraction: any;
  verified: boolean;
  lastUpdated: string;
}

export default function DealFinancials() {
  const [, params] = useRoute<{ id: string }>("/deals/:id/financials");
  const [dealData, setDealData] = useState<DealData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProof, setShowProof] = useState(false);

  useEffect(() => {
    if (params?.id) {
      fetchDealFinancials(params.id);
    }
  }, [params?.id]);

  const fetchDealFinancials = async (dealId: string) => {
    try {
      // In real implementation, fetch deal financials from API
      // For now, simulate with sample data
      const sampleDeal: DealData = {
        id: dealId,
        name: `Property Deal ${dealId.toUpperCase()}`,
        verified: true,
        lastUpdated: new Date().toISOString(),
        extraction: {
          document: { id: `doc_${dealId}`, type: 'T12', pages: 24 },
          totals: { 
            gpr: 1600000, 
            egi: 1440000, 
            opex: 576000, 
            noi: 864000, 
            annual_debt_service: 750000, 
            dscr: 1.15 
          },
          t12Lines: [
            { month: '2024-09', category: 'Income', subcategory: 'Base Rent', amount: 120000, source_page: 8 },
            { month: '2024-10', category: 'Income', subcategory: 'Base Rent', amount: 120000, source_page: 8 },
            { month: '2024-11', category: 'Income', subcategory: 'Base Rent', amount: 120000, source_page: 8 },
            { month: '2024-12', category: 'Income', subcategory: 'Base Rent', amount: 120000, source_page: 8 },
            { month: '2024-09', category: 'Expense', subcategory: 'Utilities', amount: -48000, source_page: 12 },
            { month: '2024-10', category: 'Expense', subcategory: 'Utilities', amount: -48000, source_page: 12 },
          ],
          rentRoll: [
            { unit_id: '101', tenant_name: 'Acme Corp', sqft: 1200, start_date: '2023-06-01', end_date: '2026-05-31', base_rent: 3500 },
            { unit_id: '102', tenant_name: 'BlueMart', sqft: 980, start_date: '2024-02-01', end_date: '2027-01-31', base_rent: 2900 },
            { unit_id: '103', tenant_name: 'Cafe Uno', sqft: 650, start_date: '2022-11-15', end_date: '2025-11-14', base_rent: 2100 }
          ],
          debtTerms: { 
            lender: 'First National Bank', 
            principal: 4800000, 
            rate_type: 'Floating', 
            index: 'SOFR', 
            spread_bps: 275, 
            all_in_rate: 0.071, 
            amortization_months: 300, 
            io_months: 12, 
            maturity_date: '2030-08-01', 
            rate_cap: '3.50% cap thru 2027' 
          },
          assumptions: [
            { text: 'Vacancy normalized to 5% per sponsor note', source_refs: [{ page: 18 }] },
            { text: 'CapEx reserve of $1.50/SF annually', source_refs: [{ page: 22 }] }
          ],
          checks: [
            { id: 't12-months', label: 'T-12 has 12 months', status: 'pass' },
            { id: 'noi-positive', label: 'NOI is positive', status: 'pass' },
            { id: 'dscr-adequate', label: 'DSCR meets minimum threshold', status: 'warn', detail: 'DSCR of 1.15x is below preferred 1.25x' }
          ],
          confidences: { t12: 0.97, rentRoll: 0.94, debtTerms: 0.98 }
        }
      };

      setTimeout(() => {
        setDealData(sampleDeal);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to fetch deal financials:', error);
      setLoading(false);
    }
  };

  const downloadAuditPacket = () => {
    if (dealData?.extraction?.document?.id) {
      window.open(`/api/documents/${dealData.extraction.document.id}/audit.zip`, '_blank');
    }
  };

  const viewProofPDF = () => {
    if (dealData?.extraction?.document?.id) {
      window.open(`/api/documents/${dealData.extraction.document.id}/proof.pdf`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-lg font-logo font-light text-black">Loading deal financials...</div>
        </div>
      </div>
    );
  }

  if (!dealData) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12 border border-[#be8d00]/30 rounded-xl bg-white">
          <div className="text-lg font-logo font-light text-black mb-2">Deal Not Found</div>
          <p className="text-black font-logo font-light">The requested deal financials could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-logo font-light text-black">{dealData.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-black font-logo font-light">Verified Financials - Machine‑read + Human‑checked</p>
              {dealData.verified && (
                <span className="px-3 py-1 rounded-full text-xs font-logo font-light bg-green-100 text-green-800 border border-green-200">
                  ✓ Verified
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={viewProofPDF}
              className="py-2 px-4 border border-[#be8d00]/30 rounded-xl text-black font-logo font-light hover:bg-[#be8d00]/5 transition"
            >
              View Proof PDF
            </button>
            <button
              onClick={downloadAuditPacket}
              className="py-2 px-4 bg-[#be8d00] text-white rounded-xl font-logo font-light hover:bg-[#be8d00]/90 transition"
            >
              Download Audit Packet
            </button>
          </div>
        </div>
        <div className="mt-2 text-sm text-black font-logo font-light opacity-60">
          Last updated: {new Date(dealData.lastUpdated).toLocaleDateString()}
        </div>
      </header>

      {/* Verification Notice */}
      <div className="mb-8 p-4 border border-blue-300 rounded-xl bg-blue-50">
        <h3 className="font-logo font-light text-blue-800 mb-2">Data Room Integration</h3>
        <p className="text-sm font-logo font-light text-blue-700">
          Click any field below to view the source document excerpt in your secure data room. 
          All financial data has been machine-extracted and human-verified for accuracy.
        </p>
      </div>

      <div className="space-y-8">
        {/* Key Metrics */}
        <ReconciliationPanel data={dealData.extraction} />

        {/* T-12 Financial Summary */}
        <FinancialsTable
          title="T‑12 Financial Summary"
          columns={[
            { key: "month", header: "Month" }, 
            { key: "category", header: "Category" }, 
            { key: "subcategory", header: "Subcategory" }, 
            { key: "amount", header: "Amount", render: (v: number) => fmt(v) },
            { 
              key: "source_page", 
              header: "Source", 
              render: (page: number, row: any) => (
                <button 
                  className="text-[#be8d00] hover:text-[#be8d00]/80 text-sm font-logo font-light underline"
                  onClick={() => alert(`Opening data room to page ${page} for verification`)}
                >
                  p.{page}
                </button>
              )
            }
          ]}
          rows={dealData.extraction.t12Lines || []}
          emptyHint="No T-12 data available"
        />

        {/* Rent Roll */}
        <FinancialsTable
          title="Rent Roll"
          columns={[
            { key: "unit_id", header: "Unit" }, 
            { key: "tenant_name", header: "Tenant (Verified)" }, 
            { key: "sqft", header: "SqFt", render: (v: number) => v ? v.toLocaleString() : "—" }, 
            { key: "start_date", header: "Lease Start" }, 
            { key: "end_date", header: "Lease End" }, 
            { key: "base_rent", header: "Base Rent", render: (v: number) => fmt(v) },
            { 
              key: "verified", 
              header: "Status", 
              render: () => (
                <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 font-logo font-light">
                  Verified
                </span>
              )
            }
          ]}
          rows={dealData.extraction.rentRoll || []}
          emptyHint="No rent roll data available"
        />

        {/* Debt Terms */}
        <DebtCard data={dealData.extraction.debtTerms} covenants={dealData.extraction.covenants} />

        {/* Assumptions & Footnotes */}
        <AssumptionsCard assumptions={dealData.extraction.assumptions} />

        {/* Verification & Quality Checks */}
        <div className="border border-[#be8d00]/30 rounded-xl p-6 bg-white shadow-sm">
          <h3 className="text-lg font-logo font-light text-black mb-4">Verification & Quality Checks</h3>
          
          {/* Confidence Scores */}
          {dealData.extraction.confidences && (
            <div className="mb-6">
              <h4 className="text-sm font-logo font-light text-black mb-3">Confidence Levels</h4>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(dealData.extraction.confidences).map(([key, confidence]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm font-logo font-light text-black capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
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

          {/* Quality Checks */}
          {dealData.extraction.checks && dealData.extraction.checks.length > 0 && (
            <div>
              <h4 className="text-sm font-logo font-light text-black mb-3">Quality Checks</h4>
              <ul className="space-y-2">
                {dealData.extraction.checks.map((check: any) => (
                  <li key={check.id} className="flex items-start gap-3">
                    <span className={`mt-0.5 inline-block h-3 w-3 rounded-full ${
                      check.status === 'pass' ? 'bg-green-500' : 
                      check.status === 'warn' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <span className="text-sm font-logo font-light text-black">{check.label}</span>
                      {check.detail && (
                        <div className="text-xs font-logo font-light text-black opacity-70 mt-1">
                          {check.detail}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Audit Trail */}
        <div className="border border-[#be8d00]/30 rounded-xl p-6 bg-[#be8d00]/5">
          <h3 className="text-lg font-logo font-light text-black mb-2">Audit Trail</h3>
          <p className="text-black font-logo font-light mb-4">
            Complete audit trail and source documentation available for download. 
            All data extraction processes are logged and reviewable.
          </p>
          <div className="flex gap-3">
            <button
              onClick={downloadAuditPacket}
              className="py-2 px-4 bg-[#be8d00] text-white rounded-xl font-logo font-light hover:bg-[#be8d00]/90 transition"
            >
              Download Complete Audit Package
            </button>
            <button
              onClick={viewProofPDF}
              className="py-2 px-4 border border-[#be8d00]/30 rounded-xl text-black font-logo font-light hover:bg-[#be8d00]/5 transition"
            >
              View Source Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}