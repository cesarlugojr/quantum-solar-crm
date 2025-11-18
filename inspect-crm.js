/**
 * CRM Layout Inspector
 * Captures screenshots and analyzes spacing/layout issues
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PAGES_TO_INSPECT = [
  { url: 'https://crm.quantumsolar.us/crm', name: 'dashboard' },
  { url: 'https://crm.quantumsolar.us/crm/leads', name: 'leads' },
  { url: 'https://crm.quantumsolar.us/crm/projects', name: 'projects' },
  { url: 'https://crm.quantumsolar.us/crm/campaigns', name: 'campaigns' },
  { url: 'https://crm.quantumsolar.us/crm/candidates', name: 'candidates' },
  { url: 'https://crm.quantumsolar.us/crm/campaigns/new', name: 'campaigns-new' },
];

const SCREENSHOTS_DIR = path.join(__dirname, 'layout-screenshots');

// Create screenshots directory
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function analyzeLayoutIssues(page) {
  // Execute client-side analysis
  return await page.evaluate(() => {
    const issues = [];

    // Check for overlapping elements
    const elements = document.querySelectorAll('*');
    const rects = Array.from(elements).map(el => ({
      element: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : ''),
      rect: el.getBoundingClientRect(),
      styles: window.getComputedStyle(el),
    }));

    // Check for elements with negative margins
    rects.forEach(({ element, rect, styles }) => {
      const marginTop = parseFloat(styles.marginTop);
      const marginBottom = parseFloat(styles.marginBottom);
      const marginLeft = parseFloat(styles.marginLeft);
      const marginRight = parseFloat(styles.marginRight);

      if (marginTop < -20 || marginBottom < -20 || marginLeft < -20 || marginRight < -20) {
        issues.push({
          type: 'negative-margin',
          element,
          value: { marginTop, marginBottom, marginLeft, marginRight },
        });
      }
    });

    // Check for overflow issues
    Array.from(elements).forEach(el => {
      const styles = window.getComputedStyle(el);
      const overflow = styles.overflow;
      const rect = el.getBoundingClientRect();

      if (overflow === 'hidden' && (rect.width === 0 || rect.height === 0)) {
        issues.push({
          type: 'hidden-overflow',
          element: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : ''),
          dimensions: { width: rect.width, height: rect.height },
        });
      }
    });

    // Check for inconsistent spacing
    const sections = document.querySelectorAll('section, div[class*="container"], main > div');
    const spacings = [];
    sections.forEach(section => {
      const styles = window.getComputedStyle(section);
      const paddingTop = parseFloat(styles.paddingTop);
      const paddingBottom = parseFloat(styles.paddingBottom);
      const marginTop = parseFloat(styles.marginTop);
      const marginBottom = parseFloat(styles.marginBottom);

      spacings.push({
        element: section.tagName + (section.className ? '.' + section.className.split(' ')[0] : ''),
        paddingTop,
        paddingBottom,
        marginTop,
        marginBottom,
      });
    });

    // Check for elements cut off at viewport edges
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    Array.from(elements).forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.right > viewportWidth + 10 || rect.bottom > viewportHeight + 10) {
        issues.push({
          type: 'viewport-overflow',
          element: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : ''),
          position: { right: rect.right, bottom: rect.bottom },
          viewport: { width: viewportWidth, height: viewportHeight },
        });
      }
    });

    return { issues, spacings };
  });
}

async function capturePageScreenshots(page, pageName) {
  console.log(`\n📸 Capturing screenshots for: ${pageName}`);

  // Full page screenshot
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, `${pageName}-full.png`),
    fullPage: true,
  });

  // Viewport screenshot
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, `${pageName}-viewport.png`),
    fullPage: false,
  });

  console.log(`✅ Screenshots saved for ${pageName}`);
}

async function inspectPage(browser, pageConfig) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log(`\n🔍 Inspecting: ${pageConfig.url}`);

  try {
    await page.goto(pageConfig.url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait for content to render
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Capture screenshots
    await capturePageScreenshots(page, pageConfig.name);

    // Analyze layout issues
    const analysis = await analyzeLayoutIssues(page);

    // Save analysis report
    const reportPath = path.join(SCREENSHOTS_DIR, `${pageConfig.name}-analysis.json`);
    fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));

    console.log(`📊 Analysis saved: ${reportPath}`);
    console.log(`   - Found ${analysis.issues.length} potential issues`);
    console.log(`   - Analyzed ${analysis.spacings.length} spacing elements`);

    return analysis;
  } catch (error) {
    console.error(`❌ Error inspecting ${pageConfig.url}:`, error.message);
    return null;
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('🚀 Starting CRM Layout Inspector...\n');
  console.log(`📁 Screenshots will be saved to: ${SCREENSHOTS_DIR}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const results = {};

  for (const pageConfig of PAGES_TO_INSPECT) {
    const analysis = await inspectPage(browser, pageConfig);
    if (analysis) {
      results[pageConfig.name] = analysis;
    }
  }

  await browser.close();

  // Generate summary report
  const summaryPath = path.join(SCREENSHOTS_DIR, 'summary-report.json');
  fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));

  console.log('\n✅ Inspection complete!');
  console.log(`📊 Summary report: ${summaryPath}`);
  console.log(`📸 All screenshots saved to: ${SCREENSHOTS_DIR}`);

  // Print summary
  console.log('\n📋 SUMMARY:');
  Object.entries(results).forEach(([pageName, analysis]) => {
    console.log(`\n${pageName}:`);
    console.log(`  - Issues found: ${analysis.issues.length}`);
    if (analysis.issues.length > 0) {
      const issueTypes = [...new Set(analysis.issues.map(i => i.type))];
      console.log(`  - Issue types: ${issueTypes.join(', ')}`);
    }
  });
}

main().catch(console.error);
