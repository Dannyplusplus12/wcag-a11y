import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import { languageRules } from '../../src/engine/rules/language.js';

let browser: Browser; let page: Page;

beforeAll(async () => {
  browser = await chromium.launch();
  page = await browser.newPage();
});
afterAll(async () => { await browser.close(); });

describe('html-lang rule', () => {
  it('detects missing lang attribute on <html>', async () => {
    await page.setContent('<!DOCTYPE html><html><head><title>Test</title></head><body></body></html>');
    const rule = languageRules.find((r) => r.id === 'html-lang')!;
    const violations = await page.evaluate(
      ({ checkFn }) => new Function(`return (${checkFn})`)()(),
      { checkFn: rule.check.toString() }
    );
    expect(violations.length).toBeGreaterThan(0);
  });

  it('passes when lang attribute is present', async () => {
    await page.setContent('<!DOCTYPE html><html lang="en"><head><title>Test</title></head><body></body></html>');
    const rule = languageRules.find((r) => r.id === 'html-lang')!;
    const violations = await page.evaluate(
      ({ checkFn }) => new Function(`return (${checkFn})`)()(),
      { checkFn: rule.check.toString() }
    );
    expect(violations.length).toBe(0);
  });
});

describe('html-lang-valid rule', () => {
  it('detects an invalid BCP 47 lang value', async () => {
    await page.setContent('<!DOCTYPE html><html lang="not-valid-123!"><head><title>Test</title></head><body></body></html>');
    const rule = languageRules.find((r) => r.id === 'html-lang-valid')!;
    const violations = await page.evaluate(
      ({ checkFn }) => new Function(`return (${checkFn})`)()(),
      { checkFn: rule.check.toString() }
    );
    expect(violations.length).toBeGreaterThan(0);
  });

  it('passes for a valid BCP 47 lang tag', async () => {
    await page.setContent('<!DOCTYPE html><html lang="en-US"><head><title>Test</title></head><body></body></html>');
    const rule = languageRules.find((r) => r.id === 'html-lang-valid')!;
    const violations = await page.evaluate(
      ({ checkFn }) => new Function(`return (${checkFn})`)()(),
      { checkFn: rule.check.toString() }
    );
    expect(violations.length).toBe(0);
  });
});
