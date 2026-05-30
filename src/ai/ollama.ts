import type { Violation } from '../engine/types.js';
import type { AIProvider, AIFix } from './types.js';
import { buildPrompt } from './prompt.js';
import { groupViolations, type ViolationGroup } from './group.js';

export class OllamaProvider implements AIProvider {
  constructor(private baseUrl = 'http://localhost:11434', private model = 'llama3') {}

  async generateFixes(violations: Violation[], strategy: 'rule' | 'none' = 'rule'): Promise<AIFix[]> {
    if (violations.length === 0) return [];

    const groups = groupViolations(violations, strategy);
    const prompt = buildPrompt(groups);
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, prompt, stream: false }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}. Is Ollama running? Run: ollama serve`);
    }

    const data = await response.json() as { response: string };
    const text = data.response ?? '[]';

    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return this.fallback(groups);
      const fixes: AIFix[] = JSON.parse(jsonMatch[0]);
      return groups.map((g) => {
        const found = fixes.find((f) => f.ruleId === g.ruleId);
        return found
          ? { ...found, selectors: g.selectors, instanceCount: g.count }
          : this.fallbackFix(g);
      });
    } catch {
      return this.fallback(groups);
    }
  }

  private fallback(groups: ViolationGroup[]): AIFix[] {
    return groups.map((g) => this.fallbackFix(g));
  }

  private fallbackFix(g: ViolationGroup): AIFix {
    const v = g.representative;
    const selectorList = g.selectors.map((s) => `- ${s}`).join('\n');
    const explanation = `Users relying on assistive technologies are affected: ${g.description.toLowerCase()}. This fails WCAG 2.1 SC ${g.wcag} (Level ${g.level}).`;
    const prompt = g.count > 1
      ? `Fix WCAG 2.1 SC ${g.wcag} (Level ${g.level}) — ${g.description}\n\nAffected elements (${g.count} instances):\n${selectorList}\n\nRepresentative HTML:\n\`${v.html.slice(0, 300)}\`\n\nApply the fix to all ${g.count} instances in the codebase to comply with WCAG 2.1 SC ${g.wcag}.`
      : `Fix WCAG 2.1 SC ${g.wcag} (Level ${g.level}) — ${g.description}\n\nAffected element:\n- Selector: \`${g.selectors[0]}\`\n- HTML: \`${v.html.slice(0, 300)}\`\n\nApply the fix to comply with WCAG 2.1 SC ${g.wcag}.`;
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
