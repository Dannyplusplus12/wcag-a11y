import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { formRules } from '../../src/engine/rules/forms.js';

let browser: Browser; let page: Page; let server: ReturnType<typeof createServer>;
const PORT = 9879;

beforeAll(async () => {
  const html = readFileSync('tests/fixtures/test.html', 'utf-8');
  server = createServer((_, res) => { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(html); }).listen(PORT);
  browser = await chromium.launch(); page = await browser.newPage();
  await page.goto(`http://localhost:${PORT}`);
});
afterAll(async () => { await browser.close(); server.close(); });

describe('label-missing rule', () => {
  it('detects input without associated label', async () => {
    const rule = formRules.find((r) => r.id === 'label-missing')!;
    const violations = await page.evaluate(
      ({ checkFn }) => new Function(`return (${checkFn})`)()(),
      { checkFn: rule.check.toString() }
    );
    expect(violations.some((v: { selector: string }) => v.selector.includes('no-label'))).toBe(true);
    expect(violations.some((v: { selector: string }) => v.selector.includes('labeled-input'))).toBe(false);
  });
});

describe('label-empty rule', () => {
  it('detects label elements with no text content', async () => {
    const rule = formRules.find((r) => r.id === 'label-empty')!;
    const violations = await page.evaluate(
      ({ checkFn }) => new Function(`return (${checkFn})`)()(),
      { checkFn: rule.check.toString() }
    );
    expect(violations.length).toBeGreaterThan(0);
  });
});

describe('error-identification rule', () => {
  it('detects aria-invalid inputs without a linked error message', async () => {
    const rule = formRules.find((r) => r.id === 'error-identification')!;
    const violations = await page.evaluate(
      ({ checkFn }) => new Function(`return (${checkFn})`)()(),
      { checkFn: rule.check.toString() }
    );
    expect(violations.some((v: { selector: string }) => v.selector.includes('invalid-no-desc'))).toBe(true);
    expect(violations.some((v: { selector: string }) => v.selector.includes('invalid-with-desc'))).toBe(false);
  });
});

describe('autocomplete rule', () => {
  it('detects email inputs missing autocomplete attribute', async () => {
    const rule = formRules.find((r) => r.id === 'autocomplete')!;
    const violations = await page.evaluate(
      ({ checkFn }) => new Function(`return (${checkFn})`)()(),
      { checkFn: rule.check.toString() }
    );
    expect(violations.some((v: { selector: string }) => v.selector.includes('labeled-input'))).toBe(true);
  });
});
