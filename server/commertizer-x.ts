import express from 'express';
import multer from 'multer';
import { nanoid } from 'nanoid';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Commertizer X - Workflow Orchestration Agent
// Turns RUNE.CTZ insights into reality through end-to-end workflow execution
// Currently using in-memory storage for rapid development, will be migrated to PostgreSQL

// In-memory stores for rapid prototyping
const workflows: Record<string, any> = {};
const documents: Record<string, any> = {};
const deals: Record<string, any> = {};
const orchestrationLogs: Record<string, string[]> = {};

// === Workflow Management ===

// Create new workflow with RUNE insights
router.post('/workflows', async (req, res) => {
  try {
    const { name, type, userId, runeInsights } = req.body;
    const workflowId = nanoid(10);
    
    console.log(`Commertizer X: Creating workflow "${name}" of type "${type}"`);
    
    const workflow = {
      id: workflowId,
      name,
      type,
      userId: userId || 'guest',
      status: 'pending',
      runeInsights,
      orchestrationSteps: [
        { step: 'Initialize workflow', status: 'completed', result: 'Workflow created' },
        { step: 'Analyze RUNE insights', status: 'pending' },
        { step: 'Execute orchestration', status: 'pending' },
        { step: 'Validate results', status: 'pending' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    workflows[workflowId] = workflow;
    orchestrationLogs[workflowId] = [`Commertizer X workflow ${workflowId} created`];

    res.json({ 
      success: true, 
      workflow,
      message: 'Commertizer X workflow initialized'
    });
  } catch (error) {
    console.error('Commertizer X workflow creation error:', error);
    res.status(500).json({ success: false, error: 'Failed to create workflow' });
  }
});

// Get workflow status
router.get('/workflows/:workflowId', async (req, res) => {
  try {
    const workflow = workflows[req.params.workflowId];

    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    // Include related documents and deals
    const workflowDocuments = Object.values(documents).filter((doc: any) => doc.workflowId === req.params.workflowId);
    const workflowDeals = Object.values(deals).filter((deal: any) => deal.workflowId === req.params.workflowId);

    res.json({ 
      success: true, 
      workflow: {
        ...workflow,
        documents: workflowDocuments,
        deals: workflowDeals,
        logs: orchestrationLogs[req.params.workflowId] || []
      }
    });
  } catch (error) {
    console.error('Commertizer X workflow fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch workflow' });
  }
});

// Update workflow step
router.patch('/workflows/:workflowId/steps', async (req, res) => {
  try {
    const { stepIndex, status, result, error } = req.body;
    
    const workflow = workflows[req.params.workflowId];

    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    const steps = [...workflow.orchestrationSteps];
    if (stepIndex < steps.length) {
      steps[stepIndex] = { ...steps[stepIndex], status, result, error };
      
      workflow.orchestrationSteps = steps;
      workflow.updatedAt = new Date().toISOString();
      
      if (status === 'completed' && stepIndex === steps.length - 1) {
        workflow.status = 'completed';
        workflow.completedAt = new Date().toISOString();
      }

      orchestrationLogs[req.params.workflowId].push(`Step ${stepIndex} updated to ${status}: ${result || error}`);
    }

    console.log(`Commertizer X: Updated workflow ${req.params.workflowId} step ${stepIndex} to ${status}`);
    res.json({ success: true, message: 'Workflow step updated' });
  } catch (error) {
    console.error('Commertizer X step update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update workflow step' });
  }
});

// === Document Processing Orchestration ===

// Process document with full orchestration
router.post('/orchestrate/document', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { userId = 'guest', workflowName = 'Document Processing' } = req.body;
    
    console.log(`Commertizer X: Orchestrating document processing for ${req.file.originalname}`);

    // 1. Create workflow
    const workflow = await db.insert(workflows).values({
      name: workflowName,
      type: 'document_processing',
      userId,
      orchestrationSteps: [
        { step: 'Document upload', status: 'completed', result: 'File uploaded successfully' },
        { step: 'Extract financial data', status: 'in_progress' },
        { step: 'Reconcile and validate', status: 'pending' },
        { step: 'Calculate DQI score', status: 'pending' },
        { step: 'Generate deal structure', status: 'pending' }
      ]
    }).returning();

    // 2. Create document record
    const document = await db.insert(documents).values({
      workflowId: workflow[0].id,
      userId,
      filename: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      status: 'processing'
    }).returning();

    // 3. Simulate processing (in real implementation, integrate with actual extraction service)
    setTimeout(async () => {
      try {
        // Simulate extraction results
        const extractedData = {
          totals: { noi: 450000, dscr: 1.35, egi: 650000, opex: 200000 },
          rentRoll: [
            { tenant: 'Major Retailer', base_rent: 15000, end_date: '2027-12-31' },
            { tenant: 'Professional Services', base_rent: 8500, end_date: '2026-06-30' }
          ],
          debtTerms: { principal: 3200000, rate_type: 'floating', all_in_rate: 0.065 },
          confidences: { rentRoll: 0.95, t12: 0.92 }
        };

        const dqiScore = calculateDQIScore(extractedData);

        // Update document
        await db.update(documents)
          .set({
            status: 'validated',
            extractedData,
            dqiScore,
            processingLogs: ['Extraction completed', 'DQI calculated', 'Validation passed']
          })
          .where(eq(documents.id, document[0].id));

        // Update workflow steps
        await db.update(workflows)
          .set({
            orchestrationSteps: [
              { step: 'Document upload', status: 'completed', result: 'File uploaded successfully' },
              { step: 'Extract financial data', status: 'completed', result: 'Data extracted with 95% confidence' },
              { step: 'Reconcile and validate', status: 'completed', result: 'Validation passed' },
              { step: 'Calculate DQI score', status: 'completed', result: `DQI Score: ${dqiScore}` },
              { step: 'Generate deal structure', status: 'completed', result: 'Deal ready for review' }
            ],
            status: 'completed',
            completedAt: new Date()
          })
          .where(eq(workflows.id, workflow[0].id));

        console.log(`Commertizer X: Document processing completed for workflow ${workflow[0].id}`);
      } catch (error) {
        console.error('Commertizer X processing error:', error);
        await db.update(workflows)
          .set({ status: 'failed' })
          .where(eq(workflows.id, workflow[0].id));
      }
    }, 3000);

    res.json({
      success: true,
      workflowId: workflow[0].id,
      documentId: document[0].id,
      message: 'Commertizer X orchestration initiated'
    });

  } catch (error) {
    console.error('Commertizer X orchestration error:', error);
    res.status(500).json({ success: false, error: 'Orchestration failed' });
  }
});

// === Deal Creation Orchestration ===

// Create deal from workflow
router.post('/orchestrate/deal', async (req, res) => {
  try {
    const { workflowId, documentId, dealName, userId = 'guest' } = req.body;

    console.log(`Commertizer X: Creating deal from workflow ${workflowId}`);

    // Get document data
    const document = await db.query.documents.findFirst({
      where: eq(documents.id, documentId)
    });

    if (!document || !document.extractedData) {
      return res.status(400).json({ success: false, error: 'Document not ready for deal creation' });
    }

    const { totals, debtTerms } = document.extractedData as any;

    // Create deal
    const deal = await db.insert(deals).values({
      workflowId,
      documentId,
      userId,
      name: dealName || 'Commertizer X Auto-Generated Deal',
      stage: 'Draft',
      dqiScore: document.dqiScore,
      targetAmount: totals.noi ? Math.round(totals.noi * 12) : 0, // Rough cap rate estimate
      financials: {
        noi: totals.noi,
        dscr: totals.dscr,
        egi: totals.egi,
        opex: totals.opex,
        debt: debtTerms
      },
      runeAnalysis: generateRUNEAnalysis(document.extractedData, document.dqiScore)
    }).returning();

    res.json({
      success: true,
      deal: deal[0],
      message: 'Commertizer X deal orchestration completed'
    });

  } catch (error) {
    console.error('Commertizer X deal creation error:', error);
    res.status(500).json({ success: false, error: 'Deal creation failed' });
  }
});

// === Dashboard & Analytics ===

// Get user workflows
router.get('/users/:userId/workflows', async (req, res) => {
  try {
    const userWorkflows = await db.query.workflows.findMany({
      where: eq(workflows.userId, req.params.userId),
      orderBy: desc(workflows.createdAt),
      with: {
        documents: true,
        deals: true
      }
    });

    res.json({ success: true, workflows: userWorkflows });
  } catch (error) {
    console.error('Commertizer X user workflows error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user workflows' });
  }
});

// Get orchestration analytics
router.get('/analytics/orchestration', async (req, res) => {
  try {
    // Get workflow statistics
    const totalWorkflows = await db.$count(workflows);
    const completedWorkflows = await db.$count(workflows, eq(workflows.status, 'completed'));
    const activeWorkflows = await db.$count(workflows, eq(workflows.status, 'in_progress'));
    
    const totalDocuments = await db.$count(documents);
    const processedDocuments = await db.$count(documents, eq(documents.status, 'validated'));
    
    const totalDeals = await db.$count(deals);

    res.json({
      success: true,
      analytics: {
        workflows: {
          total: totalWorkflows,
          completed: completedWorkflows,
          active: activeWorkflows,
          successRate: totalWorkflows > 0 ? Math.round((completedWorkflows / totalWorkflows) * 100) : 0
        },
        documents: {
          total: totalDocuments,
          processed: processedDocuments,
          processingRate: totalDocuments > 0 ? Math.round((processedDocuments / totalDocuments) * 100) : 0
        },
        deals: {
          total: totalDeals,
          automated: totalDeals // All deals are automated through Commertizer X
        }
      }
    });
  } catch (error) {
    console.error('Commertizer X analytics error:', error);
    res.status(500).json({ success: false, error: 'Analytics fetch failed' });
  }
});

// === Helper Functions ===

function calculateDQIScore(extractedData: any): number {
  const { totals, debtTerms, rentRoll, confidences } = extractedData;
  let score = 70; // Base score

  // DSCR analysis
  const dscr = totals?.dscr || 0;
  if (dscr >= 1.40) score += 8;
  else if (dscr >= 1.20) score += 4;
  else if (dscr >= 1.10) score += 1;
  else score -= 8;

  // Debt structure
  if (debtTerms?.rate_type === 'floating' && !debtTerms?.rate_cap) score -= 5;

  // Data confidence
  if (confidences?.rentRoll < 0.95) score -= 2;
  if (confidences?.t12 < 0.95) score -= 1;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function generateRUNEAnalysis(extractedData: any, dqiScore: number): any {
  const { totals, debtTerms, rentRoll } = extractedData;
  
  const strengths = [];
  const risks = [];
  const recommendations = [];
  const pillarScores: Record<string, number> = {};

  // Analyze strengths
  if (totals?.dscr >= 1.30) strengths.push('Strong debt service coverage ratio');
  if (totals?.noi > 400000) strengths.push('Solid net operating income');
  
  // Analyze risks
  if (debtTerms?.rate_type === 'floating') risks.push('Variable rate debt exposure');
  if (rentRoll?.length <= 2) risks.push('Limited tenant diversification');

  // Generate recommendations
  if (dqiScore >= 80) recommendations.push('Excellent investment opportunity');
  else if (dqiScore >= 70) recommendations.push('Solid investment with minor improvements needed');
  else recommendations.push('Requires significant due diligence');

  // Pillar scores (simplified)
  pillarScores['Leverage & Coverage'] = Math.min(100, (totals?.dscr || 1) * 60);
  pillarScores['Cash-Flow Quality'] = dqiScore > 75 ? 85 : 65;
  pillarScores['Lease & Tenant Risk'] = rentRoll?.length > 3 ? 80 : 60;
  pillarScores['Sponsor Quality'] = 75; // Default
  pillarScores['Market Strength'] = 70; // Default
  pillarScores['Structure & Legal'] = 75; // Default
  pillarScores['Data Confidence'] = Math.round((extractedData.confidences?.rentRoll || 0.9) * 100);

  return {
    strengths,
    risks,
    recommendations,
    pillarScores
  };
}

export default router;