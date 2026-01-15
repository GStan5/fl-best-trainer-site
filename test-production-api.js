// Test production API to see what's happening
const https = require('https');

async function testProductionAPI() {
  console.log('🔍 Testing production API...\n');
  
  try {
    const response = await fetch('https://flbesttrainer.com/api/classes');
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Data success: ${data.success}`);
    console.log(`Classes returned: ${data.data?.length || 0}`);
    
    if (data.data && data.data.length > 0) {
      console.log('\n=== UPCOMING CLASSES ON PRODUCTION ===');
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      console.log(`Today: ${today}`);
      console.log(`Tomorrow: ${tomorrow}\n`);
      
      data.data.slice(0, 5).forEach((c, index) => {
        const classDate = typeof c.date === 'string' ? c.date.split('T')[0] : c.date;
        console.log(`${index + 1}. ${classDate} ${c.start_time}: ${c.title}`);
        
        if (classDate === tomorrow) {
          console.log('   👆 THIS IS TOMORROW\'S CLASS!');
        }
      });
      
      // Check specifically for tomorrow's classes
      const tomorrowClasses = data.data.filter(c => {
        const classDate = typeof c.date === 'string' ? c.date.split('T')[0] : c.date;
        return classDate === tomorrow;
      });
      
      console.log(`\n=== TOMORROW'S CLASSES COUNT: ${tomorrowClasses.length} ===`);
      if (tomorrowClasses.length === 0) {
        console.log('❌ No classes found for tomorrow on production!');
        console.log('This suggests the frontend filtering is removing them.');
      } else {
        console.log('✅ Tomorrow\'s classes found in API data');
        tomorrowClasses.forEach(c => {
          console.log(`- ${c.start_time}: ${c.title}`);
        });
      }
    } else {
      console.log('❌ No class data returned from production API');
    }
    
  } catch (error) {
    console.error('❌ Error testing production API:', error.message);
    
    // Try a simple health check
    try {
      const healthResponse = await fetch('https://flbesttrainer.com/api/health');
      const healthData = await healthResponse.json();
      console.log('\n=== HEALTH CHECK ===');
      console.log(`Status: ${healthResponse.status}`);
      console.log(`Database: ${healthData.database}`);
      console.log(`Timestamp: ${healthData.timestamp}`);
    } catch (healthError) {
      console.log('❌ Health check also failed:', healthError.message);
    }
  }
}

testProductionAPI();