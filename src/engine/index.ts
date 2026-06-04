import type { Page } from 'playwright';
import type { Violation, PageScanResult } from './types.js';

async function resolveSourceLocations(page: Page, violations: Violation[]): Promise<void> {
  const selectors = [...new Set(violations.map((v) => v.selector))];
  if (selectors.length === 0) return;
  try {
    const sourceMap = await page.evaluate((sels: string[]) => {
      const result: Record<string, string> = {};
      for (const sel of sels) {
        try {
          const el = document.querySelector(sel);
          if (!el) continue;
          const fiberKey = Object.getOwnPropertyNames(el).find((k) => k.startsWith('__reactFiber'));
          if (!fiberKey) continue;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let fiber = (el as any)[fiberKey];
          while (fiber) {
            if (fiber._debugSource) {
              const { fileName, lineNumber } = fiber._debugSource as { fileName: string; lineNumber: number };
              const match = fileName.match(/[/\\]src[/\\].+/);
              const display = match ? match[0].replace(/\\/g, '/').replace(/^\//, '') : fileName;
              result[sel] = `${display}:${lineNumber}`;
              break;
            }
            fiber = fiber.return;
          }
        } catch { /* ignore */ }
      }
      return result;
    }, selectors);

    for (const v of violations) {
      if (sourceMap[v.selector]) v.source = sourceMap[v.selector];
    }
  } catch { /* non-React or production build — silently skip */ }
}
import { textAlternativeRules } from './rules/text-alternatives.js';
import { colorContrastRules } from './rules/color-contrast.js';
import { keyboardRules } from './rules/keyboard.js';
import { formRules } from './rules/forms.js';
import { ariaRules } from './rules/aria.js';
import { structureRules } from './rules/structure.js';
import { linkRules } from './rules/links.js';
import { languageRules } from './rules/language.js';
import { mediaRules } from './rules/media.js';
import { tableRules } from './rules/tables.js';

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
  ...tableRules,
];

export async function scanPage(page: Page, url: string): Promise<PageScanResult> {
  const violations: Violation[] = [];

  for (const rule of ALL_RULES) {
    // Serialize the check function and run it inside the browser page
    const ruleViolations = await page.evaluate(
      ({ checkFn, meta }) => {
        // eslint-disable-next-line no-new-func
        // __name is injected by esbuild/tsx at compile time but is not available
        // inside page.evaluate's isolated context — provide a no-op shim.
        const fn = new Function(`var __name=(t,_)=>t; return (${checkFn})`)() as () => Array<{
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

  await resolveSourceLocations(page, violations);
  return { url, violations };
}
