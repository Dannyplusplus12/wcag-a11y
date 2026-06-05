import { OpenAICompatProvider } from './openai-compat.js';

export class OpenAIProvider extends OpenAICompatProvider {
  constructor(apiKey: string, model = 'gpt-4o-mini') {
    super('https://api.openai.com/v1', apiKey, model, 'OpenAI');
  }
}
