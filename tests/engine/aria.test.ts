import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { ariaRules } from '../../src/engine/rules/aria.js';

let browser: Browser; let page: Page; let server: ReturnType<typeof createServer>;
const PORT = 9880;

beforeAll(async () => {
  const html = readFileSync('tests/fixtures/test.html', 'utf-8');
  server = createServer((_, res) => { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(html); }).listen(PORT);
  browser = await chromium.launch(); page = await browser.newPage();
  await page.goto(`http://localhost:${PORT}`);
});
afterAll(async () => { await browser.close(); server.close(); });

describe('aria-valid-role', () => {
  it('detects invalid ARIA roles', async () => {
    const rule = ariaRules.find((r) => r.id === 'aria-valid-role')!;
    const violations = await page.evaluate(
      ({ checkFn }) => new Function(`return (${checkFn})`)()(),
      { checkFn: rule.check.toString() }
    );
    expect(violations.some((v: { selector: string }) => v.selector.includes('bad-role'))).toBe(true);
  });
});

describe('aria-hidden-focus', () => {
  it('detects aria-hidden elements that are focusable', async () => {
    const rule = ariaRules.find((r) => r.id === 'aria-hidden-focus')!;
    const violations = await page.evaluate(
      ({ checkFn }) => new Function(`return (${checkFn})`)()(),
      { checkFn: rule.check.toString() }
    );
    expect(violations.some((v: { selector: string }) => v.selector.includes('hidden-but-focusable'))).toBe(true);
  });
});
