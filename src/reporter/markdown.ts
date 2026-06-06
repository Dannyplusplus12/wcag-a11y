import { writeFileSync } from 'fs';
import type { ScanResult } from '../engine/types.js';
import type { AIFix } from '../ai/types.js';

const FRAMEWORK_FENCE: Record<string, string> = {
  'React': 'jsx',
  'Next.js': 'jsx',
  'Gatsby': 'jsx',
  'Remix': 'jsx',
  'Vue 3': 'vue',
  'Vue 2': 'vue',
  'Nuxt.js': 'vue',
  'Svelte': 'svelte',
};

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

    // Group violations by ruleId so grouped fixes aren't repeated per instance
    const byRule = new Map<string, typeof page.violations>();
    for (const v of page.violations) {
      const group = byRule.get(v.ruleId) ?? [];
      group.push(v);
      byRule.set(v.ruleId, group);
    }

    for (const group of byRule.values()) {
      const v = group[0];
      const fix = fixes.find((f) => f.ruleId === v.ruleId);
      const others = group.slice(1);

      const sourceRef = v.source ? ` — \`${v.source}\`` : '';
      lines.push(
        `### ${IMPACT_EMOJI[v.impact] ?? '⚪'} [${v.impact.toUpperCase()}] ${v.description}`,
        '',
        `**Rule:** \`${v.ruleId}\`  `,
        `**WCAG:** ${fix?.wcagReference ?? `SC ${v.wcag} (Level ${v.level})`}  `,
        `**Instances:** ${group.length}`,
        '',
        '**Representative element:**',
        `\`${v.selector}\`${sourceRef}`,
        '```html',
        v.html,
        '```',
        '',
      );

      if (others.length > 0) {
        lines.push(`**Also affects ${others.length} more element${others.length > 1 ? 's' : ''} on this page:**`);
        for (const o of others) {
          const otherSource = o.source ? ` — \`${o.source}\`` : '';
          lines.push(`- \`${o.selector}\`${otherSource}`);
        }
        lines.push('');
      }

      if (fix) {
        lines.push('**Why it matters:**', fix.explanation, '');

        if ((!fix.fixCategory || fix.fixCategory === 'edit-element') && fix.fixedCode) {
          const fence = FRAMEWORK_FENCE[result.framework ?? ''] ?? 'html';
          lines.push('**Fixed code:**', `\`\`\`${fence}`, fix.fixedCode, '```', '');
        }

        lines.push(
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
