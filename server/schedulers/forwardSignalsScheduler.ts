import cron from 'node-cron';
import { generateForwardSignalsAnalysis } from '../services/forwardSignalsAnalytics.js';

let forwardSignalsData: any = null;

// Generate initial forward signals analysis
generateForwardSignalsAnalysis().then(data => {
  forwardSignalsData = data;
  console.log('Initial forward signals analysis generated');
}).catch(error => {
  console.error('Error generating initial forward signals analysis:', error);
});

// Schedule forward signals analysis to run daily at 6:00 AM PT (2:00 PM UTC)
cron.schedule('0 14 * * *', async () => {
  console.log('Running scheduled forward signals analysis...');
  try {
    const newAnalysis = await generateForwardSignalsAnalysis();
    if (newAnalysis) {
      forwardSignalsData = newAnalysis;
      console.log('Scheduled forward signals analysis completed successfully');
    }
  } catch (error) {
    console.error('Error in scheduled forward signals analysis:', error);
  }
}, {
  timezone: "America/Los_Angeles"
});

console.log('Forward signals analysis scheduled for 6:00 AM PT daily');

export function getForwardSignalsData() {
  return forwardSignalsData;
}

export function updateForwardSignalsData(data: any) {
  forwardSignalsData = data;
}