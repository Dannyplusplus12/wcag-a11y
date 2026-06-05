import type { Violation } from '../engine/types.js';
import type { AIFix } from './types.js';
import { buildPrompt } from './prompt.js';
import { buildPatchPrompt } from './patch-prompt.js';
import { groupViolations } from './group.js';
import { BaseAIProvider } from './base.js';

export class OllamaProvider extends BaseAIProvider {
  constructor(private baseUrl = 'http://localhost:11434', private model = 'llama3') {
    super();
  }

  async generateFixes(violations: Violation[], strategy: 'rule' | 'none' = 'rule', framework?: string): Promise<AIFix[]> {
    if (violations.length === 0) return [];

    const groups = groupViolations(violations, strategy);
    const prompt = buildPrompt(groups, framework);
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
      if (!jsonMatch) return this.fallback(groups, framework);
      const fixes: AIFix[] = JSON.parse(jsonMatch[0]);
      return groups.map((g) => {
        const found = fixes.find((f) => f.ruleId === g.ruleId);
        return found
          ? { ...found, selectors: g.selectors, instanceCount: g.count }
          : this.fallbackFix(g, framework);
      });
    } catch {
      return this.fallback(groups, framework);
    }
  }

  async generateFilePatch(fileContent: string, violations: Violation[], filePath: string, framework?: string): Promise<string> {
    const prompt = buildPatchPrompt(fileContent, violations, filePath, framework);
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, prompt, stream: false }),
    });
    if (!response.ok) throw new Error(`Ollama error: ${response.status}. Is Ollama running? Run: ollama serve`);
    const data = await response.json() as { response: string };
    return data.response ?? '';
  }
}
