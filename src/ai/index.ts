import type { Config } from '../config.js';
import type { AIProvider } from './types.js';
import { GeminiProvider } from './gemini.js';
import { OllamaProvider } from './ollama.js';
import { OpenAIProvider } from './openai.js';

export function createAIProvider(config: Config): AIProvider {
  if (config.provider === 'ollama') {
    return new OllamaProvider(config.ollamaBaseUrl, config.ollamaModel);
  }
  if (config.provider === 'openai') {
    if (!config.openaiApiKey) {
      console.error('No OpenAI API key found. Add "openaiApiKey" to a11y.config.json.');
      process.exit(1);
    }
    return new OpenAIProvider(config.openaiApiKey, config.openaiModel);
  }
  if (!config.apiKey) {
    console.error('No API key found. Run: wcag-a11y init');
    process.exit(1);
  }
  return new GeminiProvider(config.apiKey, config.model);
}
