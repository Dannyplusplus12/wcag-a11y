import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { join } from 'path';
import { textAlternativeRules } from '../../src/engine/rules/text-alternatives.js';

let browser: Browser;
let page: Page;
let server: ReturnType<typeof createServer>;
const PORT = 9876;

beforeAll(async () => {
  const html = readFileSync(join('tests/fixtures/test.html'), 'utf-8');
  server = createServer((_, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }).listen(PORT);

  browser = await chromium.launch();
  page = await browser.newPage();
  await page.goto(`http://localhost:${PORT}`);
});

afterAll(async () => {
  await browser.close();
  server.close();
});

describe('img-alt rule', () => {
  it('detects <img> without alt attribute', async () => {
    const rule = textAlternativeRules.find((r) => r.id === 'img-alt')!;
    const violations = await page.evaluate(
      ({ checkFn }) => new Function(`return (${checkFn})`)()(),
      { checkFn: rule.check.toString() }
    );
    expect(violations.some((v: { selector: string }) => v.selector.includes('missing-alt'))).toBe(true);
  });

  it('does not flag <img> with a valid alt attribute', async () => {
    const rule = textAlternativeRules.find((r) => r.id === 'img-alt')!;
    const violations = await page.evaluate(
      ({ checkFn }) => new Function(`return (${checkFn})`)()(),
      { checkFn: rule.check.toString() }
    );
    expect(violations.some((v: { selector: string }) => v.selector.includes('valid-img'))).toBe(false);
  });
});
