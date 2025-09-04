import React, { useState, useEffect } from "react";
import { Link } from "wouter";

interface ReviewItem {
  id: string;
  docId: string;
  type: 'low_confidence' | 'warning' | 'failed_check';
  field: string;
  value: any;
  confidence?: number;
  issue: string;
  suggestion: string;
  page?: number;
}

export default function DashboardReview() {
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [corrections, setCorrections] = useState<Record<string, any>>({});

  useEffect(() => {
    // Mock review items - in real implementation, fetch from API
    const mockItems: ReviewItem[] = [
      {
        id: '1',
        docId: 'doc_abc123',
        type: 'low_confidence',
        field: 'monthly_rent_unit_102',
        value: 2900,
        confidence: 0.65,
        issue: 'OCR confidence below threshold',
        suggestion: 'Verify amount from source document',
        page: 15
      },
      {
        id: '2',
        docId: 'doc_abc123',
        type: 'warning',
        field: 'lease_end_date_unit_103',
        value: '2025-11-14',
        issue: 'Lease expiring within 12 months',
        suggestion: 'Consider lease renewal risk in analysis',
        page: 18
      },
      {
        id: '3',
        docId: 'doc_def456',
        type: 'failed_check',
        field: 'dscr_calculation',
        value: 1.15,
        issue: 'DSCR below 1.20x covenant requirement',
        suggestion: 'Review NOI calculation or debt service terms',
        page: 4
      }
    ];

    setTimeout(() => {
      setReviewItems(mockItems);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCorrection = (itemId: string, newValue: any) => {
    setCorrections(prev => ({ ...prev, [itemId]: newValue }));
  };

  const saveCorrections = async () => {
    // Group corrections by document ID
    const correctionsByDoc = reviewItems.reduce((acc, item) => {
      if (corrections[item.id] !== undefined) {
        if (!acc[item.docId]) acc[item.docId] = {};
        acc[item.docId][item.field] = corrections[item.id];
      }
      return acc;
    }, {} as Record<string, Record<string, any>>);

    // Submit corrections to API
    for (const [docId, docCorrections] of Object.entries(correctionsByDoc)) {
      try {
        await fetch(`/api/documents/${docId}/corrections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(docCorrections)
        });
      } catch (error) {
        console.error(`Failed to save corrections for ${docId}:`, error);
      }
    }

    // Remove corrected items
    setReviewItems(prev => prev.filter(item => corrections[item.id] === undefined));
    setCorrections({});
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'low_confidence': return '⚠️';
      case 'warning': return '🟡';
      case 'failed_check': return '❌';
      default: return '⚪';
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'low_confidence': return 'border-orange-300 bg-orange-50';
      case 'warning': return 'border-yellow-300 bg-yellow-50';
      case 'failed_check': return 'border-red-300 bg-red-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-lg font-logo font-light text-black">Loading review queue...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-logo font-light text-black">Analyst Review Queue</h1>
            <p className="text-black font-logo font-light">Review low-confidence items, warnings, and failed checks</p>
          </div>
          <Link href="/dashboard" className="py-2 px-4 border border-[#be8d00]/30 rounded-xl text-black font-logo font-light hover:bg-[#be8d00]/5 transition">
            Back to Dashboard
          </Link>
        </div>
      </header>

      {reviewItems.length === 0 ? (
        <div className="text-center py-12 border border-[#be8d00]/30 rounded-xl bg-white">
          <div className="text-lg font-logo font-light text-black mb-2">All Clear! 🎉</div>
          <p className="text-black font-logo font-light">No items require review at this time.</p>
          <Link href="/dashboard/analyze" className="inline-block mt-4 py-2 px-4 bg-[#be8d00] text-white rounded-xl font-logo font-light hover:bg-[#be8d00]/90 transition">
            Analyze New Document
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-orange-300 rounded-xl p-4 bg-orange-50">
              <div className="text-2xl font-logo font-light text-orange-600">
                {reviewItems.filter(item => item.type === 'low_confidence').length}
              </div>
              <div className="text-sm font-logo font-light text-black">Low Confidence</div>
            </div>
            <div className="border border-yellow-300 rounded-xl p-4 bg-yellow-50">
              <div className="text-2xl font-logo font-light text-yellow-600">
                {reviewItems.filter(item => item.type === 'warning').length}
              </div>
              <div className="text-sm font-logo font-light text-black">Warnings</div>
            </div>
            <div className="border border-red-300 rounded-xl p-4 bg-red-50">
              <div className="text-2xl font-logo font-light text-red-600">
                {reviewItems.filter(item => item.type === 'failed_check').length}
              </div>
              <div className="text-sm font-logo font-light text-black">Failed Checks</div>
            </div>
          </div>

          {/* Review Items */}
          <div className="space-y-4">
            {reviewItems.map((item) => (
              <div key={item.id} className={`border rounded-xl p-4 ${getItemColor(item.type)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="text-xl">{getItemIcon(item.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-logo font-light text-black">
                          {item.field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        {item.confidence && (
                          <span className="text-xs px-2 py-1 rounded bg-white text-black font-logo font-light">
                            {Math.round(item.confidence * 100)}% confidence
                          </span>
                        )}
                        {item.page && (
                          <span className="text-xs px-2 py-1 rounded bg-white text-black font-logo font-light">
                            Page {item.page}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-black font-logo font-light mb-2">{item.issue}</p>
                      <p className="text-xs text-black font-logo font-light italic">{item.suggestion}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-logo font-light text-black mb-2">Current Value</div>
                    <div className="font-logo font-light text-[#be8d00]">
                      {typeof item.value === 'number' && item.field.includes('rent') 
                        ? `$${item.value.toLocaleString()}` 
                        : String(item.value)
                      }
                    </div>
                  </div>
                </div>

                {/* Inline Correction */}
                <div className="mt-4 pt-4 border-t border-black/10">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-logo font-light text-black">Corrected Value:</label>
                    <input
                      type={typeof item.value === 'number' ? 'number' : 'text'}
                      placeholder="Enter corrected value..."
                      className="flex-1 px-3 py-2 border border-[#be8d00]/30 rounded-lg font-logo font-light text-black focus:outline-none focus:ring-2 focus:ring-[#be8d00]/20"
                      value={corrections[item.id] || ''}
                      onChange={(e) => handleCorrection(item.id, e.target.value)}
                    />
                    <button
                      onClick={() => handleCorrection(item.id, item.value)}
                      className="py-2 px-3 text-xs border border-[#be8d00]/30 rounded-lg text-black font-logo font-light hover:bg-[#be8d00]/5 transition"
                    >
                      Use Original
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Save Actions */}
          {Object.keys(corrections).length > 0 && (
            <div className="sticky bottom-6 border border-[#be8d00]/30 rounded-xl p-4 bg-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm font-logo font-light text-black">
                  {Object.keys(corrections).length} correction(s) pending
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCorrections({})}
                    className="py-2 px-4 border border-[#be8d00]/30 rounded-xl text-black font-logo font-light hover:bg-[#be8d00]/5 transition"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={saveCorrections}
                    className="py-2 px-4 bg-[#be8d00] text-white rounded-xl font-logo font-light hover:bg-[#be8d00]/90 transition"
                  >
                    Save Corrections
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}