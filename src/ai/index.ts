import type { Config } from '../config.js';
import type { AIProvider } from './types.js';
import { GeminiProvider } from './gemini.js';
import { OllamaProvider } from './ollama.js';
import { OpenAIProvider } from './openai.js';
import { AnthropicProvider } from './anthropic.js';
import { MistralProvider } from './mistral.js';
import { GroqProvider } from './groq.js';
import { CohereProvider } from './cohere.js';
import { XAIProvider } from './xai.js';
import { DeepSeekProvider } from './deepseek.js';
import { TogetherProvider } from './together.js';
import { PerplexityProvider } from './perplexity.js';
import { AzureOpenAIProvider } from './azure-openai.js';

export function createAIProvider(config: Config): AIProvider {
  switch (config.provider) {
    case 'ollama':
      return new OllamaProvider(config.ollamaBaseUrl, config.ollamaModel);

    case 'openai':
      if (!config.openaiApiKey) {
        console.error('No OpenAI API key found. Add "openaiApiKey" to a11y.config.json.');
        process.exit(1);
      }
      return new OpenAIProvider(config.openaiApiKey, config.openaiModel);

    case 'anthropic':
      if (!config.anthropicApiKey) {
        console.error('No Anthropic API key found. Add "anthropicApiKey" to a11y.config.json.');
        process.exit(1);
      }
      return new AnthropicProvider(config.anthropicApiKey, config.anthropicModel);

    case 'mistral':
      if (!config.mistralApiKey) {
        console.error('No Mistral API key found. Add "mistralApiKey" to a11y.config.json.');
        process.exit(1);
      }
      return new MistralProvider(config.mistralApiKey, config.mistralModel);

    case 'groq':
      if (!config.groqApiKey) {
        console.error('No Groq API key found. Add "groqApiKey" to a11y.config.json.');
        process.exit(1);
      }
      return new GroqProvider(config.groqApiKey, config.groqModel);

    case 'cohere':
      if (!config.cohereApiKey) {
        console.error('No Cohere API key found. Add "cohereApiKey" to a11y.config.json.');
        process.exit(1);
      }
      return new CohereProvider(config.cohereApiKey, config.cohereModel);

    case 'xai':
      if (!config.xaiApiKey) {
        console.error('No xAI API key found. Add "xaiApiKey" to a11y.config.json.');
        process.exit(1);
      }
      return new XAIProvider(config.xaiApiKey, config.xaiModel);

    case 'deepseek':
      if (!config.deepseekApiKey) {
        console.error('No DeepSeek API key found. Add "deepseekApiKey" to a11y.config.json.');
        process.exit(1);
      }
      return new DeepSeekProvider(config.deepseekApiKey, config.deepseekModel);

    case 'together':
      if (!config.togetherApiKey) {
        console.error('No Together AI API key found. Add "togetherApiKey" to a11y.config.json.');
        process.exit(1);
      }
      return new TogetherProvider(config.togetherApiKey, config.togetherModel);

    case 'perplexity':
      if (!config.perplexityApiKey) {
        console.error('No Perplexity API key found. Add "perplexityApiKey" to a11y.config.json.');
        process.exit(1);
      }
      return new PerplexityProvider(config.perplexityApiKey, config.perplexityModel);

    case 'azure-openai':
      if (!config.azureOpenaiApiKey || !config.azureOpenaiEndpoint || !config.azureOpenaiDeployment) {
        console.error('Azure OpenAI requires "azureOpenaiApiKey", "azureOpenaiEndpoint", and "azureOpenaiDeployment" in a11y.config.json.');
        process.exit(1);
      }
      return new AzureOpenAIProvider(
        config.azureOpenaiEndpoint,
        config.azureOpenaiApiKey,
        config.azureOpenaiDeployment,
        config.azureOpenaiApiVersion,
      );

    default:
      if (!config.apiKey) {
        console.error('No API key found. Run: wcag-a11y init');
        process.exit(1);
      }
      return new GeminiProvider(config.apiKey, config.model);
  }
}
