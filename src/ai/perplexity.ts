import { OpenAICompatProvider } from './openai-compat.js';

export class PerplexityProvider extends OpenAICompatProvider {
  constructor(apiKey: string, model = 'llama-3.1-sonar-large-128k-online') {
    super('https://api.perplexity.ai', apiKey, model, 'Perplexity');
  }
}
