import { useState, useCallback } from "react";

export interface RUNEJobStatus {
  state: 'queued' | 'processing' | 'complete' | 'error';
  progress: number;
  docId?: string;
  dealId?: string;
  dqi?: number;
  error?: string;
}

export function useRUNEAutomation() {
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<RUNEJobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runRUNEAutomation = useCallback(async (file: File) => {
    setIsRunning(true);
    setError(null);
    setStatus(null);

    try {
      // 1) Start RUNE job
      const fd = new FormData();
      fd.append('file', file);
      
      console.log('RUNE: Starting automated pipeline...');
      const response = await fetch('/api/rune/intake', { method: 'POST', body: fd });
      
      if (!response.ok) {
        throw new Error(`RUNE intake failed: ${response.status}`);
      }
      
      const { rune_job_id } = await response.json();
      console.log(`RUNE: Job ${rune_job_id} started`);

      // 2) Poll for completion
      let jobStatus: RUNEJobStatus;
      do {
        await new Promise(r => setTimeout(r, 1200));
        
        const statusResponse = await fetch(`/api/rune/jobs/${rune_job_id}`);
        if (!statusResponse.ok) {
          throw new Error(`RUNE status check failed: ${statusResponse.status}`);
        }
        
        jobStatus = await statusResponse.json();
        setStatus(jobStatus);
        
        console.log(`RUNE: Job ${rune_job_id} status: ${jobStatus.state} (${jobStatus.progress}%)`);
        
      } while (jobStatus.state !== 'complete' && jobStatus.state !== 'error');

      if (jobStatus.state === 'error') {
        throw new Error(jobStatus.error || 'RUNE processing failed');
      }

      console.log(`RUNE: Job complete! Deal ID: ${jobStatus.dealId}, DQI: ${jobStatus.dqi}`);
      
      // Notify Commertizer X backend service to orchestrate follow-up workflows
      try {
        await fetch('/api/rune/trigger-orchestration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            runeInsights: {
              strategy: `Deal created with DQI ${jobStatus.dqi}`,
              recommendations: ['Review deal structure', 'Prepare investor materials', 'Initialize tokenization'],
              confidence: 0.95,
              dqi: jobStatus.dqi,
              dealId: jobStatus.dealId
            }
          })
        });
        console.log('Commertizer X: Backend orchestration initiated');
      } catch (error) {
        console.warn('Commertizer X orchestration failed:', error);
      }
      
      return jobStatus;

    } catch (err: any) {
      console.error('RUNE automation error:', err);
      setError(err.message);
      return null;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setStatus(null);
    setError(null);
  }, []);

  return {
    runRUNEAutomation,
    isRunning,
    status,
    error,
    reset
  };
}