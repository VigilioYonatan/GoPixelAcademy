import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

async function captureSeniorUX() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    headless: true,
    defaultViewport: { width: 1400, height: 900, deviceScaleFactor: 2 },
  });

  const page = await browser.newPage();
  const outDir = path.resolve('screenshots/senior-ux');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Senior Dashboard - Dark Mode
  await page.goto('http://localhost:5173/gopixel-academy/#/senior', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, '01-senior-dashboard-dark.png') });

  // 2. Senior Dashboard - Light Mode
  const themeBtn = await page.$('.circle-action:first-of-type');
  if (themeBtn) {
    await page.evaluate(el => el.click(), themeBtn);
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(outDir, '02-senior-dashboard-light.png') });
    // Switch back to dark
    await page.evaluate(el => el.click(), themeBtn);
    await new Promise(r => setTimeout(r, 400));
  }

  // 3. Senior Module Hub (S01)
  await page.goto('http://localhost:5173/gopixel-academy/#/senior/S01', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, '03-senior-hub-s01.png') });

  // 4. Senior Readiness Radar
  await page.goto('http://localhost:5173/gopixel-academy/#/senior/readiness', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, '04-senior-readiness.png') });

  // 5. Mobile view (iPhone / 390px)
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5173/gopixel-academy/#/senior', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, '05-senior-dashboard-mobile.png') });

  await browser.close();
  console.log('Senior UX screenshots captured successfully in', outDir);
}

captureSeniorUX().catch(err => {
  console.error(err);
  process.exit(1);
});
