import cron from 'node-cron';
import { generateDailyTokenizedAumAnalysis } from '../services/tokenizedAumAnalytics';

let cachedAnalysis: any = null;

// Schedule tokenized AUM analysis daily at 7:00 AM PT
export function startTokenizedAumScheduler() {
  console.log('Starting tokenized AUM analysis scheduler...');
  
  // Schedule daily analysis at 7:00 AM PT (UTC-8)
  cron.schedule('0 15 * * *', async () => { // 15:00 UTC = 7:00 AM PT
    try {
      console.log('Generating daily tokenized AUM analysis...');
      cachedAnalysis = await generateDailyTokenizedAumAnalysis();
      console.log('Daily tokenized AUM analysis generated successfully');
    } catch (error) {
      console.error('Error generating daily tokenized AUM analysis:', error);
    }
  }, {
    timezone: 'America/Los_Angeles'
  });

  console.log('Tokenized AUM analysis scheduled for 7:00 AM PT daily');
  
  // Generate initial analysis if none exists
  if (!cachedAnalysis) {
    generateDailyTokenizedAumAnalysis()
      .then(analysis => {
        cachedAnalysis = analysis;
        console.log('Initial tokenized AUM analysis generated');
      })
      .catch(error => {
        console.error('Error generating initial tokenized AUM analysis:', error);
      });
  }
}

export function getCachedTokenizedAumAnalysis() {
  return cachedAnalysis;
}

export function setCachedTokenizedAumAnalysis(analysis: any) {
  cachedAnalysis = analysis;
}