import cron from 'node-cron';

export function startNewsScheduler() {
  console.log('Starting news article scheduler...');

  // Generate news articles daily at 7:00 AM PT (14:00 UTC)
  const categories = ['CRE', 'Tokenization', 'RWA', 'Crypto', 'Digital Assets', 'Regulation', 'Technology', 'Markets'];
  
  // Track last used categories to prevent immediate repetition
  let lastUsedCategories: string[] = [];
  const maxHistorySize = 3; // Don't repeat categories used in last 3 articles
  
  // Daily at 7:00 AM Pacific Time (15:00 UTC during PST, 14:00 UTC during PDT)
  cron.schedule('0 14 * * *', async () => {
    try {
      const today = new Date();
      const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
      console.log(`Running ${dayName} news generation...`);
      
      // Select a category that hasn't been used recently
      const availableCategories = categories.filter(cat => !lastUsedCategories.includes(cat));
      const selectedCategory = availableCategories.length > 0 
        ? availableCategories[Math.floor(Math.random() * availableCategories.length)]
        : categories[Math.floor(Math.random() * categories.length)];
      
      // Update history
      lastUsedCategories.push(selectedCategory);
      if (lastUsedCategories.length > maxHistorySize) {
        lastUsedCategories.shift();
      }
      
      console.log(`Selected category for ${dayName}: ${selectedCategory} (avoiding recent: [${lastUsedCategories.slice(0, -1).join(', ')}])`);
      
      const response = await fetch('http://localhost:5000/api/news-articles/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          category: selectedCategory,
          tags: [dayName + ' Update', 'Market Analysis', `${selectedCategory} Focus`]
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Generated ${dayName} news article: ${result.data.title} (${selectedCategory})`);
      } else {
        console.error(`❌ Failed to generate ${dayName} news article in ${selectedCategory} category`);
        // Remove from history if generation failed
        lastUsedCategories.pop();
      }
    } catch (error) {
      console.error('Error in scheduled news generation:', error);
    }
  }, {
    timezone: "America/Los_Angeles"
  });

  console.log('News generation scheduled for daily at 7:00 AM PT');
}