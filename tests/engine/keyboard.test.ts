import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { keyboardRules } from '../../src/engine/rules/keyboard.js';

let browser: Browser; let page: Page; let server: ReturnType<typeof createServer>;
const PORT = 9878;

beforeAll(async () => {
  const html = readFileSync('tests/fixtures/test.html', 'utf-8');
  server = createServer((_, res) => { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(html); }).listen(PORT);
  browser = await chromium.launch(); page = await browser.newPage();
  await page.goto(`http://localhost:${PORT}`);
});
afterAll(async () => { await browser.close(); server.close(); });

describe('no-positive-tabindex rule', () => {
  it('detects elements with tabindex > 0', async () => {
    const rule = keyboardRules.find((r) => r.id === 'no-positive-tabindex')!;
    const violations = await page.evaluate(
      ({ checkFn }) => new Function(`return (${checkFn})`)()(),
      { checkFn: rule.check.toString() }
    );
    expect(violations.some((v: { selector: string }) => v.selector.includes('positive-tabindex'))).toBe(true);
    expect(violations.some((v: { selector: string }) => v.selector.includes('valid-tabindex'))).toBe(false);
  });
});

describe('interactive-not-focusable rule', () => {
  it('detects div with onclick but no role or tabindex', async () => {
    const rule = keyboardRules.find((r) => r.id === 'interactive-not-focusable')!;
    const violations = await page.evaluate(
      ({ checkFn }) => new Function(`return (${checkFn})`)()(),
      { checkFn: rule.check.toString() }
    );
    expect(violations.some((v: { selector: string }) => v.selector.includes('div-click'))).toBe(true);
  });
});
