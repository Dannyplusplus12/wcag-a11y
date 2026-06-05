import { OpenAICompatProvider } from './openai-compat.js';

export class MistralProvider extends OpenAICompatProvider {
  constructor(apiKey: string, model = 'mistral-large-latest') {
    super('https://api.mistral.ai/v1', apiKey, model, 'Mistral');
  }
}
