import { OpenAICompatProvider } from './openai-compat.js';

export class AzureOpenAIProvider extends OpenAICompatProvider {
  private readonly apiVersion: string;

  constructor(endpoint: string, apiKey: string, deployment: string, apiVersion = '2024-10-01-preview') {
    super(`${endpoint}/openai/deployments/${deployment}`, apiKey, deployment, 'Azure OpenAI');
    this.apiVersion = apiVersion;
  }

  protected buildUrl(path: string): string {
    return `${this.baseUrl}${path}?api-version=${this.apiVersion}`;
  }

  protected buildHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'api-key': this.apiKey,
    };
  }
}
