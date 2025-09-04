import cron from 'node-cron';
import { generateVacancyHeatmapAnalysis, setLatestVacancyHeatmapAnalysis } from '../services/vacancyHeatmapAnalytics.js';

export function startVacancyHeatmapScheduler() {
  console.log('Starting vacancy heatmap analysis scheduler...');
  
  // Schedule for 7:00 AM PT daily (same as other analyses)
  cron.schedule('0 7 * * *', async () => {
    try {
      console.log('Running scheduled vacancy heatmap analysis...');
      const analysis = await generateVacancyHeatmapAnalysis();
      setLatestVacancyHeatmapAnalysis(analysis);
      console.log('Vacancy heatmap analysis completed and stored');
    } catch (error) {
      console.error('Error in scheduled vacancy heatmap analysis:', error);
    }
  }, {
    timezone: "America/Los_Angeles"
  });

  // Generate initial analysis
  generateVacancyHeatmapAnalysis()
    .then(analysis => {
      setLatestVacancyHeatmapAnalysis(analysis);
      console.log('Initial vacancy heatmap analysis generated');
    })
    .catch(error => {
      console.error('Error generating initial vacancy heatmap analysis:', error);
    });

  console.log('Vacancy heatmap analysis scheduled for 7:00 AM PT daily');
}