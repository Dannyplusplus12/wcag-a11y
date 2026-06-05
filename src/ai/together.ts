import { OpenAICompatProvider } from './openai-compat.js';

export class TogetherProvider extends OpenAICompatProvider {
  constructor(apiKey: string, model = 'meta-llama/Llama-3-70b-chat-hf') {
    super('https://api.together.xyz/v1', apiKey, model, 'Together AI');
  }
}
