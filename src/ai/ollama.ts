import type { Violation } from '../engine/types.js';
import type { AIProvider, AIFix } from './types.js';
import { buildPrompt } from './prompt.js';

export class OllamaProvider implements AIProvider {
  constructor(private baseUrl = 'http://localhost:11434', private model = 'llama3') {}

  async generateFixes(violations: Violation[]): Promise<AIFix[]> {
    if (violations.length === 0) return [];

    const prompt = buildPrompt(violations);
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
      if (!jsonMatch) return this.fallback(violations);
      const fixes: AIFix[] = JSON.parse(jsonMatch[0]);
      return violations.map((v) => {
        const found = fixes.find((f) => f.ruleId === v.ruleId && f.selector === v.selector)
          ?? fixes.find((f) => f.ruleId === v.ruleId);
        return found ?? {
          ruleId: v.ruleId,
          selector: v.selector,
          explanation: v.description,
          fixedCode: v.html,
          wcagReference: `WCAG 2.1 SC ${v.wcag}`,
          optimalPrompt: `Fix this accessibility violation: The element \`${v.html.slice(0, 120)}\` at selector \`${v.selector}\` violates ${v.wcag} — ${v.description}. Please fix it in the codebase.`,
        };
      });
    } catch {
      return this.fallback(violations);
    }
  }

  private fallback(violations: Violation[]): AIFix[] {
    return violations.map((v) => ({
      ruleId: v.ruleId,
      selector: v.selector,
      explanation: v.description,
      fixedCode: v.html,
      wcagReference: `WCAG 2.1 SC ${v.wcag}`,
      optimalPrompt: `Fix this accessibility violation: The element \`${v.html.slice(0, 120)}\` at selector \`${v.selector}\` violates ${v.wcag} — ${v.description}. Please fix it in the codebase.`,
    }));
  }
}
