import cron from 'node-cron';
import { generateDailyCapRateAnalysis } from '../services/capRateAnalytics';

let cachedAnalysis: any = null;

// Schedule cap rate analysis daily at 7:00 AM PT
export function startCapRateScheduler() {
  console.log('Starting cap rate analysis scheduler...');
  
  // Schedule daily analysis at 7:00 AM PT (UTC-8)
  cron.schedule('0 15 * * *', async () => { // 15:00 UTC = 7:00 AM PT
    try {
      console.log('Generating daily cap rate analysis...');
      cachedAnalysis = await generateDailyCapRateAnalysis();
      console.log('Daily cap rate analysis generated successfully');
    } catch (error) {
      console.error('Error generating daily cap rate analysis:', error);
    }
  }, {
    timezone: 'America/Los_Angeles'
  });

  console.log('Cap rate analysis scheduled for 7:00 AM PT daily');
  
  // Generate initial analysis if none exists
  if (!cachedAnalysis) {
    generateDailyCapRateAnalysis()
      .then(analysis => {
        cachedAnalysis = analysis;
        console.log('Initial cap rate analysis generated');
      })
      .catch(error => {
        console.error('Error generating initial cap rate analysis:', error);
      });
  }
}

export function getCachedCapRateAnalysis() {
  return cachedAnalysis;
}

export function setCachedCapRateAnalysis(analysis: any) {
  cachedAnalysis = analysis;
}