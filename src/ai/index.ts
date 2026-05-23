import type { Config } from '../config.js';
import type { AIProvider } from './types.js';
import { GeminiProvider } from './gemini.js';
import { OllamaProvider } from './ollama.js';

export function createAIProvider(config: Config): AIProvider {
  if (config.provider === 'ollama') {
    return new OllamaProvider(config.ollamaBaseUrl, config.ollamaModel);
  }
  if (!config.apiKey) {
    console.error('No API key found. Run: wcag-a11y init');
    process.exit(1);
  }
  return new GeminiProvider(config.apiKey, config.model);
}
