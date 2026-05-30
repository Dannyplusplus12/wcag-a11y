import { writeFileSync } from 'fs';
import type { ScanResult } from '../engine/types.js';
import type { AIFix } from '../ai/types.js';

const IMPACT_EMOJI: Record<string, string> = {
  critical: '🔴',
  serious: '🟠',
  moderate: '🟡',
  minor: '🟢',
};

export function generateMarkdownReport(result: ScanResult, fixes: AIFix[], opts: { fastMode?: boolean } = {}, outputPath = 'a11y-report.md'): void {
  const lines = opts.fastMode
    ? buildFastReport(fixes)
    : buildFullReport(result, fixes);

  writeFileSync(outputPath, lines.join('\n'), 'utf-8');
  console.log(`\nReport saved → ${outputPath}`);
}

function buildFastReport(fixes: AIFix[]): string[] {
  const lines: string[] = [
    '# WCAG A11y — Fix Prompts',
    `> Generated: ${new Date().toLocaleString()}`,
    '',
  ];

  for (const fix of fixes) {
    const countLabel = fix.instanceCount > 1 ? ` ×${fix.instanceCount}` : '';
    lines.push(`## \`${fix.ruleId}\`${countLabel}`, '');
    lines.push('**Selectors:**');
    for (const sel of fix.selectors) {
      lines.push(`- \`${sel}\``);
    }
    lines.push('', '```', fix.optimalPrompt, '```', '', '---', '');
  }

  return lines;
}

function buildFullReport(result: ScanResult, fixes: AIFix[]): string[] {
  const lines: string[] = [
    '# WCAG A11y Report',
    `> Generated: ${new Date().toLocaleString()}`,
    '',
    '## Summary',
    '',
    `| Impact | Count |`,
    `|--------|-------|`,
    `| 🔴 Critical | ${result.criticalCount} |`,
    `| 🟠 Serious  | ${result.seriousCount} |`,
    `| 🟡 Moderate | ${result.moderateCount} |`,
    `| 🟢 Minor    | ${result.minorCount} |`,
    '',
    '---',
    '',
  ];

  for (const page of result.pages) {
    lines.push(`## Page: ${page.url}`, '');

    if (page.violations.length === 0) {
      lines.push('✅ No violations found.', '', '---', '');
      continue;
    }

    for (const v of page.violations) {
      const fix = fixes.find((f) => f.ruleId === v.ruleId);
      lines.push(
        `### ${IMPACT_EMOJI[v.impact] ?? '⚪'} [${v.impact.toUpperCase()}] ${v.description}`,
        '',
        `**Rule:** \`${v.ruleId}\`  `,
        `**WCAG:** ${fix?.wcagReference ?? `SC ${v.wcag} (Level ${v.level})`}  `,
        `**Selector:** \`${v.selector}\``,
        '',
        '**Violating element:**',
        '```html',
        v.html,
        '```',
        '',
      );

      if (fix) {
        lines.push(
          '**Why it matters:**',
          fix.explanation,
          '',
          '**Fixed code:**',
          '```html',
          fix.fixedCode,
          '```',
          '',
          '**📋 Prompt for your AI assistant (Cursor / Copilot / Claude):**',
          '```',
          fix.optimalPrompt,
          '```',
          '',
        );
      }

      lines.push('---', '');
    }
  }

  return lines;
}
