import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { linkRules } from '../../src/engine/rules/links.js';

let browser: Browser; let page: Page; let server: ReturnType<typeof createServer>;
const PORT = 9882;

beforeAll(async () => {
  const html = readFileSync('tests/fixtures/test.html', 'utf-8');
  server = createServer((_, res) => { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(html); }).listen(PORT);
  browser = await chromium.launch(); page = await browser.newPage();
  await page.goto(`http://localhost:${PORT}`);
});
afterAll(async () => { await browser.close(); server.close(); });

describe('link-empty rule', () => {
  it('detects anchor elements with no accessible name', async () => {
    const rule = linkRules.find((r) => r.id === 'link-empty')!;
    const violations = await page.evaluate(
      ({ checkFn }) => new Function(`return (${checkFn})`)()(),
      { checkFn: rule.check.toString() }
    );
    expect(violations.some((v: { selector: string }) => v.selector.includes('empty-link'))).toBe(true);
    expect(violations.some((v: { selector: string }) => v.selector.includes('valid-link'))).toBe(false);
  });
});

describe('link-name rule', () => {
  it('detects links with meaningless text like "click here"', async () => {
    const rule = linkRules.find((r) => r.id === 'link-name')!;
    const violations = await page.evaluate(
      ({ checkFn }) => new Function(`return (${checkFn})`)()(),
      { checkFn: rule.check.toString() }
    );
    expect(violations.some((v: { selector: string }) => v.selector.includes('click-here'))).toBe(true);
    expect(violations.some((v: { selector: string }) => v.selector.includes('valid-link'))).toBe(false);
  });
});
