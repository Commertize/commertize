import cron from 'node-cron';
import { generateTransactionVolumeAnalysis, setLatestTransactionVolumeAnalysis } from '../services/transactionVolumeAnalytics.js';

export function startTransactionVolumeScheduler() {
  console.log('Starting transaction volume analysis scheduler...');
  
  // Schedule for 7:00 AM PT daily (same as other analyses)
  cron.schedule('0 7 * * *', async () => {
    try {
      console.log('Running scheduled transaction volume analysis...');
      const analysis = await generateTransactionVolumeAnalysis();
      setLatestTransactionVolumeAnalysis(analysis);
      console.log('Transaction volume analysis completed and stored');
    } catch (error) {
      console.error('Error in scheduled transaction volume analysis:', error);
    }
  }, {
    timezone: "America/Los_Angeles"
  });

  // Generate initial analysis
  generateTransactionVolumeAnalysis()
    .then(analysis => {
      setLatestTransactionVolumeAnalysis(analysis);
      console.log('Initial transaction volume analysis generated');
    })
    .catch(error => {
      console.error('Error generating initial transaction volume analysis:', error);
    });

  console.log('Transaction volume analysis scheduled for 7:00 AM PT daily');
}