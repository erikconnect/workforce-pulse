const { chromium } = require('playwright-core');

const wss = 'wss://brd-customer-hl_db4a586d-zone-scraping_browser1:wz3c57va8map@brd.superproxy.io:9222';

async function testIndeedScrape() {
  let browser;
  try {
    console.log('🔌 Connecting to Bright Data...');
    browser = await chromium.connectOverCDP(wss);
    
    const page = await browser.newPage();
    
    const keyword = 'police officer sheriff deputy';
    const location = 'Montgomery, AL';
    const url = `https://www.indeed.com/jobs?q=${encodeURIComponent(keyword)}&l=${encodeURIComponent(location)}&fromage=30&limit=25`;
    
    console.log('📍 Navigating to Indeed...');
    console.log('URL:', url);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('✅ Page loaded (DOM ready)');
    
    // Wait for job listings to load dynamically
    await page.waitForTimeout(3000);
    console.log('⏳ Waited for dynamic content...');
    
    // Try multiple selectors
    const selectors = [
      'div[data-job-id]',
      '[data-testid="job-card"]',
      'div.job_seen_beacon',
      'div.resultContent'
    ];
    
    for (const selector of selectors) {
      const jobs = await page.locator(selector).all();
      if (jobs.length > 0) {
        console.log(`✅ Found ${jobs.length} jobs with selector: ${selector}`);
        if (jobs.length > 0) {
          const first = jobs[0];
          const text = await first.textContent();
          console.log('📋 First job:', text.substring(0, 150));
        }
        break;
      } else {
        console.log(`❌ Selector "${selector}" found 0 jobs`);
      }
    }
    
    // Try to get page HTML length
    const html = await page.content();
    console.log(`📄 Page HTML length: ${html.length} bytes`);
    
    await browser.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.stack) console.error(err.stack.split('\n').slice(0, 5).join('\n'));
  }
}

testIndeedScrape();
