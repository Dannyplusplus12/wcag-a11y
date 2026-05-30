import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { mediaRules } from '../../src/engine/rules/media.js';

let browser: Browser; let page: Page; let server: ReturnType<typeof createServer>;
const PORT = 9883;

beforeAll(async () => {
  const html = readFileSync('tests/fixtures/test.html', 'utf-8');
  server = createServer((_, res) => { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(html); }).listen(PORT);
  browser = await chromium.launch(); page = await browser.newPage();
  await page.goto(`http://localhost:${PORT}`);
});
afterAll(async () => { await browser.close(); server.close(); });

describe('video-captions rule', () => {
  it('detects video elements missing a captions track', async () => {
    const rule = mediaRules.find((r) => r.id === 'video-captions')!;
    const violations = await page.evaluate(
      ({ checkFn }) => new Function(`return (${checkFn})`)()(),
      { checkFn: rule.check.toString() }
    );
    expect(violations.some((v: { selector: string }) => v.selector.includes('video-no-captions'))).toBe(true);
  });
});

describe('audio-transcript rule', () => {
  it('detects audio elements without a linked transcript', async () => {
    const rule = mediaRules.find((r) => r.id === 'audio-transcript')!;
    const violations = await page.evaluate(
      ({ checkFn }) => new Function(`return (${checkFn})`)()(),
      { checkFn: rule.check.toString() }
    );
    expect(violations.some((v: { selector: string }) => v.selector.includes('audio-no-transcript'))).toBe(true);
  });
});

describe('audio-description rule', () => {
  it('detects video elements missing an audio description track', async () => {
    const rule = mediaRules.find((r) => r.id === 'audio-description')!;
    const violations = await page.evaluate(
      ({ checkFn }) => new Function(`return (${checkFn})`)()(),
      { checkFn: rule.check.toString() }
    );
    expect(violations.some((v: { selector: string }) => v.selector.includes('video-no-captions'))).toBe(true);
  });
});
