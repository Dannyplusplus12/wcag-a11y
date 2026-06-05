import type { Violation } from '../engine/types.js';
import type { AIProvider, AIFix } from './types.js';
import { groupViolations, type ViolationGroup } from './group.js';
import { fallbackExplanation } from './fallback-explanation.js';

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
          ? { ...found, selectors: g.selectors, instanceCount: g.count }
          : this.fallbackFix(g, framework);
      });
    } catch {
      return groups.map((g) => this.fallbackFix(g, framework));
    }
  }

  protected fallback(groups: ViolationGroup[], framework?: string): AIFix[] {
    return groups.map((g) => this.fallbackFix(g, framework));
  }

  protected fallbackFix(g: ViolationGroup, framework?: string): AIFix {
    const v = g.representative;
    const selectorList = g.selectors.map((s) => `- ${s}`).join('\n');
    const explanation = fallbackExplanation(g.ruleId, g.description, g.wcag, g.level);
    const fwNote = framework ? `This project uses ${framework}. ` : '';
    const prompt = g.count > 1
      ? `${fwNote}Fix WCAG 2.1 SC ${g.wcag} (Level ${g.level}) — ${g.description}\n\nAffected elements (${g.count} instances):\n${selectorList}\n\nRepresentative HTML:\n\`${v.html.slice(0, 300)}\`\n\nApply the fix to all ${g.count} instances in the codebase to comply with WCAG 2.1 SC ${g.wcag}.`
      : `${fwNote}Fix WCAG 2.1 SC ${g.wcag} (Level ${g.level}) — ${g.description}\n\nAffected element:\n- Selector: \`${g.selectors[0]}\`\n- HTML: \`${v.html.slice(0, 300)}\`\n\nApply the fix to comply with WCAG 2.1 SC ${g.wcag}.`;
    return {
      ruleId: g.ruleId,
      selectors: g.selectors,
      instanceCount: g.count,
      explanation,
      fixedCode: v.html,
      wcagReference: `WCAG 2.1 SC ${g.wcag}`,
      optimalPrompt: prompt,
    };
  }
}
