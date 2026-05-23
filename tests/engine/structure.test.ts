import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { structureRules } from '../../src/engine/rules/structure.js';

let browser: Browser; let page: Page; let server: ReturnType<typeof createServer>;
const PORT = 9881;

beforeAll(async () => {
  const html = readFileSync('tests/fixtures/test.html', 'utf-8');
  server = createServer((_, res) => { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(html); }).listen(PORT);
  browser = await chromium.launch(); page = await browser.newPage();
  await page.goto(`http://localhost:${PORT}`);
});
afterAll(async () => { await browser.close(); server.close(); });

describe('heading-order rule', () => {
  it('detects skipped heading levels', async () => {
    const rule = structureRules.find((r) => r.id === 'heading-order')!;
    const violations = await page.evaluate(
      ({ checkFn }) => new Function(`return (${checkFn})`)()(),
      { checkFn: rule.check.toString() }
    );
    expect(violations.length).toBeGreaterThan(0);
  });
});
