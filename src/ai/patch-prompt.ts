import type { Violation } from '../engine/types.js';

export function buildPatchPrompt(
  fileContent: string,
  violations: Violation[],
  filePath: string,
  framework?: string,
): string {
  const fwLine = framework ? `\nFramework: ${framework}` : '';
  const vList = violations
    .map(
      (v, i) =>
        `${i + 1}. [${v.ruleId}] WCAG ${v.wcag} Level ${v.level} — ${v.description}\n   Selector: ${v.selector}\n   HTML: ${v.html.slice(0, 300)}`,
    )
    .join('\n\n');

  return `You are a WCAG accessibility expert. Fix the accessibility violations in the source file below.
Return ONLY the complete fixed file content — no markdown fences, no explanations, no preamble.

File: ${filePath}${fwLine}

Violations to fix:
${vList}

FILE CONTENT:
${fileContent}`;
}
