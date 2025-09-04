// property-whisperer-mock.js
// Simple mock API to power the Property Whisperer front-end during development.
// Integrated with the existing Commertize server

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 12);
const upload = multer({ storage: multer.memoryStorage() });

// Create Express router
const propertyWhispererRoutes = express.Router();

/** In-memory stores (reset on restart) */
const jobs = new Map();      // job_id -> { state, progress, doc_id, error }
const documents = new Map(); // doc_id -> extraction result JSON

/** Sample extraction generator */
function makeSampleExtraction({ filename }) {
  const now = new Date();
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.toISOString().slice(0, 7);
    const rent = 85000 + Math.round(Math.random() * 8000);
    const otherInc = 5000 + Math.round(Math.random() * 2000);
    const opex = 40000 + Math.round(Math.random() * 5000);
    months.push({ month, category: 'Income', subcategory: 'Base Rent', amount: rent });
    months.push({ month, category: 'Income', subcategory: 'Other Income', amount: otherInc });
    months.push({ month, category: 'Expense', subcategory: 'Operating Expenses', amount: -opex });
  }
  const egi = months.filter(m => m.category === 'Income').reduce((a,b)=>a+b.amount,0);
  const opexTotal = -months.filter(m => m.category === 'Expense').reduce((a,b)=>a+b.amount,0);
  const noi = egi - opexTotal;
  const annualDebtService = 520000; // mock
  const dscr = noi / annualDebtService;
  const rentRoll = Array.from({ length: 12 }).map((_,i)=>({
    unit_id: `SUITE-${100 + i}`,
    tenant_name: `Tenant ${i+1}`,
    sqft: 1200 + i*50,
    start_date: '2023-06-01',
    end_date: '2027-05-31',
    base_rent: 2500 + i*45,
    escalations: '3% annual'
  }));
  return {
    document: { id: nanoid(), type: 'OM', file_hash: nanoid(), pages: 48, filename },
    totals: { gpr: egi, egi, opex: opexTotal, noi, annual_debt_service: annualDebtService, dscr },
    t12Lines: months,
    rentRoll,
    debtTerms: { lender: 'Sample Bank', principal: 7500000, rate_type: 'Floating', index: 'SOFR', spread_bps: 275, all_in_rate: 0.074, amortization_months: 360, io_months: 24, maturity_date: '2030-08-01', rate_cap: 'SOFR @ 4.0% (2y)' },
    covenants: [ { type: 'DSCR', threshold: '1.20x', frequency: 'Quarterly' }, { type: 'LTV', threshold: '65%', frequency: 'Quarterly' } ],
    assumptions: [ { text: 'Vacancy normalized to 5% per sponsor narrative.', source_refs: [{ page: 18 }] }, { text: 'Property taxes projected to increase 2% YoY.' } ],
    checks: [
      { id: 'math_noi', label: 'NOI = EGI − OpEx', status: 'pass' },
      { id: 'rent_match', label: 'Annualized rent roll ≈ GPR', status: 'warn', detail: 'Within 3% tolerance' },
    ],
    confidences: { t12: 0.97, rentRoll: 0.94 }
  };
}

/** Upload endpoint */
propertyWhispererRoutes.post('/documents/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'file required' });
    const job_id = nanoid();
    jobs.set(job_id, { state: 'queued', progress: 0 });

    // Simulate processing with staged progress and final doc_id
    const filename = req.file.originalname || 'document.pdf';
    const doc_id = nanoid();
    const extraction = makeSampleExtraction({ filename });
    extraction.document.id = doc_id;

    let p = 0;
    const tick = () => {
      const j = jobs.get(job_id);
      if (!j) return;
      p = Math.min(100, p + 20);
      j.state = p >= 100 ? 'complete' : 'processing';
      j.progress = p;
      if (p >= 100) {
        j.doc_id = doc_id;
        documents.set(doc_id, extraction);
      } else {
        setTimeout(tick, 300);
      }
    };
    setTimeout(tick, 200);

    res.json({ job_id });
  });

/** Job status */
propertyWhispererRoutes.get('/jobs/:job_id/status', (req, res) => {
    const j = jobs.get(req.params.job_id);
    if (!j) return res.status(404).json({ state: 'error', error: 'job not found' });
    res.json(j);
  });

/** Get extraction result */
propertyWhispererRoutes.get('/documents/:doc_id/entities', (req, res) => {
    const d = documents.get(req.params.doc_id);
    if (!d) return res.status(404).json({ error: 'document not found' });
    res.json(d);
  });

export default propertyWhispererRoutes;