import cron from 'node-cron';
import { generateDailyBlockchainAnalysis } from '../services/blockchainAnalytics';

let cachedAnalysis: any = null;

// Schedule blockchain analysis daily at 7:00 AM PT
export function startBlockchainScheduler() {
  console.log('Starting blockchain analysis scheduler...');
  
  // Schedule daily analysis at 7:00 AM PT (UTC-8)
  cron.schedule('0 15 * * *', async () => { // 15:00 UTC = 7:00 AM PT
    try {
      console.log('Generating daily blockchain analysis...');
      cachedAnalysis = await generateDailyBlockchainAnalysis();
      console.log('Daily blockchain analysis generated successfully');
    } catch (error) {
      console.error('Error generating daily blockchain analysis:', error);
    }
  }, {
    timezone: 'America/Los_Angeles'
  });

  console.log('Blockchain analysis scheduled for 7:00 AM PT daily');
  
  // Generate initial analysis if none exists
  if (!cachedAnalysis) {
    generateDailyBlockchainAnalysis()
      .then(analysis => {
        cachedAnalysis = analysis;
        console.log('Initial blockchain analysis generated');
      })
      .catch(error => {
        console.error('Error generating initial blockchain analysis:', error);
      });
  }
}

export function getCachedBlockchainAnalysis() {
  return cachedAnalysis;
}

export function setCachedBlockchainAnalysis(analysis: any) {
  cachedAnalysis = analysis;
}