import type { Page } from 'playwright';
import type { Violation, PageScanResult } from './types.js';
import { textAlternativeRules } from './rules/text-alternatives.js';
import { colorContrastRules } from './rules/color-contrast.js';
import { keyboardRules } from './rules/keyboard.js';
import { formRules } from './rules/forms.js';
import { ariaRules } from './rules/aria.js';
import { structureRules } from './rules/structure.js';
import { linkRules } from './rules/links.js';
import { languageRules } from './rules/language.js';
import { mediaRules } from './rules/media.js';

const ALL_RULES = [
  ...textAlternativeRules,
  ...colorContrastRules,
  ...keyboardRules,
  ...formRules,
  ...ariaRules,
  ...structureRules,
  ...linkRules,
  ...languageRules,
  ...mediaRules,
];

export async function scanPage(page: Page, url: string): Promise<PageScanResult> {
  const violations: Violation[] = [];

  for (const rule of ALL_RULES) {
    // Serialize the check function and run it inside the browser page
    const ruleViolations = await page.evaluate(
      ({ checkFn, meta }) => {
        // eslint-disable-next-line no-new-func
        const fn = new Function(`return (${checkFn})`)() as () => Array<{
          selector: string;
          html: string;
        }>;
        const results = fn();
        return results.map((r) => ({
          ruleId: meta.id,
          wcag: meta.wcag,
          level: meta.level,
          impact: meta.impact,
          description: meta.description,
          selector: r.selector,
          html: r.html,
          page: window.location.href,
        }));
      },
      {
        checkFn: rule.check.toString(),
        meta: {
          id: rule.id,
          wcag: rule.wcag,
          level: rule.level,
          impact: rule.impact,
          description: rule.description,
        },
      }
    );
    violations.push(...ruleViolations);
  }

  return { url, violations };
}
