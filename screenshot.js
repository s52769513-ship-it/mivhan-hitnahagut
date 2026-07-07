const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // פתח את הקובץ המקומי
  const filePath = path.join(__dirname, 'index.html');
  await page.goto(`file://${filePath}`);
  
  // מחכה שהעמוד יטען
  await page.waitForTimeout(3000);
  
  // צילום 1: הממשק הראשי
  await page.screenshot({ path: 'screenshot1-main.png', fullPage: false });
  console.log('✓ צילום 1: הממשק הראשי');
  
  // חיפוש אחר מטופל ולחיצה
  const patientButtons = await page.locator('[class*="doc-card"]').count();
  if (patientButtons > 0) {
    await page.locator('[class*="doc-card"]').first().click();
    await page.waitForTimeout(1500);
    
    // צילום 2: לאחר בחירת מטופל
    await page.screenshot({ path: 'screenshot2-patient-selected.png', fullPage: false });
    console.log('✓ צילום 2: מטופל נבחר');
  }
  
  // חיפוש אחר כפתור "דוח מלא" ולחיצה
  const reportBtn = await page.locator('button, a').filter({ hasText: /דוח|report/i }).first();
  if (await reportBtn.isVisible()) {
    await reportBtn.click();
    await page.waitForTimeout(2000);
    
    // צילום 3: תפריט האפשרויות עם הנספח החדש
    await page.screenshot({ path: 'screenshot3-report-options.png', fullPage: false });
    console.log('✓ צילום 3: תפריט הדוח עם אפשרות');
  }
  
  await browser.close();
})().catch(console.error);
