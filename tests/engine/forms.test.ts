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
