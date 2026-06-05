import type { Violation } from '../engine/types.js';
import type { AIFix } from './types.js';
import { buildPrompt } from './prompt.js';
import { buildPatchPrompt } from './patch-prompt.js';
import { groupViolations } from './group.js';
import { BaseAIProvider } from './base.js';

export class OpenAICompatProvider extends BaseAIProvider {
  constructor(
    protected readonly baseUrl: string,
    protected readonly apiKey: string,
    protected readonly model: string,
    protected readonly providerName: string = 'API',
  ) {
    super();
  }

  protected buildUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  protected buildHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };
  }

  async generateFixes(violations: Violation[], strategy: 'rule' | 'none' = 'rule', framework?: string): Promise<AIFix[]> {
    if (violations.length === 0) return [];

    const groups = groupViolations(violations, strategy);
    const prompt = buildPrompt(groups, framework);

    const response = await fetch(this.buildUrl('/chat/completions'), {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 8192,
      }),
    });

    if (!response.ok) {
      throw new Error(`${this.providerName} API error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json() as { choices: Array<{ message: { content: string } }> };
    const text = data.choices?.[0]?.message?.content ?? '[]';
    return this.parse(text, groups, framework);
  }

  async generateFilePatch(fileContent: string, violations: Violation[], filePath: string, framework?: string): Promise<string> {
    const prompt = buildPatchPrompt(fileContent, violations, filePath, framework);
    const response = await fetch(this.buildUrl('/chat/completions'), {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 16384,
      }),
    });
    if (!response.ok) throw new Error(`${this.providerName} API error: ${response.status} ${await response.text()}`);
    const data = await response.json() as { choices: Array<{ message: { content: string } }> };
    return data.choices?.[0]?.message?.content ?? '';
  }
}
