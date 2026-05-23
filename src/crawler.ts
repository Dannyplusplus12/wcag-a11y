import { chromium } from 'playwright';
import { scanPage } from './engine/index.js';
import type { ScanResult, PageScanResult } from './engine/types.js';

export interface CrawlOptions {
  url: string;
  pages?: string[];   // e.g. ['/', '/about', '/contact']
  crawl?: boolean;    // auto-discover routes by following same-origin links
}

export async function crawl(options: CrawlOptions): Promise<ScanResult> {
  const { url, pages = ['/'], crawl: autoCrawl = false } = options;
  const baseUrl = url.replace(/\/$/, '');
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext();
    let pagesToVisit = pages.map((p) => `${baseUrl}${p}`);

    if (autoCrawl) {
      const discoveredPage = await context.newPage();
      try {
        await discoveredPage.goto(baseUrl, { waitUntil: 'networkidle' });
        const hrefs = await discoveredPage.$$eval('a[href]', (anchors) =>
          anchors.map((a) => (a as HTMLAnchorElement).href)
        );
        const sameOrigin = hrefs
          .filter((href) => href.startsWith(baseUrl))
          .map((href) => href.split('#')[0])
          .filter((v, i, arr) => arr.indexOf(v) === i);
        pagesToVisit = sameOrigin.length > 0 ? sameOrigin : pagesToVisit;
      } finally {
        await discoveredPage.close();
      }
    }

    const results: PageScanResult[] = [];

    for (const pageUrl of pagesToVisit) {
      const page = await context.newPage();
      try {
        await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 30000 });
        const result = await scanPage(page, pageUrl);
        results.push(result);
      } catch (err) {
        console.error(`Failed to scan ${pageUrl}: ${(err as Error).message}`);
        results.push({ url: pageUrl, violations: [] });
      } finally {
        await page.close();
      }
    }

    const allViolations = results.flatMap((r) => r.violations);
    return {
      pages: results,
      totalViolations: allViolations.length,
      criticalCount: allViolations.filter((v) => v.impact === 'critical').length,
      seriousCount: allViolations.filter((v) => v.impact === 'serious').length,
      moderateCount: allViolations.filter((v) => v.impact === 'moderate').length,
      minorCount: allViolations.filter((v) => v.impact === 'minor').length,
    };
  } finally {
    await browser.close();
  }
}
