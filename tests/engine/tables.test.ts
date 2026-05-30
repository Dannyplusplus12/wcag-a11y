import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser, type Page } from 'playwright';
import { tableRules } from '../../src/engine/rules/tables.js';

let browser: Browser; let page: Page;

beforeAll(async () => {
  browser = await chromium.launch();
  page = await browser.newPage();
});
afterAll(async () => { await browser.close(); });

describe('table-headers rule', () => {
  it('detects a data table with no <th> elements', async () => {
    await page.setContent(`<!DOCTYPE html><html lang="en"><body>
      <table id="no-headers"><tr><td>Name</td><td>Age</td></tr><tr><td>Alice</td><td>30</td></tr></table>
      <table id="valid-table"><tr><th>Name</th><th>Age</th></tr><tr><td>Alice</td><td>30</td></tr></table>
      <table role="presentation" id="presentational"><tr><td>Layout cell</td></tr></table>
    </body></html>`);
    const rule = tableRules.find((r) => r.id === 'table-headers')!;
    const violations = await page.evaluate(
      ({ checkFn }) => new Function(`return (${checkFn})`)()(),
      { checkFn: rule.check.toString() }
    );
    expect(violations.some((v: { selector: string }) => v.selector.includes('no-headers'))).toBe(true);
    expect(violations.some((v: { selector: string }) => v.selector.includes('valid-table'))).toBe(false);
    expect(violations.some((v: { selector: string }) => v.selector.includes('presentational'))).toBe(false);
  });
});

describe('table-scope-valid rule', () => {
  it('detects <th> with an invalid scope attribute', async () => {
    await page.setContent(`<!DOCTYPE html><html lang="en"><body>
      <table><tr><th scope="invalid" id="bad-scope">Header</th></tr></table>
      <table><tr><th scope="col" id="good-scope">Header</th></tr></table>
    </body></html>`);
    const rule = tableRules.find((r) => r.id === 'table-scope-valid')!;
    const violations = await page.evaluate(
      ({ checkFn }) => new Function(`return (${checkFn})`)()(),
      { checkFn: rule.check.toString() }
    );
    expect(violations.some((v: { selector: string }) => v.selector.includes('bad-scope'))).toBe(true);
    expect(violations.some((v: { selector: string }) => v.selector.includes('good-scope'))).toBe(false);
  });

  it('accepts all valid scope values', async () => {
    await page.setContent(`<!DOCTYPE html><html lang="en"><body>
      <table>
        <tr><th scope="col">Col</th><th scope="row">Row</th><th scope="colgroup">CG</th><th scope="rowgroup">RG</th></tr>
      </table>
    </body></html>`);
    const rule = tableRules.find((r) => r.id === 'table-scope-valid')!;
    const violations = await page.evaluate(
      ({ checkFn }) => new Function(`return (${checkFn})`)()(),
      { checkFn: rule.check.toString() }
    );
    expect(violations).toHaveLength(0);
  });
});

describe('td-headers-attr rule', () => {
  it('detects a <td> referencing a non-existent header ID', async () => {
    await page.setContent(`<!DOCTYPE html><html lang="en"><body>
      <table>
        <tr><th id="real-header">Name</th></tr>
        <tr><td id="bad-ref" headers="nonexistent-id">Alice</td></tr>
        <tr><td id="good-ref" headers="real-header">Bob</td></tr>
      </table>
    </body></html>`);
    const rule = tableRules.find((r) => r.id === 'td-headers-attr')!;
    const violations = await page.evaluate(
      ({ checkFn }) => new Function(`return (${checkFn})`)()(),
      { checkFn: rule.check.toString() }
    );
    expect(violations.some((v: { selector: string }) => v.selector.includes('bad-ref'))).toBe(true);
    expect(violations.some((v: { selector: string }) => v.selector.includes('good-ref'))).toBe(false);
  });
});

describe('table-duplicate-name rule', () => {
  it('detects a table where summary and caption text are identical', async () => {
    await page.setContent(`<!DOCTYPE html><html lang="en"><body>
      <table id="duplicate-name" summary="User data">
        <caption>User data</caption>
        <tr><th>Name</th></tr>
      </table>
      <table id="different-name" summary="Summary of users">
        <caption>User table</caption>
        <tr><th>Name</th></tr>
      </table>
    </body></html>`);
    const rule = tableRules.find((r) => r.id === 'table-duplicate-name')!;
    const violations = await page.evaluate(
      ({ checkFn }) => new Function(`return (${checkFn})`)()(),
      { checkFn: rule.check.toString() }
    );
    expect(violations.some((v: { selector: string }) => v.selector.includes('duplicate-name'))).toBe(true);
    expect(violations.some((v: { selector: string }) => v.selector.includes('different-name'))).toBe(false);
  });
});
