import type { ViolationGroup } from './group.js';
import { getFix, getFixCategory } from './fallback-fix.js';

const FRAMEWORK_SYNTAX: Record<string, string> = {
  'Next.js': 'React/TSX (JSX)',
  'Gatsby': 'React/JSX',
  'Remix': 'React/TSX',
  'Nuxt.js': 'Vue 3 SFC (.vue files)',
  'Vue 3': 'Vue 3 SFC (.vue files)',
  'Vue 2': 'Vue 2 SFC (.vue files)',
  'Angular': 'Angular template',
  'React': 'React JSX/TSX',
  'Svelte': 'Svelte (.svelte files)',
};

export function buildPrompt(groups: ViolationGroup[], framework?: string): string {
  const syntax = framework ? (FRAMEWORK_SYNTAX[framework] ?? 'JSX/TSX') : null;

  const items = groups
    .map((g, i) => {
      const fixHint = getFix(g.ruleId);
      const category = getFixCategory(g.ruleId) ?? 'edit-element';
      const fixLine = fixHint ? `\n   Fix guidance: ${fixHint}` : '';
      const categoryLine = `\n   Fix type: ${category}`;
      return `${i + 1}. Rule: ${g.ruleId} | WCAG ${g.wcag} (Level ${g.level}) | Impact: ${g.impact}
   Page: ${g.page}
   Instances: ${g.count} element(s)
   Selectors: ${g.selectors.join(', ')}
   Representative Element: ${g.representative.html}
   Problem: ${g.description}${categoryLine}${fixLine}`;
    })
    .join('\n\n');

  const frameworkLine = framework
    ? `\nFramework: ${framework}. All "fixedCode" values must use ${syntax} syntax — not raw HTML.\n`
    : '';

  const fixedCodeInstruction = syntax
    ? `"fixedCode": include ONLY when the violation's "Fix type" is "edit-element". Show the corrected ${syntax} snippet — NOT a copy of the original broken element. Omit this field entirely for "add-elsewhere", "change-css", and "restructure" violations.`
    : `"fixedCode": include ONLY when the violation's "Fix type" is "edit-element". Show the corrected HTML snippet — NOT a copy of the original broken element. Omit this field entirely for "add-elsewhere", "change-css", and "restructure" violations.`;

  const optimalPromptInstruction = framework
    ? `"optimalPrompt": a ready-to-paste prompt for an AI coding assistant (Cursor, Copilot, Claude) working in a ${framework} codebase. Structure it as: (1) state the WCAG 2.1/2.2 criterion being violated, (2) quote the affected selector and current HTML, (3) provide the exact code change required in ${syntax} syntax — include a concrete before/after snippet or the specific element to add/modify/remove. The prompt must be actionable without requiring additional research.`
    : `"optimalPrompt": a ready-to-paste prompt for an AI coding assistant (Cursor, Copilot, Claude). Structure it as: (1) state the WCAG 2.1/2.2 criterion being violated, (2) quote the affected selector and current HTML, (3) provide the exact code change required — include a concrete before/after snippet or the specific element to add/modify/remove. The prompt must be fully actionable: tell the developer exactly what to write, not just that something needs fixing.`;

  return `You are a WCAG accessibility expert. Analyze these violations and return a JSON array.${frameworkLine}
Each item must have:
- "ruleId": the rule id from the input
- "selectors": array of CSS selectors affected (copy from input)
- "explanation": 1-2 sentences on concrete user impact — name exactly who is affected (e.g. "screen reader users", "keyboard-only users", "users with low vision") and what they cannot do because of this specific violation. Do not write generic statements.
- ${fixedCodeInstruction}
- "wcagReference": the full criterion name, e.g. "WCAG 2.1 SC 1.1.1 Non-text Content (Level A)"
- ${optimalPromptInstruction}

Return ONLY a valid JSON array. No markdown, no code fences, no explanation outside the JSON.

Violations:
${items}`;
}
