import React, { useEffect, useState, useRef } from "react";

// Property Whisperer types and interfaces
interface ExtractedData {
  document?: { id: string; type: string; file_hash: string; pages: number };
  totals?: {
    gpr?: number;
    vacancy?: number;
    egi?: number;
    opex?: number;
    noi?: number;
    annual_debt_service?: number;
    dscr?: number;
  };
  t12Lines?: Array<{
    month: string;
    category: string;
    subcategory?: string;
    amount: number;
    source_page?: number;
  }>;
  rentRoll?: Array<{
    unit_id?: string;
    tenant_name?: string;
    sqft?: number;
    start_date?: string;
    end_date?: string;
    base_rent?: number;
    escalations?: string;
  }>;
  debtTerms?: {
    lender?: string;
    principal?: number;
    rate_type?: string;
    index?: string;
    spread_bps?: number;
    all_in_rate?: number;
    amortization_months?: number;
    io_months?: number;
    maturity_date?: string;
    rate_cap?: string;
  };
  covenants?: Array<{
    type: string;
    threshold: string;
    frequency?: string;
  }>;
  assumptions?: Array<{
    text: string;
    source_refs?: Array<{ page: number; snippet?: string }>;
  }>;
  checks?: Array<{
    id: string;
    label: string;
    status: "pass" | "warn" | "fail";
    detail?: string;
  }>;
  confidences?: Record<string, number>;
}

// Deal store implementation (simplified for Commertize)
const useDealStore = (() => {
  let state = { extraction: null as ExtractedData | null, mapped: {}, listeners: new Set<() => void>() };
  const set = (partial: any) => {
    state = { ...state, ...(typeof partial === "function" ? partial(state) : partial) };
    state.listeners.forEach((l) => l());
  };
  const get = () => state;
  const subscribe = (l: () => void) => {
    state.listeners.add(l);
    return () => { state.listeners.delete(l); };
  };
  const useFake = (sel: any) => {
    const [, force] = React.useReducer((x: number) => x + 1, 0);
    useEffect(() => {
      const unsubscribe = subscribe(() => force());
      return () => unsubscribe();
    }, []);
    return sel(get());
  };
  return (selector?: any) => useFake(selector || ((s: any) => s));
})();

// Utility functions
const fmt = (n: any) => (typeof n === "number" && !Number.isNaN(n) ? n.toLocaleString(undefined, { style: "currency", currency: "USD" }) : "—");

function maskTenants(rows: any[] = []) {
  return rows.map((r) => ({ ...r, tenant_name: r.tenant_name ? `Tenant ${hash(r.tenant_name).slice(0, 6)}` : r.tenant_name }));
}

function hash(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i), h |= 0;
  return Math.abs(h).toString(36);
}

// Component implementations with Commertize styling
function ProgressBar({ value = 0, state = "processing" }: { value: number; state: string }) {
  const label = state === "complete" ? "Complete" : state === "uploading" ? "Uploading" : state === "queued" ? "Queued" : "Processing";
  return (
    <div className="w-full">
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className={`h-2 bg-[#be8d00]`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
      <div className="text-xs text-black font-logo font-light mt-1">{label}: {Math.round(value)}%</div>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#be8d00]/30 rounded-xl p-3 bg-white shadow-sm">
      <div className="text-xs text-black font-logo font-light">{label}</div>
      <div className="text-lg font-logo font-light text-[#be8d00]">{value}</div>
    </div>
  );
}

function ReconciliationPanel({ data }: { data: ExtractedData }) {
  const t = data?.totals || {};
  const checks = data?.checks || [];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPI label="GPR" value={fmt(t.gpr)} />
      <KPI label="EGI" value={fmt(t.egi)} />
      <KPI label="OpEx" value={fmt(t.opex)} />
      <KPI label="NOI" value={fmt(t.noi)} />
      <KPI label="Annual Debt Service" value={fmt(t.annual_debt_service)} />
      <KPI label="DSCR" value={typeof t.dscr === "number" ? t.dscr.toFixed(2) : "—"} />
      <div className="col-span-2 md:col-span-4">
        <div className="mt-2 text-sm font-logo font-light text-black">Checks</div>
        <ul className="mt-1 space-y-1">
          {checks.length === 0 && <li className="text-xs text-black font-logo font-light">No checks yet.</li>}
          {checks.map((c) => (
            <li key={c.id} className="text-xs flex items-start gap-2">
              <span className={`mt-0.5 inline-block h-2 w-2 rounded-full ${c.status === "pass" ? "bg-green-500" : c.status === "warn" ? "bg-yellow-500" : "bg-red-500"}`} />
              <span className="text-black font-logo font-light">{c.label}</span>
              {c.detail && <span className="text-black font-logo font-light opacity-60">— {c.detail}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FinancialsTable({ 
  title, 
  columns, 
  rows, 
  emptyHint 
}: { 
  title: string; 
  columns: Array<{ key: string; header: string; render?: (value: any, row: any) => React.ReactNode }>; 
  rows: any[]; 
  emptyHint?: string; 
}) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-logo font-light text-black">{title}</h3>
        <div className="text-xs text-black font-logo font-light">{rows?.length ?? 0} rows</div>
      </div>
      <div className="mt-2 overflow-auto border border-[#be8d00]/30 rounded-xl bg-white">
        <table className="min-w-full text-xs">
          <thead className="bg-[#be8d00]/10">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-3 py-2 text-left font-logo font-light text-black whitespace-nowrap">{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows && rows.length > 0 ? (
              rows.map((r, i) => (
                <tr key={i} className="odd:bg-white even:bg-[#be8d00]/5">
                  {columns.map((c) => (
                    <td key={c.key} className="px-3 py-2 whitespace-nowrap text-black font-logo font-light">
                      {c.render ? c.render(r[c.key], r) : String(r[c.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-3 py-6 text-center text-black font-logo font-light opacity-60" colSpan={columns.length}>{emptyHint || "No data"}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DebtCard({ data, covenants }: { data?: any; covenants?: any[] }) {
  if (!data || Object.keys(data).length === 0) return null;
  return (
    <div className="border border-[#be8d00]/30 rounded-xl p-4 bg-white shadow-sm">
      <div className="text-sm font-logo font-light text-black mb-2">Debt Terms</div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
        <div>
          <div className="text-black font-logo font-light opacity-60">Lender</div>
          <div className="text-black font-logo font-light">{data.lender || "—"}</div>
        </div>
        <div>
          <div className="text-black font-logo font-light opacity-60">Principal</div>
          <div className="text-black font-logo font-light">{fmt(data.principal)}</div>
        </div>
        <div>
          <div className="text-black font-logo font-light opacity-60">Rate</div>
          <div className="text-black font-logo font-light">{data.all_in_rate ? `${(data.all_in_rate * 100).toFixed(2)}%` : "—"}</div>
        </div>
        <div>
          <div className="text-black font-logo font-light opacity-60">Maturity</div>
          <div className="text-black font-logo font-light">{data.maturity_date || "—"}</div>
        </div>
        <div>
          <div className="text-black font-logo font-light opacity-60">Amortization</div>
          <div className="text-black font-logo font-light">{data.amortization_months ? `${data.amortization_months} months` : "—"}</div>
        </div>
        <div>
          <div className="text-black font-logo font-light opacity-60">IO Period</div>
          <div className="text-black font-logo font-light">{data.io_months ? `${data.io_months} months` : "—"}</div>
        </div>
      </div>
      {covenants && covenants.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#be8d00]/20">
          <div className="text-xs font-logo font-light text-black mb-2">Covenants</div>
          <ul className="space-y-1">
            {covenants.map((c, i) => (
              <li key={i} className="text-xs text-black font-logo font-light">
                {c.type}: {c.threshold} {c.frequency && `(${c.frequency})`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function AssumptionsCard({ assumptions }: { assumptions?: any[] }) {
  if (!assumptions || assumptions.length === 0) return null;
  return (
    <div className="border border-[#be8d00]/30 rounded-xl p-4 bg-white shadow-sm">
      <div className="text-sm font-logo font-light text-black mb-2">Assumptions & Footnotes</div>
      <ul className="space-y-2">
        {assumptions.map((a, i) => (
          <li key={i} className="text-xs text-black font-logo font-light border-l-2 border-[#be8d00]/30 pl-3">
            {a.text}
            {a.source_refs && a.source_refs.length > 0 && (
              <div className="mt-1 text-black font-logo font-light opacity-60">
                Referenced on page{a.source_refs.length > 1 ? "s" : ""}: {a.source_refs.map((r: any) => r.page).join(", ")}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function UploadAnalyzeWidget({ onExtracted, context = "submit" }: { onExtracted?: (data: ExtractedData) => void; context?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState("");
  const [status, setStatus] = useState({ state: "idle", progress: 0, message: "" });
  const [error, setError] = useState("");

  const handleFiles = async (f: FileList | null) => {
    const selected = f?.[0];
    if (!selected) return;
    setError("");
    setFile(selected);
    setStatus({ state: "uploading", progress: 0, message: "Uploading…" });
    try {
      const fd = new FormData();
      fd.append("file", selected);
      const res = await fetch("/api/documents/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const data = await res.json();
      setJobId(data.job_id);
      setStatus({ state: "queued", progress: 0, message: "Queued for processing…" });
    } catch (e: any) {
      setError(e.message);
      setStatus({ state: "idle", progress: 0, message: "" });
    }
  };

  useEffect(() => {
    if (!jobId) return;
    let timer: NodeJS.Timeout;
    const poll = async () => {
      try {
        const r = await fetch(`/api/jobs/${jobId}/status`);
        const s = await r.json();
        setStatus({ state: s.state, progress: s.progress ?? 0, message: s.error ?? s.state });
        if (s.state === "complete" && s.doc_id) {
          const entRes = await fetch(`/api/documents/${s.doc_id}/entities`);
          const extraction = await entRes.json();
          onExtracted?.(extraction);
        } else if (s.state === "error") {
          setError(s.error || "Processing error");
        } else if (s.state === "queued" || s.state === "processing") {
          timer = setTimeout(poll, 1200);
        }
      } catch (e: any) {
        setError(e.message);
      }
    };
    poll();
    return () => clearTimeout(timer);
  }, [jobId]);

  return (
    <div className="w-full">
      <div
        className="border-2 border-dashed border-[#be8d00]/30 rounded-2xl p-4 sm:p-8 text-center hover:bg-[#be8d00]/5 transition cursor-pointer bg-white"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => document.getElementById("pw-file")?.click()}
      >
        <input
          id="pw-file"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="text-lg sm:text-xl font-logo font-light text-black">Drag & drop your OM / T‑12 / Rent Roll (PDF)</div>
        <div className="text-xs sm:text-sm text-black font-logo font-light mt-2">We'll auto-extract financials, reconcile totals, and highlight inconsistencies.</div>
        {file && (
          <div className="mt-4 text-black font-logo font-light">
            Selected: <span className="text-[#be8d00]">{file.name}</span>
          </div>
        )}
        {status.state !== "idle" && (
          <div className="mt-4">
            <ProgressBar value={status.progress} state={status.state} />
            <div className="text-xs text-black font-logo font-light mt-1">{status.message}</div>
          </div>
        )}
        {error && <div className="mt-3 text-sm text-red-600 font-logo font-light">{error}</div>}
      </div>
      <div className="text-xs text-black font-logo font-light mt-2">
        By uploading, you agree to machine-assisted extraction; sensitive tenant data is masked by default.
      </div>
    </div>
  );
}

export default function PropertyWhispererPage() {
  const setExtraction = useDealStore((s: any) => s.setExtraction);
  const extraction = useDealStore((s: any) => s.extraction);
  
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-xl sm:text-2xl font-logo font-light text-black">Property Whisperer</h1>
        <p className="text-sm sm:text-base text-black font-logo font-light">Upload OMs, T‑12s, rent rolls, and debt docs. We'll parse them into structured data, reconcile totals, and flag inconsistencies.</p>
      </header>

      {/* Upload Widget */}
      <UploadAnalyzeWidget onExtracted={setExtraction} context="analyze" />
      
      {/* Results Display */}
      {extraction && (
        <section className="mt-8 space-y-6">
          <ReconciliationPanel data={extraction} />
          
          <FinancialsTable
            title="T‑12 Summary"
            columns={[
              { key: "month", header: "Month" }, 
              { key: "category", header: "Category" }, 
              { key: "subcategory", header: "Subcategory" }, 
              { key: "amount", header: "Amount", render: (v) => fmt(v) }
            ]}
            rows={extraction.t12Lines?.slice(0, 50) || []}
            emptyHint="Upload to view parsed T‑12 lines"
          />

          <FinancialsTable
            title="Rent Roll"
            columns={[
              { key: "unit_id", header: "Unit" }, 
              { key: "tenant_name", header: "Tenant (masked)" }, 
              { key: "sqft", header: "SqFt" }, 
              { key: "start_date", header: "Start" }, 
              { key: "end_date", header: "End" }, 
              { key: "base_rent", header: "Base Rent", render: (v) => fmt(v) }
            ]}
            rows={maskTenants(extraction.rentRoll || []).slice(0, 50)}
            emptyHint="Upload to view parsed rent roll"
          />

          <DebtCard data={extraction.debtTerms} covenants={extraction.covenants} />

          <AssumptionsCard assumptions={extraction.assumptions} />

          {/* Success Message */}
          <div className="mt-6 p-4 border border-[#be8d00]/30 rounded-xl bg-[#be8d00]/5">
            <h3 className="text-lg font-logo font-light text-black mb-2">Processing Complete</h3>
            <p className="text-black font-logo font-light">Your document has been successfully analyzed and financial data has been extracted. The Property Whisperer component is now ready and integrated with your Commertize platform.</p>
          </div>
        </section>
      )}
    </div>
  );
}
// Export all components and utilities for use in other modules
export { 
  UploadAnalyzeWidget, 
  ReconciliationPanel, 
  FinancialsTable, 
  DebtCard, 
  AssumptionsCard, 
  useDealStore, 
  fmt, 
  maskTenants 
};
