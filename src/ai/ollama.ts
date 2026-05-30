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
    const instanceNote = g.count > 1 ? ` There are ${g.count} similar instances at: ${g.selectors.join(', ')}.` : '';
    return {
      ruleId: g.ruleId,
      selectors: g.selectors,
      instanceCount: g.count,
      explanation: g.description,
      fixedCode: v.html,
      wcagReference: `WCAG 2.1 SC ${g.wcag}`,
      optimalPrompt: `Fix this accessibility violation: The element \`${v.html.slice(0, 120)}\` at selector \`${g.selectors[0]}\` violates ${g.wcag} — ${g.description}.${instanceNote} Please fix it in the codebase.`,
    };
  }
}
