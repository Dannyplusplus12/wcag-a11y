import { chromium, type Page } from 'playwright';
import { scanPage } from './engine/index.js';
import type { ScanResult, PageScanResult } from './engine/types.js';

async function detectFramework(page: Page): Promise<string | undefined> {
  try {
    return await page.evaluate((): string | undefined => {
      const w = window as unknown as Record<string, unknown>;
      if (w['__NEXT_DATA__']) return 'Next.js';
      if (w['___gatsby']) return 'Gatsby';
      if (w['__remixContext']) return 'Remix';
      if (w['__nuxt'] || w['$nuxt']) return 'Nuxt.js';
      if (w['__vue_app__']) return 'Vue 3';
      if (w['Vue']) return 'Vue 2';
      if (document.querySelector('[ng-version]') !== null) return 'Angular';
      // React: hook is registered by react-dom on load (most reliable, works with Vite HMR)
      if (w['__REACT_DEVTOOLS_GLOBAL_HOOK__']) return 'React';
      // React fallback: fiber properties on root element
      const root = document.getElementById('root') ?? document.getElementById('app') ?? document.body;
      if (root) {
        const allKeys = Object.getOwnPropertyNames(root);
        if (allKeys.some((k) => k.startsWith('__reactFiber') || k.startsWith('__reactContainer'))) {
          return 'React';
        }
      }
      if (document.querySelector('[data-svelte-h]') !== null) return 'Svelte';
      return undefined;
    });
  } catch {
    return undefined;
  }
}

export interface CrawlOptions {
  url: string;
  pages?: string[];   // e.g. ['/', '/about', '/contact']
  crawl?: boolean;    // auto-discover routes by following same-origin links
  framework?: string; // skip auto-detection and use this value directly
  authState?: string; // path to Playwright storageState JSON (cookies + localStorage)
}

export async function crawl(options: CrawlOptions): Promise<ScanResult> {
  const { url, pages = ['/'], crawl: autoCrawl = false } = options;
  const baseUrl = url.replace(/\/$/, '');
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext(
      options.authState ? { storageState: options.authState } : {}
    );
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
    let framework: string | undefined = options.framework;

    for (const pageUrl of pagesToVisit) {
      const page = await context.newPage();
      try {
        await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 30000 });
        if (!framework) framework = await detectFramework(page);
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
      framework,
    };
  } finally {
    await browser.close();
  }
}
