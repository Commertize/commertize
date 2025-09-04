import cron from 'node-cron';

interface SchedulerConfig {
  enableDaily: boolean;
  enableWeekly: boolean;
  apiBaseUrl: string;
}

class MarketUpdateScheduler {
  private config: SchedulerConfig;
  private dailyJob?: cron.ScheduledTask;
  private weeklyJob?: cron.ScheduledTask;

  constructor(config: SchedulerConfig) {
    this.config = config;
  }

  start() {
    console.log('Starting market update scheduler...');

    if (this.config.enableDaily) {
      // Daily at 7:00 AM PT (15:00 UTC, accounting for PST/PDT)
      this.dailyJob = cron.schedule('0 15 * * *', async () => {
        console.log('Triggering daily market update generation...');
        await this.generateUpdate('daily');
      }, {
        scheduled: true,
        timezone: "UTC"
      });
      console.log('Daily market update scheduled for 7:00 AM PT');
    }

    if (this.config.enableWeekly) {
      // Weekly on Monday at 7:00 AM PT
      this.weeklyJob = cron.schedule('0 15 * * 1', async () => {
        console.log('Triggering weekly market update generation...');
        await this.generateUpdate('weekly');
      }, {
        scheduled: true,
        timezone: "UTC"
      });
      console.log('Weekly market update scheduled for Monday 7:00 AM PT');
    }
  }

  stop() {
    console.log('Stopping market update scheduler...');
    
    if (this.dailyJob) {
      this.dailyJob.stop();
      this.dailyJob = undefined;
    }
    
    if (this.weeklyJob) {
      this.weeklyJob.stop();
      this.weeklyJob = undefined;
    }
  }

  private async generateUpdate(type: 'daily' | 'weekly') {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/api/market-updates/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          force: false,
          focus: ['CRE', 'Tokenization', 'RWA']
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`${type} market update generated successfully:`, result.data.id);
        
        // Auto-publish the update
        await this.publishUpdate(result.data.id);
      } else {
        console.error(`Failed to generate ${type} market update:`, result.error);
      }
    } catch (error) {
      console.error(`Error generating ${type} market update:`, error);
    }
  }

  private async publishUpdate(id: string) {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/api/market-updates/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`Market update published successfully:`, id);
      } else {
        console.error(`Failed to publish market update:`, result.error);
      }
    } catch (error) {
      console.error(`Error publishing market update:`, error);
    }
  }

  // Manual trigger methods for testing
  async triggerDaily() {
    console.log('Manually triggering daily update...');
    await this.generateUpdate('daily');
  }

  async triggerWeekly() {
    console.log('Manually triggering weekly update...');
    await this.generateUpdate('weekly');
  }
}

export default MarketUpdateScheduler;