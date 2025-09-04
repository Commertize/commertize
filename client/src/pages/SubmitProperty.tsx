import React, { useState } from "react";
import { Link } from "wouter";

// Import components from Property Whisperer
import { UploadAnalyzeWidget, ReconciliationPanel, FinancialsTable, DebtCard, AssumptionsCard, useDealStore, fmt, maskTenants } from "./PropertyWhisperer";

export default function SubmitProperty() {
  const setExtraction = useDealStore((s: any) => s.setExtraction);
  const extraction = useDealStore((s: any) => s.extraction);
  const [formData, setFormData] = useState({
    propertyName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: 'office',
    totalSqft: '',
    yearBuilt: '',
    description: ''
  });
  const [autoFilled, setAutoFilled] = useState(false);

  const handleAutofill = () => {
    if (!extraction) return;

    // Auto-fill form with extracted data
    const autofillData = {
      ...formData,
      // Derive property name from rent roll or debt terms
      propertyName: extraction.debtTerms?.lender ? 
        `Property financed by ${extraction.debtTerms.lender}` : 
        'Analyzed Property',
      // Use extraction data to populate financial fields
      totalSqft: extraction.rentRoll?.reduce((total: number, unit: any) => total + (unit.sqft || 0), 0)?.toString() || formData.totalSqft,
    };

    setFormData(autofillData);
    setAutoFilled(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine form data with extraction data
    const submitData = {
      ...formData,
      extractedFinancials: extraction,
      submittedAt: new Date().toISOString()
    };

    console.log('Submitting property with data:', submitData);
    
    // In real implementation, submit to API
    alert('Property submitted successfully! You will be redirected to the dashboard.');
    window.location.href = '/dashboard';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-logo font-light text-black">Submit Your Property</h1>
            <p className="text-black font-logo font-light">Upload your OM/T‑12/Rent Roll to auto-fill the form and generate a DQI-ready financials pack</p>
          </div>
          <Link href="/dashboard" className="py-2 px-4 border border-[#be8d00]/30 rounded-xl text-black font-logo font-light hover:bg-[#be8d00]/5 transition">
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Upload Widget */}
      <div className="mb-8">
        <UploadAnalyzeWidget onExtracted={setExtraction} context="submit" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Property Submission Form */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-logo font-light text-black">Property Details</h2>
            {extraction && !autoFilled && (
              <button
                onClick={handleAutofill}
                className="py-2 px-4 bg-[#be8d00] text-white rounded-xl font-logo font-light hover:bg-[#be8d00]/90 transition"
              >
                Accept & Autofill Form
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border border-[#be8d00]/30 rounded-xl p-6 bg-white shadow-sm">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-logo font-light text-black mb-1">Property Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-[#be8d00]/30 rounded-lg font-logo font-light text-black focus:outline-none focus:ring-2 focus:ring-[#be8d00]/20"
                    value={formData.propertyName}
                    onChange={(e) => setFormData({...formData, propertyName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-logo font-light text-black mb-1">Property Type</label>
                  <select
                    className="w-full px-3 py-2 border border-[#be8d00]/30 rounded-lg font-logo font-light text-black focus:outline-none focus:ring-2 focus:ring-[#be8d00]/20"
                    value={formData.propertyType}
                    onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                  >
                    <option value="office">Office</option>
                    <option value="retail">Retail</option>
                    <option value="industrial">Industrial</option>
                    <option value="multifamily">Multifamily</option>
                    <option value="mixed-use">Mixed Use</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-logo font-light text-black mb-1">Address</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-[#be8d00]/30 rounded-lg font-logo font-light text-black focus:outline-none focus:ring-2 focus:ring-[#be8d00]/20"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-logo font-light text-black mb-1">City</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-[#be8d00]/30 rounded-lg font-logo font-light text-black focus:outline-none focus:ring-2 focus:ring-[#be8d00]/20"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-logo font-light text-black mb-1">State</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-[#be8d00]/30 rounded-lg font-logo font-light text-black focus:outline-none focus:ring-2 focus:ring-[#be8d00]/20"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-logo font-light text-black mb-1">ZIP Code</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-[#be8d00]/30 rounded-lg font-logo font-light text-black focus:outline-none focus:ring-2 focus:ring-[#be8d00]/20"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                  />
                </div>
              </div>

              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-logo font-light text-black mb-1">Total Square Feet</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-[#be8d00]/30 rounded-lg font-logo font-light text-black focus:outline-none focus:ring-2 focus:ring-[#be8d00]/20"
                    value={formData.totalSqft}
                    onChange={(e) => setFormData({...formData, totalSqft: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-logo font-light text-black mb-1">Year Built</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-[#be8d00]/30 rounded-lg font-logo font-light text-black focus:outline-none focus:ring-2 focus:ring-[#be8d00]/20"
                    value={formData.yearBuilt}
                    onChange={(e) => setFormData({...formData, yearBuilt: e.target.value})}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-logo font-light text-black mb-1">Description</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-[#be8d00]/30 rounded-lg font-logo font-light text-black focus:outline-none focus:ring-2 focus:ring-[#be8d00]/20"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={!extraction}
                className={`flex-1 py-3 px-6 rounded-xl font-logo font-light transition ${
                  extraction 
                    ? 'bg-[#be8d00] text-white hover:bg-[#be8d00]/90' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Submit Property for Review
              </button>
              <Link href="/deals/new/financials" className="py-3 px-6 border border-[#be8d00]/30 rounded-xl text-black font-logo font-light hover:bg-[#be8d00]/5 transition">
                Start Deal Wizard
              </Link>
            </div>
          </form>
        </div>

        {/* Extracted Financial Data Preview */}
        <div>
          {extraction ? (
            <div className="space-y-6">
              <h2 className="text-xl font-logo font-light text-black">Auto‑extracted Financial Snapshot</h2>
              
              <ReconciliationPanel data={extraction} />

              <FinancialsTable
                title="T‑12 Summary (Preview)"
                columns={[
                  { key: "month", header: "Month" }, 
                  { key: "category", header: "Category" }, 
                  { key: "amount", header: "Amount", render: (v: number) => fmt(v) }
                ]}
                rows={extraction.t12Lines?.slice(0, 6) || []}
                emptyHint="Upload to view parsed T‑12 lines"
              />

              <FinancialsTable
                title="Rent Roll (Preview)"
                columns={[
                  { key: "unit_id", header: "Unit" }, 
                  { key: "tenant_name", header: "Tenant (masked)" }, 
                  { key: "base_rent", header: "Base Rent", render: (v: number) => fmt(v) }
                ]}
                rows={maskTenants(extraction.rentRoll || []).slice(0, 4)}
                emptyHint="Upload to view parsed rent roll"
              />

              <DebtCard data={extraction.debtTerms} covenants={extraction.covenants} />

              <div className="border border-green-300 rounded-xl p-4 bg-green-50">
                <h3 className="font-logo font-light text-green-800 mb-2">Ready for Submission</h3>
                <p className="text-sm font-logo font-light text-green-700">
                  Document analysis complete. Financial data is ready to be attached to your property submission.
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-[#be8d00]/30 rounded-xl p-8 text-center bg-white">
              <h3 className="text-lg font-logo font-light text-black mb-2">Upload Document First</h3>
              <p className="text-black font-logo font-light">
                Upload your property documents to auto-extract financial data and populate the form.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}