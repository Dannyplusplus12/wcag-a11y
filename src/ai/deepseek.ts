import { OpenAICompatProvider } from './openai-compat.js';

export class DeepSeekProvider extends OpenAICompatProvider {
  constructor(apiKey: string, model = 'deepseek-chat') {
    super('https://api.deepseek.com/v1', apiKey, model, 'DeepSeek');
  }
}
