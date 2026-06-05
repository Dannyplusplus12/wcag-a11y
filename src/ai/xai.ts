import { OpenAICompatProvider } from './openai-compat.js';

export class XAIProvider extends OpenAICompatProvider {
  constructor(apiKey: string, model = 'grok-2') {
    super('https://api.x.ai/v1', apiKey, model, 'xAI');
  }
}
