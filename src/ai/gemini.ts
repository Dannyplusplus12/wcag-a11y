import type { Violation } from '../engine/types.js';
import type { AIProvider, AIFix } from './types.js';
import { buildPrompt } from './prompt.js';

export class GeminiProvider implements AIProvider {
  constructor(private apiKey: string, private model = 'gemini-2.0-flash') {}

  async generateFixes(violations: Violation[]): Promise<AIFix[]> {
    if (violations.length === 0) return [];

    const prompt = buildPrompt(violations);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 8192 },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json() as {
      candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';
    return this.parse(text, violations);
  }

  private parse(text: string, violations: Violation[]): AIFix[] {
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const fixes: AIFix[] = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      return violations.map((v) => {
        const found = fixes.find((f) => f.ruleId === v.ruleId);
        return found ?? {
          ruleId: v.ruleId,
          selector: v.selector,
          explanation: v.description,
          fixedCode: v.html,
          wcagReference: `WCAG 2.1 SC ${v.wcag}`,
        };
      });
    } catch {
      return violations.map((v) => ({
        ruleId: v.ruleId,
        selector: v.selector,
        explanation: v.description,
        fixedCode: v.html,
        wcagReference: `WCAG 2.1 SC ${v.wcag}`,
      }));
    }
  }
}
