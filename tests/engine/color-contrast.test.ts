import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { colorContrastRules } from '../../src/engine/rules/color-contrast.js';

let browser: Browser;
let page: Page;
let server: ReturnType<typeof createServer>;
const PORT = 9877;

beforeAll(async () => {
  const html = readFileSync('tests/fixtures/test.html', 'utf-8');
  server = createServer((_, res) => { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(html); }).listen(PORT);
  browser = await chromium.launch();
  page = await browser.newPage();
  await page.goto(`http://localhost:${PORT}`);
});

afterAll(async () => { await browser.close(); server.close(); });

describe('color-contrast-text rule', () => {
  it('detects text with insufficient contrast ratio', async () => {
    const rule = colorContrastRules.find((r) => r.id === 'color-contrast-text')!;
    const violations = await page.evaluate(
      ({ checkFn }) => new Function(`return (${checkFn})`)()(),
      { checkFn: rule.check.toString() }
    );
    expect(violations.length).toBeGreaterThan(0);
  });
});
