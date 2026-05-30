import type { ViolationGroup } from './group.js';

export function buildPrompt(groups: ViolationGroup[]): string {
  const items = groups
    .map(
      (g, i) => `${i + 1}. Rule: ${g.ruleId} | WCAG ${g.wcag} (Level ${g.level}) | Impact: ${g.impact}
   Page: ${g.page}
   Instances: ${g.count} element(s)
   Selectors: ${g.selectors.join(', ')}
   Representative Element: ${g.representative.html}
   Problem: ${g.description}`
    )
    .join('\n\n');

  return `You are a WCAG accessibility expert. Analyze these violations and return a JSON array.
Each item must have:
- "ruleId": the rule id from the input
- "selectors": array of CSS selectors affected (copy from input)
- "explanation": 1-2 sentences explaining why this matters for users with disabilities (plain English, no jargon)
- "fixedCode": the corrected HTML snippet only (no explanation, just code)
- "wcagReference": e.g. "WCAG 2.1 SC 1.1.1 — Non-text Content"
- "optimalPrompt": a ready-to-paste prompt the developer can give to an AI coding assistant (Cursor, GitHub Copilot, Claude) to fix this issue in their codebase. Include the violating elements, what rule they break, how many instances there are, and exactly what change is needed. Be specific and actionable.

Return ONLY a valid JSON array. No markdown, no code fences, no explanation outside the JSON.

Violations:
${items}`;
}
