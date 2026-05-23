import { describe, it, expect, afterEach } from 'vitest';
import { existsSync, unlinkSync, readFileSync } from 'fs';
import { generateMarkdownReport } from '../../src/reporter/markdown.js';
import type { ScanResult } from '../../src/engine/types.js';
import type { AIFix } from '../../src/ai/types.js';

const TEST_OUTPUT = 'test-report.md';

afterEach(() => { if (existsSync(TEST_OUTPUT)) unlinkSync(TEST_OUTPUT); });

describe('generateMarkdownReport', () => {
  it('writes a markdown file with violation details', () => {
    const result: ScanResult = {
      pages: [{
        url: 'http://localhost:3000/',
        violations: [{
          ruleId: 'img-alt', wcag: '1.1.1', level: 'A', impact: 'critical',
          description: 'Images must have an alt attribute',
          selector: '#missing-alt', html: '<img src="photo.jpg" id="missing-alt">',
          page: 'http://localhost:3000/',
        }],
      }],
      totalViolations: 1, criticalCount: 1, seriousCount: 0, moderateCount: 0, minorCount: 0,
    };
    const fixes: AIFix[] = [{
      ruleId: 'img-alt', selector: '#missing-alt',
      explanation: 'Screen readers cannot describe this image to blind users.',
      fixedCode: '<img src="photo.jpg" id="missing-alt" alt="Description of image">',
      wcagReference: 'WCAG 2.1 SC 1.1.1 — Non-text Content',
    }];

    generateMarkdownReport(result, fixes, TEST_OUTPUT);
    const content = readFileSync(TEST_OUTPUT, 'utf-8');

    expect(content).toContain('WCAG A11y Report');
    expect(content).toContain('img-alt');
    expect(content).toContain('Screen readers cannot describe');
    expect(existsSync(TEST_OUTPUT)).toBe(true);
  });
});
