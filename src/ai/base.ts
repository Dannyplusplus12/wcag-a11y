import type { Violation } from '../engine/types.js';
import type { AIProvider, AIFix } from './types.js';
import { groupViolations, type ViolationGroup } from './group.js';
import { fallbackExplanation } from './fallback-explanation.js';
import { getFix, getFixCategory } from './fallback-fix.js';

function buildFallbackFix(g: ViolationGroup, framework?: string): AIFix {
  const v = g.representative;
  const selectorList = g.selectors.map((s) => `- \`${s}\``).join('\n');
  const explanation = fallbackExplanation(g.ruleId, g.description, g.wcag, g.level);
  const fwNote = framework ? `This project uses ${framework}.\n\n` : '';
  const fixInstructions = getFix(g.ruleId);
  const fixSection = fixInstructions ? `\n\nHow to fix:\n${fixInstructions}` : '';

  const prompt = g.count > 1
    ? `${fwNote}Fix WCAG 2.1 SC ${g.wcag} (Level ${g.level}) — ${g.description}\n\nAffected elements (${g.count} instances):\n${selectorList}\n\nRepresentative HTML:\n\`\`\`html\n${v.html.slice(0, 400)}\n\`\`\`${fixSection}\n\nApply this fix to all ${g.count} instances across the codebase.`
    : `${fwNote}Fix WCAG 2.1 SC ${g.wcag} (Level ${g.level}) — ${g.description}\n\nAffected element:\n- Selector: \`${g.selectors[0]}\`\n\nCurrent HTML:\n\`\`\`html\n${v.html.slice(0, 400)}\n\`\`\`${fixSection}`;

  const category = getFixCategory(g.ruleId);
  const fixedCode = category === 'edit-element' || !category ? v.html : undefined;

  return {
    ruleId: g.ruleId,
    selectors: g.selectors,
    instanceCount: g.count,
    explanation,
    fixedCode,
    fixCategory: getFixCategory(g.ruleId),
    wcagReference: `WCAG 2.1 SC ${g.wcag}`,
    optimalPrompt: prompt,
  };
}

export function generateFallbackFixes(violations: Violation[], strategy: 'rule' | 'none', framework?: string): AIFix[] {
  return groupViolations(violations, strategy).map((g) => buildFallbackFix(g, framework));
}

export abstract class BaseAIProvider implements AIProvider {
  abstract generateFixes(violations: Violation[], strategy: 'rule' | 'none', framework?: string): Promise<AIFix[]>;
  abstract generateFilePatch(fileContent: string, violations: Violation[], filePath: string, framework?: string): Promise<string>;

  protected parse(text: string, groups: ViolationGroup[], framework?: string): AIFix[] {
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const fixes: AIFix[] = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      return groups.map((g) => {
        const found = fixes.find((f) => f.ruleId === g.ruleId);
        return found
          ? { ...found, selectors: g.selectors, instanceCount: g.count, fixCategory: getFixCategory(g.ruleId) }
          : buildFallbackFix(g, framework);
      });
    } catch {
      return groups.map((g) => buildFallbackFix(g, framework));
    }
  }

  protected fallback(groups: ViolationGroup[], framework?: string): AIFix[] {
    return groups.map((g) => buildFallbackFix(g, framework));
  }

  protected fallbackFix(g: ViolationGroup, framework?: string): AIFix {
    return buildFallbackFix(g, framework);
  }
}
