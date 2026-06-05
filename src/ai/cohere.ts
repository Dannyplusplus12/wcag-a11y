import type { Violation } from '../engine/types.js';
import type { AIFix } from './types.js';
import { buildPrompt } from './prompt.js';
import { buildPatchPrompt } from './patch-prompt.js';
import { groupViolations } from './group.js';
import { BaseAIProvider } from './base.js';

export class CohereProvider extends BaseAIProvider {
  constructor(private apiKey: string, private model = 'command-r-plus') {
    super();
  }

  private get headers() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };
  }

  async generateFixes(violations: Violation[], strategy: 'rule' | 'none' = 'rule', framework?: string): Promise<AIFix[]> {
    if (violations.length === 0) return [];

    const groups = groupViolations(violations, strategy);
    const prompt = buildPrompt(groups, framework);

    const response = await fetch('https://api.cohere.com/v2/chat', {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 8192,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json() as { message: { content: Array<{ type: string; text: string }> } };
    const text = data.message?.content?.[0]?.text ?? '[]';
    return this.parse(text, groups, framework);
  }

  async generateFilePatch(fileContent: string, violations: Violation[], filePath: string, framework?: string): Promise<string> {
    const prompt = buildPatchPrompt(fileContent, violations, filePath, framework);
    const response = await fetch('https://api.cohere.com/v2/chat', {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 16384,
        temperature: 0.1,
      }),
    });
    if (!response.ok) throw new Error(`Cohere API error: ${response.status} ${await response.text()}`);
    const data = await response.json() as { message: { content: Array<{ type: string; text: string }> } };
    return data.message?.content?.[0]?.text ?? '';
  }
}
