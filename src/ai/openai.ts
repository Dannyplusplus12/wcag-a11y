import type { Violation } from '../engine/types.js';
import type { AIProvider, AIFix } from './types.js';
import { buildPrompt } from './prompt.js';
import { groupViolations, type ViolationGroup } from './group.js';

export class OpenAIProvider implements AIProvider {
  constructor(private apiKey: string, private model = 'gpt-4o-mini') {}

  async generateFixes(violations: Violation[], strategy: 'rule' | 'none' = 'rule'): Promise<AIFix[]> {
    if (violations.length === 0) return [];

    const groups = groupViolations(violations, strategy);
    const prompt = buildPrompt(groups);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 8192,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };
    const text = data.choices?.[0]?.message?.content ?? '[]';
    return this.parse(text, groups);
  }

  private parse(text: string, groups: ViolationGroup[]): AIFix[] {
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const fixes: AIFix[] = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      return groups.map((g) => {
        const found = fixes.find((f) => f.ruleId === g.ruleId);
        return found
          ? { ...found, selectors: g.selectors, instanceCount: g.count }
          : this.fallbackFix(g);
      });
    } catch {
      return groups.map((g) => this.fallbackFix(g));
    }
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
