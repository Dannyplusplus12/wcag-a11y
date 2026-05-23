import type { Violation } from '../engine/types.js';

export function buildPrompt(violations: Violation[]): string {
  const items = violations
    .map(
      (v, i) => `${i + 1}. Rule: ${v.ruleId} | WCAG ${v.wcag} (Level ${v.level}) | Impact: ${v.impact}
   Page: ${v.page}
   Element: ${v.html}
   Problem: ${v.description}`
    )
    .join('\n\n');

  return `You are a WCAG accessibility expert. Analyze these violations and return a JSON array.
Each item must have:
- "ruleId": the rule id from the input
- "explanation": 1-2 sentences explaining why this matters for users with disabilities (plain English, no jargon)
- "fixedCode": the corrected HTML snippet only (no explanation, just code)
- "wcagReference": e.g. "WCAG 2.1 SC 1.1.1 — Non-text Content"
- "optimalPrompt": a ready-to-paste prompt the developer can give to an AI coding assistant (Cursor, GitHub Copilot, Claude) to fix this issue in their codebase. Include the violating element, what rule it breaks, and exactly what change is needed. Be specific and actionable.

Return ONLY a valid JSON array. No markdown, no code fences, no explanation outside the JSON.

Violations:
${items}`;
}
