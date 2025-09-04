import React, { useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";

/**
 * Property Whisperer – drop-in React components
 * Styled with Commertize brand guidelines: font-logo font-light typography, gold (#be8d00) and white colors only
 */

/** Utility: currency format */
const fmt = (n) => (typeof n === "number" && !Number.isNaN(n) ? n.toLocaleString(undefined, { style: "currency", currency: "USD" }) : "—");

/** UploadAnalyzeWidget – drag & drop + polling + results */
export function UploadAnalyzeWidget({ onExtracted, context = "submit" }) {
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState("");
  const [status, setStatus] = useState({ state: "idle", progress: 0, message: "" });
  const [error, setError] = useState("");

  const handleFiles = async (f) => {
    const selected = f?.[0];
    if (!selected) return;
    setError("");
    setFile(selected);
    setStatus({ state: "uploading", progress: 0, message: "Uploading…" });
    try {
      const fd = new FormData();
      fd.append("file", selected);
      // TODO: replace with your backend URL
      const res = await fetch("/api/documents/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const data = await res.json();
      setJobId(data.job_id);
      setStatus({ state: "queued", progress: 0, message: "Queued for processing…" });
    } catch (e) {
      setError(e.message);
      setStatus({ state: "idle", progress: 0, message: "" });
    }
  };

  useEffect(() => {
    if (!jobId) return;
    let timer;
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
      } catch (e) {
        setError(e.message);
      }
    };
    poll();
    return () => clearTimeout(timer);
  }, [jobId]);

  return (
    <div className="w-full">
      <div
        className="border-2 border-dashed border-[#be8d00]/30 rounded-2xl p-8 text-center hover:bg-[#be8d00]/5 transition cursor-pointer bg-white"
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
        <div className="text-xl font-logo font-light text-black">Drag & drop your OM / T‑12 / Rent Roll (PDF)</div>
        <div className="text-sm text-black font-logo font-light mt-2">We'll auto-extract financials, reconcile totals, and highlight inconsistencies.</div>
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

function ProgressBar({ value = 0, state = "processing" }) {
  const label = state === "complete" ? "Complete" : state === "uploading" ? "Uploading" : state === "queued" ? "Queued" : "Processing";
  return (
    <div className="w-full">
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className={`h-2 ${state === "complete" ? "bg-[#be8d00]" : "bg-[#be8d00]"}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
      <div className="text-xs text-black font-logo font-light mt-1">{label}: {Math.round(value)}%</div>
    </div>
  );
}

/** ReconciliationPanel – shows key totals, DSCR, and flags */
export function ReconciliationPanel({ data }) {
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
              <span className={`mt-0.5 inline-block h-2 w-2 rounded-full ${c.status === "pass" ? "bg-[#be8d00]" : c.status === "warn" ? "bg-[#be8d00]/60" : "bg-red-500"}`} />
              <span className="text-black font-logo font-light">{c.label}</span>
              {c.detail && <span className="text-black font-logo font-light">— {c.detail}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function KPI({ label, value }) {
  return (
    <div className="border border-[#be8d00]/30 rounded-xl p-3 bg-white shadow-sm">
      <div className="text-xs text-black font-logo font-light">{label}</div>
      <div className="text-lg font-logo font-light text-[#be8d00]">{value}</div>
    </div>
  );
}

/** Generic table renderer for T‑12 and Rent Roll */
export function FinancialsTable({ title, columns, rows, emptyHint }) {
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
                <td className="px-3 py-6 text-center text-black font-logo font-light" colSpan={columns.length}>{emptyHint || "No data"}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Deal store (lightweight) – holds extracted data for mapping into your schema */
export const useDealStore = (() => {
  // Fallback inline store if Zustand isn't available
  let state = { extraction: null, mapped: {}, listeners: new Set() };
  const set = (partial) => {
    state = { ...state, ...(typeof partial === "function" ? partial(state) : partial) };
    state.listeners.forEach((l) => l());
  };
  const get = () => state;
  const subscribe = (l) => { state.listeners.add(l); return () => state.listeners.delete(l); };
  const useFake = (sel) => {
    const [, force] = React.useReducer((x) => x + 1, 0);
    useEffect(() => subscribe(() => force()), []);
    return sel(get());
  };
  useFake.setState = set;
  return (selector) => useFake(selector || ((s) => s));
})();

/** Submit Property page placement */
export function SubmitPropertyPage() {
  const setExtraction = useDealStore((s) => s.setExtraction);
  const extraction = useDealStore((s) => s.extraction);
  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-logo font-light text-black">Submit Your Property</h1>
        <p className="text-black font-logo font-light">Upload your OM/T‑12/Rent Roll to auto-fill the form and generate a DQI-ready financials pack.</p>
      </header>
      <UploadAnalyzeWidget onExtracted={setExtraction} context="submit" />

      {extraction && (
        <section className="mt-8 space-y-6">
          <h2 className="text-lg font-logo font-light text-black">Auto‑extracted Financial Snapshot</h2>
          <ReconciliationPanel data={extraction} />

          <FinancialsTable
            title="T‑12 Summary"
            columns={[{ key: "month", header: "Month" }, { key: "category", header: "Category" }, { key: "subcategory", header: "Subcategory" }, { key: "amount", header: "Amount", render: (v) => fmt(v) }]}
            rows={extraction.t12Lines?.slice(0, 50)}
            emptyHint="Upload to view parsed T‑12 lines"
          />

          <FinancialsTable
            title="Rent Roll"
            columns={[{ key: "unit_id", header: "Unit" }, { key: "tenant_name", header: "Tenant (masked)" }, { key: "sqft", header: "SqFt" }, { key: "start_date", header: "Start" }, { key: "end_date", header: "End" }, { key: "base_rent", header: "Base Rent", render: (v) => fmt(v) }]}
            rows={maskTenants(extraction.rentRoll)?.slice(0, 50)}
            emptyHint="Upload to view parsed rent roll"
          />

          <DebtCard data={extraction.debtTerms} covenants={extraction.covenants} />

          <AssumptionsCard assumptions={extraction.assumptions} />

          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-xl bg-[#be8d00] text-white font-logo font-light">Accept & Autofill Form</button>
            <button className="px-4 py-2 rounded-xl border border-[#be8d00] text-black font-logo font-light">Download Audit Packet</button>
          </div>
        </section>
      )}
    </div>
  );
}

/** Deal Wizard – Financials step */
export function DealWizardFinancialsStep() {
  const setExtraction = useDealStore((s) => s.setExtraction);
  const extraction = useDealStore((s) => s.extraction);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Stepper current={2} steps={["Basics", "Documents", "Financials", "Terms", "Preview"]} />
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-logo font-light text-black">Analyze PDFs</h2>
          <p className="text-black font-logo font-light mb-3">Drop your T‑12, rent roll, and debt docs. We'll extract structured data and run reconciliation checks.</p>
          <UploadAnalyzeWidget onExtracted={setExtraction} context="wizard" />
          <div className="mt-4 text-xs text-black font-logo font-light">Tip: Add a rate cap certificate to potentially improve DQI.</div>
        </div>
        <div>
          <h2 className="text-lg font-logo font-light text-black">Reconciliation</h2>
          {extraction ? (
            <ReconciliationPanel data={extraction} />
          ) : (
            <div className="text-sm text-black font-logo font-light">No document analyzed yet.</div>
          )}
        </div>
      </div>

      {extraction && (
        <div className="mt-8">
          <h3 className="text-sm font-logo font-light text-black">Map to Deal Fields</h3>
          <div className="grid md:grid-cols-3 gap-4 mt-2">
            <Field label="Effective Gross Income" value={extraction.totals?.egi} suffix="USD" />
            <Field label="Operating Expenses" value={extraction.totals?.opex} suffix="USD" />
            <Field label="NOI (Derived)" value={extraction.totals?.noi} suffix="USD" />
            <Field label="Annual Debt Service" value={extraction.totals?.annual_debt_service} suffix="USD" />
            <Field label="DSCR" value={extraction.totals?.dscr} />
            <Field label="WALT (yrs)" value={estimateWALT(extraction.rentRoll)} />
          </div>
          <div className="mt-6 flex gap-3">
            <button className="px-4 py-2 rounded-xl bg-[#be8d00] text-white font-logo font-light">Save & Continue</button>
            <button className="px-4 py-2 rounded-xl border border-[#be8d00] text-black font-logo font-light">Review Low‑Confidence Items</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, suffix }) {
  return (
    <div className="border border-[#be8d00]/30 rounded-xl p-3 bg-white">
      <div className="text-xs text-black font-logo font-light">{label}</div>
      <div className="text-sm font-logo font-light text-[#be8d00]">{typeof value === "number" ? (suffix === "USD" ? fmt(value) : value) : value ?? "—"}</div>
    </div>
  );
}

function Stepper({ steps, current }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-3">
          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-logo font-light ${i + 1 <= current ? "bg-[#be8d00]" : "bg-gray-300"}`}>{i + 1}</div>
          <div className={`font-logo font-light ${i + 1 <= current ? "text-black" : "text-gray-400"}`}>{s}</div>
          {i < steps.length - 1 && <div className="w-8 h-px bg-gray-300" />}
        </div>
      ))}
    </div>
  );
}

export function DebtCard({ data = {}, covenants = [] }) {
  if (!data || Object.keys(data).length === 0) return null;
  return (
    <div className="border border-[#be8d00]/30 rounded-xl p-4 bg-white shadow-sm">
      <div className="text-sm font-logo font-light text-black mb-2">Debt Terms</div>
      <div className="grid md:grid-cols-3 gap-3 text-sm">
        <Info label="Lender" value={data.lender} />
        <Info label="Principal" value={fmt(data.principal)} />
        <Info label="Rate Type" value={data.rate_type} />
        <Info label="Index" value={data.index} />
        <Info label="Spread (bps)" value={data.spread_bps} />
        <Info label="All‑in Rate" value={typeof data.all_in_rate === "number" ? `${(data.all_in_rate * 100).toFixed(2)}%` : "—"} />
        <Info label="Amortization (mo)" value={data.amortization_months} />
        <Info label="IO (mo)" value={data.io_months} />
        <Info label="Maturity" value={data.maturity_date} />
        <Info label="Rate Cap" value={data.rate_cap} />
      </div>
      {covenants?.length > 0 && (
        <div className="mt-3">
          <div className="text-sm font-logo font-light text-black">Covenants</div>
          <ul className="mt-1 text-sm list-disc list-inside text-black font-logo font-light">
            {covenants.map((c, i) => (
              <li key={i}><span className="text-[#be8d00]">{c.type}</span>: {c.threshold} {c.frequency ? `(${c.frequency})` : ""}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-xs text-black font-logo font-light">{label}</div>
      <div className="text-sm font-logo font-light text-[#be8d00]">{value ?? "—"}</div>
    </div>
  );
}

export function AssumptionsCard({ assumptions = [] }) {
  if (!assumptions || assumptions.length === 0) return null;
  return (
    <div className="border border-[#be8d00]/30 rounded-xl p-4 bg-white shadow-sm">
      <div className="text-sm font-logo font-light text-black mb-2">Assumptions & Footnotes</div>
      <ul className="text-sm list-disc list-inside text-black font-logo font-light">
        {assumptions.map((a, i) => (
          <li key={i}>
            {a.text}
            {a.source_refs && a.source_refs.length > 0 && (
              <span className="text-[#be8d00]"> — p.{a.source_refs.map((r) => r.page).join(", ")}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function maskTenants(rows = []) {
  return rows.map((r) => ({ ...r, tenant_name: r.tenant_name ? `Tenant ${hash(r.tenant_name).slice(0, 6)}` : r.tenant_name }));
}
function hash(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i), h |= 0;
  return Math.abs(h).toString(36);
}

function estimateWALT(rentRoll = []) {
  // naive: avg remaining term in years, weighted by base_rent
  const today = new Date();
  let num = 0, den = 0;
  rentRoll.forEach((r) => {
    if (!r.end_date || !r.base_rent) return;
    const end = new Date(r.end_date);
    const yrs = Math.max(0, (end - today) / (365.25 * 24 * 3600 * 1000));
    num += yrs * (r.base_rent || 0);
    den += (r.base_rent || 0);
  });
  return den > 0 ? (num / den).toFixed(2) : "—";
}

/** Demo wrapper to preview both placements (optional) */
// --- App shell & routes ---
function Nav() {
  return (
    <nav className="w-full border-b border-[#be8d00]/30 bg-white/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="font-logo font-light text-black">Commertize</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/analyze" className="hover:underline font-logo font-light text-black">Property Whisperer</Link>
          <Link to="/deals/new/financials" className="hover:underline font-logo font-light text-black">Deal Wizard</Link>
          <Link to="/dashboard/analyze" className="hover:underline font-logo font-light text-black">Dashboard</Link>
          <Link to="/submit" className="px-3 py-1.5 rounded-xl bg-[#be8d00] text-white font-logo font-light">Submit Property</Link>
        </div>
      </div>
    </nav>
  );
}

function HomePage() {
  const setExtraction = useDealStore((s) => s.setExtraction);
  const extraction = useDealStore((s) => s.extraction);
  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mt-6 mb-6">
        <h1 className="text-3xl font-logo font-light text-black">Auto‑extract CRE financials. Source‑linked. Auditable.</h1>
        <p className="text-black font-logo font-light mt-2">Upload an OM / T‑12 / Rent Roll. Get a structured snapshot in under a minute. Full packet available after login.</p>
      </header>
      <div className="grid md:grid-cols-2 gap-6">
        <UploadAnalyzeWidget onExtracted={setExtraction} context="home" />
        <div>
          {extraction ? (
            <div>
              <ReconciliationPanel data={extraction} />
              <FinancialsTable
                title="T‑12 (preview)"
                columns={[{ key: "month", header: "Month" }, { key: "category", header: "Category" }, { key: "amount", header: "Amount", render: (v) => fmt(v) }]}
                rows={extraction.t12Lines?.slice(0, 3) || []}
                emptyHint="Upload to preview parsed T‑12"
              />
              <FinancialsTable
                title="Rent Roll (preview)"
                columns={[{ key: "unit_id", header: "Unit" }, { key: "tenant_name", header: "Tenant (masked)" }, { key: "base_rent", header: "Base Rent", render: (v) => fmt(v) }]}
                rows={(maskTenants(extraction.rentRoll) || []).slice(0, 3)}
                emptyHint="Upload to preview parsed rent roll"
              />
            </div>
          ) : (
            <div className="text-sm text-black font-logo font-light">Drop a PDF to see a live preview here. We'll show a few rows and the reconciliation snapshot.</div>
          )}
        </div>
      </div>
      <div className="text-xs text-black font-logo font-light mt-3">Machine‑assisted extraction; human review recommended. Tenant data masked by default.</div>
    </div>
  );
}

export function AnalyzePage() {
  const setExtraction = useDealStore((s) => s.setExtraction);
  const extraction = useDealStore((s) => s.extraction);
  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-logo font-light text-black">Property Whisperer</h1>
        <p className="text-black font-logo font-light">Upload OMs, T‑12s, rent rolls, and debt docs. We'll parse them into structured data, reconcile totals, and flag inconsistencies.</p>
      </header>
      <UploadAnalyzeWidget onExtracted={setExtraction} context="analyze" />
      {extraction && (
        <section className="mt-8 space-y-6">
          <ReconciliationPanel data={extraction} />
          <FinancialsTable
            title="T‑12 Summary"
            columns={[{ key: "month", header: "Month" }, { key: "category", header: "Category" }, { key: "subcategory", header: "Subcategory" }, { key: "amount", header: "Amount", render: (v) => fmt(v) }]}
            rows={extraction.t12Lines}
          />
          <FinancialsTable
            title="Rent Roll"
            columns={[{ key: "unit_id", header: "Unit" }, { key: "tenant_name", header: "Tenant (masked)" }, { key: "sqft", header: "SqFt" }, { key: "start_date", header: "Start" }, { key: "end_date", header: "End" }, { key: "base_rent", header: "Base Rent", render: (v) => fmt(v) }]}
            rows={maskTenants(extraction.rentRoll)}
          />
          <DebtCard data={extraction.debtTerms} covenants={extraction.covenants} />
          <AssumptionsCard assumptions={extraction.assumptions} />
        </section>
      )}
    </div>
  );
}

function DashboardAnalyzePage() {
  const setExtraction = useDealStore((s) => s.setExtraction);
  const extraction = useDealStore((s) => s.extraction);
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-logo font-light text-black mb-2">Analyze PDFs</h1>
      <p className="text-black font-logo font-light mb-4">Drop documents here; we'll store results to your account. (Bind to auth in your app.)</p>
      <UploadAnalyzeWidget onExtracted={setExtraction} context="dashboard" />
      {extraction && <div className="mt-6"><ReconciliationPanel data={extraction} /></div>}
    </div>
  );
}

function DealWizardPage() { return <DealWizardFinancialsStep />; }

function InvestorFinancialsPage() {
  const { id } = useParams();
  // Placeholder: bind to /api/deals/:id/financials in your backend
  const extraction = useDealStore((s) => s.extraction);
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-logo font-light text-black mb-2">Verified Financials</h1>
      <p className="text-black font-logo font-light mb-4">Machine‑read + human‑checked. Click any field to view the source in your data room. (Bind this to your deal {id}.)</p>
      {extraction ? (
        <>
          <ReconciliationPanel data={extraction} />
          <FinancialsTable
            title="T‑12 Summary"
            columns={[{ key: "month", header: "Month" }, { key: "category", header: "Category" }, { key: "subcategory", header: "Subcategory" }, { key: "amount", header: "Amount", render: (v) => fmt(v) }]}
            rows={extraction.t12Lines}
          />
          <FinancialsTable
            title="Rent Roll"
            columns={[{ key: "unit_id", header: "Unit" }, { key: "tenant_name", header: "Tenant (masked)" }, { key: "sqft", header: "SqFt" }, { key: "start_date", header: "Start" }, { key: "end_date", header: "End" }, { key: "base_rent", header: "Base Rent", render: (v) => fmt(v) }]}
            rows={maskTenants(extraction.rentRoll)}
          />
        </>
      ) : (
        <div className="text-sm text-black font-logo font-light">Connect your backend to load deal financials by ID. For now, upload a doc on <Link to="/analyze" className="underline text-[#be8d00]">/analyze</Link> to preview.</div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Router>
        <Nav />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/submit" element={<SubmitPropertyPage />} />
          <Route path="/dashboard/analyze" element={<DashboardAnalyzePage />} />
          <Route path="/deals/new/financials" element={<DealWizardPage />} />
          <Route path="/deals/:id/financials" element={<InvestorFinancialsPage />} />
        </Routes>
      </Router>
    </div>
  );
}