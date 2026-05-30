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
- "explanation": 1-2 sentences on concrete user impact — name exactly who is affected (e.g. "screen reader users", "keyboard-only users", "users with low vision") and what they cannot do because of this specific violation. Do not write generic statements like "users with disabilities may be affected."
- "fixedCode": the corrected HTML snippet only (no explanation, just code)
- "wcagReference": the full criterion name, e.g. "WCAG 2.1 SC 1.1.1 Non-text Content (Level A)"
- "optimalPrompt": a ready-to-paste prompt for an AI coding assistant (Cursor, Copilot, Claude). Structure it as: (1) state the WCAG 2.1/2.2 criterion being violated (e.g. "WCAG 2.1 SC 1.1.1 Non-text Content, Level A"), (2) list the affected selectors and HTML snippets, (3) state the exact code change needed to comply. Focus solely on the fix — do not explain why WCAG exists or what accessibility is. Be precise and actionable.

Return ONLY a valid JSON array. No markdown, no code fences, no explanation outside the JSON.

Violations:
${items}`;
}
