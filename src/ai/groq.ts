import { OpenAICompatProvider } from './openai-compat.js';

export class GroqProvider extends OpenAICompatProvider {
  constructor(apiKey: string, model = 'llama-3.3-70b-versatile') {
    super('https://api.groq.com/openai/v1', apiKey, model, 'Groq');
  }
}
