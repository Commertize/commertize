// Property Whisperer Mock API for Commertize
import express from "express";
import multer from "multer";
import { nanoid } from "nanoid";
import path from "path";
import fs from "fs";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// In-memory stores (ephemeral)
const jobs: Record<string, { state: string; progress: number; createdAt: number; docId?: string; error?: string }> = {};
const documents: Record<string, any> = {};
const runeJobs: Record<string, { state: string; progress: number; docId?: string; dealId?: string; dqi?: number }> = {};
const deals: Record<string, { id: string; name: string; stage: string; dqi: number; target: number; progress: number; docId: string; mapped: any }> = {};

// --- Helper: sample extraction payload ---
function sampleExtraction(docId: string) {
  const months = [
    '2024-09','2024-10','2024-11','2024-12',
    '2025-01','2025-02','2025-03','2025-04','2025-05','2025-06','2025-07','2025-08'
  ];
  const t12Lines = months.map((m,i) => ({ month: m, category: i%3===0? 'Income':'Expense', subcategory: i%3===0? 'Base Rent':'Utilities', amount: i%3===0? 120000: -30000 }));
  const egi = months.reduce((s,_,i)=> s + (i%3===0?120000:0),0);
  const opex = months.reduce((s,_,i)=> s + (i%3===0?0:30000),0);
  const noi = egi - opex;
  const annualDebtService = 860000;
  const dscr = Number((noi/annualDebtService).toFixed(2));
  return {
    document: { id: docId, type: 'T12', file_hash: 'demo', pages: 24 },
    totals: { gpr: 1600000, egi, opex, noi, annual_debt_service: annualDebtService, dscr },
    t12Lines,
    rentRoll: [
      { unit_id: '101', tenant_name: 'Acme Corp', sqft: 1200, start_date: '2023-06-01', end_date: '2026-05-31', base_rent: 3500 },
      { unit_id: '102', tenant_name: 'BlueMart', sqft: 980, start_date: '2024-02-01', end_date: '2027-01-31', base_rent: 2900 },
      { unit_id: '103', tenant_name: 'Cafe Uno', sqft: 650, start_date: '2022-11-15', end_date: '2025-11-14', base_rent: 2100 }
    ],
    debtTerms: { lender: 'Sample Bank', principal: 4800000, rate_type: 'Floating', index: 'SOFR', spread_bps: 275, all_in_rate: 0.071, amortization_months: 300, io_months: 12, maturity_date: '2030-08-01', rate_cap: '3.50% cap thru 2027' },
    covenants: [ { type: 'DSCR', threshold: '>= 1.20x', frequency: 'Quarterly' }, { type: 'LTV', threshold: '<= 65%', frequency: 'Quarterly' } ],
    assumptions: [ { text: 'Vacancy normalized to 5% per sponsor note (p.18)', source_refs: [{ page: 18 }] } ],
    checks: [ { id: 't12-months', label: 'T-12 has 12 months', status: 'pass' }, { id: 'noi-positive', label: 'NOI is positive', status: 'pass' } ],
    confidences: { t12: 0.97, rentRoll: 0.94 }
  };
}

// --- Upload + job status ---
router.post('/documents/upload', upload.single('file'), (req, res) => {
  const jobId = nanoid(10);
  const docId = `doc_${nanoid(6)}`;
  jobs[jobId] = { state: 'queued', progress: 5, createdAt: Date.now(), docId };
  
  console.log(`Property Whisperer: Starting document processing for job ${jobId}`);
  
  // Simulate async processing
  setTimeout(() => { 
    if (jobs[jobId]) {
      jobs[jobId].state = 'processing';
      console.log(`Property Whisperer: Job ${jobId} now processing`);
    }
  }, 800);
  
  setTimeout(() => {
    if (!jobs[jobId]) return;
    jobs[jobId].state = 'complete';
    jobs[jobId].progress = 100;
    documents[docId] = sampleExtraction(docId);
    console.log(`Property Whisperer: Job ${jobId} complete, document ${docId} ready`);
  }, 2400);
  
  res.json({ job_id: jobId });
});

router.get('/jobs/:jobId/status', (req, res) => {
  const job = jobs[req.params.jobId];
  if (!job) return res.status(404).json({ state: 'error', error: 'Job not found' });
  
  if (job.state === 'queued') job.progress = Math.min(25, job.progress + 5);
  if (job.state === 'processing' && job.progress < 95) job.progress += 20;
  
  const payload: any = { state: job.state, progress: job.progress };
  if (job.state === 'complete') payload.doc_id = job.docId;
  if (job.error) payload.error = job.error;
  
  res.json(payload);
});

// --- Entities ---
router.get('/documents/:docId/entities', (req, res) => {
  const id = req.params.docId;
  if (!documents[id]) {
    documents[id] = sampleExtraction(id);
  }
  res.json(documents[id]);
});

// --- Dashboard summary ---
router.get('/me/dashboard', (req, res) => {
  const pipeline = [
    { name: 'Howard Johnson Hotel', stage: 'Draft', dqi: 78, target: 3500000, progress: 45 },
    { name: 'Commerce Plaza', stage: 'Review', dqi: 72, target: 2200000, progress: 62 },
    { name: 'Riverview Industrial', stage: 'Live', dqi: 83, target: 5000000, progress: 38 },
  ];
  const recentExtractions = Object.values(documents).slice(-3).map((d: any) => ({
    doc: d.document.id,
    type: d.document.type,
    noi: d.totals.noi,
    dscr: d.totals.dscr,
    status: 'Complete',
  }));
  const flags = { lowConfCount: 1, warnCount: 2, failCount: 0 };
  const kpis = { 
    activeDeals: pipeline.length, 
    pendingReviews: flags.lowConfCount + flags.warnCount + flags.failCount, 
    avgDQI: Math.round(pipeline.reduce((a,b)=>a+b.dqi,0)/pipeline.length), 
    uploadedDocs: Object.keys(documents).length 
  };
  const activity = [ 
    'Uploaded T-12 for Howard Johnson', 
    'Deal wizard saved (Financials)', 
    'Invitation sent to co-sponsor' 
  ];
  res.json({ kpis, pipeline, recentExtractions, flags, activity });
});

// --- Proof PDF & Audit ZIP (optional static files) ---
router.get('/documents/:docId/proof.pdf', (req, res) => {
  const fp = path.join(process.cwd(), 'public', 'proof.pdf');
  if (fs.existsSync(fp)) return res.sendFile(fp);
  res.status(204).end();
});

router.get('/documents/:docId/audit.zip', (req, res) => {
  const fp = path.join(process.cwd(), 'public', 'audit.zip');
  if (fs.existsSync(fp)) return res.sendFile(fp);
  res.status(204).end();
});

// --- Corrections ---
router.post('/documents/:docId/corrections', (req, res) => {
  // In a real service, persist corrections and re-run reconciliation
  console.log('Property Whisperer: Corrections for', req.params.docId, req.body);
  res.json({ ok: true });
});

export default router;

// --- RUNE.CTZ Orchestrator endpoints ---
// Fully-automated pipeline wrapper: intake -> extract -> reconcile -> audit -> autofill -> DQI -> deal
router.post('/rune/intake', upload.single('file'), async (req, res) => {
  const runeJobId = nanoid(10);
  runeJobs[runeJobId] = { state: 'queued', progress: 0 };
  console.log(`RUNE: Starting automated pipeline for job ${runeJobId}`);
  res.json({ rune_job_id: runeJobId });

  // Kick off processing
  const { docId } = startDocProcessing((prog: number) => {
    // mirror underlying job progress to RUNE job
    const rj = runeJobs[runeJobId];
    if (!rj || rj.state === 'complete') return;
    rj.state = 'processing';
    rj.progress = Math.min(95, prog);
  });

  // Poll until extraction exists, then finish automation
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  for (let i = 0; i < 20; i++) {
    if (documents[docId]) break; // extraction ready
    await wait(250);
  }

  const extraction = documents[docId];
  if (!extraction) {
    runeJobs[runeJobId] = { state: 'error', progress: 100 };
    console.log(`RUNE: Job ${runeJobId} failed - no extraction found`);
    return;
  }

  const mapped = mapExtractionServer(extraction);
  const dqi = computeDQI(extraction);
  const dealId = `deal_${nanoid(6)}`;
  deals[dealId] = { 
    id: dealId, 
    name: 'RUNE Auto-Generated Deal', 
    stage: 'Draft', 
    dqi, 
    target: mapped.noi ? mapped.noi * 10 : 0, // rough cap rate estimate
    progress: 0, 
    docId, 
    mapped 
  };

  runeJobs[runeJobId] = { state: 'complete', progress: 100, docId, dealId, dqi };
  console.log(`RUNE: Job ${runeJobId} complete - Deal ${dealId} created with DQI ${dqi}`);
});

router.get('/rune/jobs/:id', (req, res) => {
  const job = runeJobs[req.params.id];
  if (!job) return res.status(404).json({ state: 'error', error: 'RUNE job not found' });
  res.json(job);
});

router.get('/deals', (req, res) => {
  res.json(Object.values(deals));
});

router.get('/deals/:id', (req, res) => {
  const d = deals[req.params.id];
  if (!d) return res.status(404).json({ error: 'Deal not found' });
  res.json(d);
});

// --- Helper functions for RUNE pipeline ---
function startDocProcessing(onProgress?: (progress: number) => void) {
  const jobId = nanoid(10);
  const docId = `doc_${nanoid(6)}`;
  jobs[jobId] = { state: 'queued', progress: 5, createdAt: Date.now(), docId };
  
  setTimeout(() => {
    if (jobs[jobId]) { 
      jobs[jobId].state = 'processing'; 
      onProgress && onProgress(25); 
    }
  }, 500);
  
  setTimeout(() => {
    if (!jobs[jobId]) return;
    jobs[jobId].state = 'complete';
    jobs[jobId].progress = 100;
    documents[docId] = sampleExtraction(docId);
    onProgress && onProgress(100);
  }, 2200);
  
  return { jobId, docId };
}

function mapExtractionServer(ex: any) {
  const t = ex?.totals || {};
  const d = ex?.debtTerms || {};
  const rentRoll = ex?.rentRoll || [];
  return {
    egi: t.egi ?? null,
    opex: t.opex ?? null,
    noi: t.noi ?? (typeof t.egi === 'number' && typeof t.opex === 'number' ? t.egi - t.opex : null),
    annual_debt_service: t.annual_debt_service ?? null,
    dscr: t.dscr ?? (t.noi && t.annual_debt_service ? t.noi / t.annual_debt_service : null),
    walt_years: estimateWALTServer(rentRoll),
    debt: {
      lender: d.lender ?? null,
      principal: d.principal ?? null,
      rate_type: d.rate_type ?? null,
      index: d.index ?? null,
      spread_bps: d.spread_bps ?? null,
      all_in_rate: d.all_in_rate ?? null,
      amortization_months: d.amortization_months ?? null,
      io_months: d.io_months ?? null,
      maturity_date: d.maturity_date ?? null,
      rate_cap: d.rate_cap ?? null,
    }
  };
}

function estimateWALTServer(rentRoll: any[] = []) {
  const today = Date.now();
  let num = 0, den = 0;
  rentRoll.forEach((r) => {
    const end = r.end_date ? Date.parse(r.end_date) : NaN;
    if (!end || !r.base_rent) return;
    const yrs = Math.max(0, (end - today) / (365.25 * 24 * 3600 * 1000));
    num += yrs * (r.base_rent || 0);
    den += (r.base_rent || 0);
  });
  return den > 0 ? Number((num / den).toFixed(2)) : null;
}

function computeDQI(ex: any) {
  const t = ex?.totals || {};
  const rr = ex?.rentRoll || [];
  const conf = ex?.confidences || {};
  let score = 70;

  // DSCR analysis
  const dscr = t.dscr || 0;
  if (dscr >= 1.40) score += 8; 
  else if (dscr >= 1.20) score += 4; 
  else if (dscr >= 1.10) score += 1; 
  else score -= 8;

  // Debt structure penalty
  const debt = ex?.debtTerms || {};
  if ((debt.rate_type || '').toLowerCase() === 'floating' && !debt.rate_cap) score -= 5;

  // Tenant concentration risk
  if (rr.length > 0) {
    const totalRent = rr.reduce((s: number, r: any) => s + (r.base_rent || 0), 0) || 1;
    const maxShare = Math.max(...rr.map((r: any) => (r.base_rent || 0) / totalRent));
    if (maxShare > 0.4) score -= 5;
  }

  // Data confidence penalty
  if (typeof conf.rentRoll === 'number' && conf.rentRoll < 0.95) score -= 2;
  if (typeof conf.t12 === 'number' && conf.t12 < 0.95) score -= 1;

  return Math.max(0, Math.min(100, Math.round(score)));
}
