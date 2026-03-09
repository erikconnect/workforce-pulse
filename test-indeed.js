#!/usr/bin/env node
/**
 * Test Indeed scraping via Bright Data
 */

const { chromium } = require('playwright-core');

async function testIndeed() {
  const wss = 'wss://brd-customer-hl_db4a586d-zone-scraping_browser1:wz3c57va8map@brd.superproxy.io:9222';
  
  let browser;
  try {
    console.log('✅ [1/5] Connecting to Bright Data...');
    browser = await chromium.connectOverCDP(wss);
    
    console.log('✅ [2/5] Creating page...');
    const page = await browser.newPage();
    
    const url = 'https://www.indeed.com/jobs?q=police+officer&l=Montgomery%2C+AL&fromage=30&limit=25';
    console.log('✅ [3/5] Navigating to:', url.substring(0, 60) + '...');
    
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } catch (e) {
      console.log('⚠️ Goto took too long, continuing anyway...');
    }
    
    console.log('✅ [4/5] Waiting for job selectors...');
    try {
      await page.waitForSelector('[data-jk], .job_seen_beacon', { timeout: 5000 }).catch(() => null);
    } catch (e) {
      console.log('⚠️ Selector timeout, checking anyway...');
    }
    
    console.log('✅ [5/5] Extracting jobs...');
    const jobs = await page.evaluate(() => {
      const selectors = ['[data-jk]', '.job_seen_beacon', '[class*="JobCard"]'];
      for (const sel of selectors) {
        const els = document.querySelectorAll(sel);
        if (els.length > 0) {
          return { selector: sel, count: els.length, html: els[0]?.outerHTML.substring(0, 200) };
        }
      }
      return { selector: 'none', count: 0, html: '' };
    });
    
    console.log('\n📊 RESULT:');
    console.log('  Found with selector:', jobs.selector);
    console.log('  Count:', jobs.count);
    if (jobs.count > 0) {
      console.log('  Sample HTML:', jobs.html);
    } else {
      console.log('  ⚠️ No jobs found - page might need more time or selectors changed');
    }
    
    await browser.close();
  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    if (err.stack) {
      console.error('Stack:', err.stack.split('\n').slice(0, 3).join('\n'));
    }
  }
}

testIndeed();
