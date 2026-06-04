import type { Violation } from '../engine/types.js';
import type { AIProvider, AIFix } from './types.js';
import { buildPrompt } from './prompt.js';
import { buildPatchPrompt } from './patch-prompt.js';
import { groupViolations, type ViolationGroup } from './group.js';
import { fallbackExplanation } from './fallback-explanation.js';

export class GeminiProvider implements AIProvider {
  constructor(private apiKey: string, private model = 'gemini-2.5-flash') {}

  async generateFixes(violations: Violation[], strategy: 'rule' | 'none' = 'rule', framework?: string): Promise<AIFix[]> {
    if (violations.length === 0) return [];

    const groups = groupViolations(violations, strategy);
    const prompt = buildPrompt(groups, framework);
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
    return this.parse(text, groups, framework);
  }

  async generateFilePatch(fileContent: string, violations: Violation[], filePath: string, framework?: string): Promise<string> {
    const prompt = buildPatchPrompt(fileContent, violations, filePath, framework);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 16384 },
      }),
    });
    if (!response.ok) throw new Error(`Gemini API error: ${response.status} ${await response.text()}`);
    const data = await response.json() as { candidates: Array<{ content: { parts: Array<{ text: string }> } }> };
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  }

  private parse(text: string, groups: ViolationGroup[], framework?: string): AIFix[] {
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

  private fallbackFix(g: ViolationGroup, framework?: string): AIFix {
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
