import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

export type ProviderName =
  | 'gemini' | 'openai' | 'ollama'
  | 'anthropic' | 'mistral' | 'groq' | 'cohere'
  | 'xai' | 'deepseek' | 'together' | 'perplexity'
  | 'azure-openai';

export interface Config {
  provider: ProviderName;
  framework?: string;
  // Gemini
  apiKey?: string;
  model?: string;
  // Ollama
  ollamaBaseUrl?: string;
  ollamaModel?: string;
  // OpenAI
  openaiApiKey?: string;
  openaiModel?: string;
  // Anthropic
  anthropicApiKey?: string;
  anthropicModel?: string;
  // Mistral
  mistralApiKey?: string;
  mistralModel?: string;
  // Groq
  groqApiKey?: string;
  groqModel?: string;
  // Cohere
  cohereApiKey?: string;
  cohereModel?: string;
  // xAI
  xaiApiKey?: string;
  xaiModel?: string;
  // DeepSeek
  deepseekApiKey?: string;
  deepseekModel?: string;
  // Together AI
  togetherApiKey?: string;
  togetherModel?: string;
  // Perplexity
  perplexityApiKey?: string;
  perplexityModel?: string;
  // Azure OpenAI
  azureOpenaiApiKey?: string;
  azureOpenaiEndpoint?: string;
  azureOpenaiDeployment?: string;
  azureOpenaiApiVersion?: string;
}

const CONFIG_FILE = 'a11y.config.json';
const DEFAULTS: Partial<Config> = {
  provider: 'gemini',
  model: 'gemini-2.5-flash',
  ollamaBaseUrl: 'http://localhost:11434',
  ollamaModel: 'llama3',
  openaiModel: 'gpt-4o-mini',
  anthropicModel: 'claude-sonnet-4-6',
  mistralModel: 'mistral-large-latest',
  groqModel: 'llama-3.3-70b-versatile',
  cohereModel: 'command-r-plus',
  xaiModel: 'grok-2',
  deepseekModel: 'deepseek-chat',
  togetherModel: 'meta-llama/Llama-3-70b-chat-hf',
  perplexityModel: 'llama-3.1-sonar-large-128k-online',
  azureOpenaiApiVersion: '2024-10-01-preview',
};

export function loadConfig(): Config {
  const configPath = join(process.cwd(), CONFIG_FILE);
  if (!existsSync(configPath)) {
    console.error(`No ${CONFIG_FILE} found. Run: wcag-a11y init`);
    process.exit(1);
  }
  const raw = JSON.parse(readFileSync(configPath, 'utf-8'));
  return { ...DEFAULTS, ...raw } as Config;
}

const STARTER_CONFIGS: Record<ProviderName, [Partial<Config>, string]> = {
  gemini: [
    { provider: 'gemini', apiKey: 'YOUR_GEMINI_API_KEY', model: 'gemini-2.5-flash' },
    `Created ${CONFIG_FILE} — add your Gemini API key from https://aistudio.google.com`,
  ],
  openai: [
    { provider: 'openai', openaiApiKey: 'YOUR_OPENAI_API_KEY', openaiModel: 'gpt-4o-mini' },
    `Created ${CONFIG_FILE} — add your OpenAI API key from https://platform.openai.com/api-keys`,
  ],
  ollama: [
    { provider: 'ollama', ollamaBaseUrl: 'http://localhost:11434', ollamaModel: 'llama3' },
    `Created ${CONFIG_FILE} — run \`ollama serve\` to start the local model server`,
  ],
  anthropic: [
    { provider: 'anthropic', anthropicApiKey: 'YOUR_ANTHROPIC_API_KEY', anthropicModel: 'claude-sonnet-4-6' },
    `Created ${CONFIG_FILE} — add your Anthropic API key from https://console.anthropic.com`,
  ],
  mistral: [
    { provider: 'mistral', mistralApiKey: 'YOUR_MISTRAL_API_KEY', mistralModel: 'mistral-large-latest' },
    `Created ${CONFIG_FILE} — add your Mistral API key from https://console.mistral.ai`,
  ],
  groq: [
    { provider: 'groq', groqApiKey: 'YOUR_GROQ_API_KEY', groqModel: 'llama-3.3-70b-versatile' },
    `Created ${CONFIG_FILE} — add your Groq API key from https://console.groq.com`,
  ],
  cohere: [
    { provider: 'cohere', cohereApiKey: 'YOUR_COHERE_API_KEY', cohereModel: 'command-r-plus' },
    `Created ${CONFIG_FILE} — add your Cohere API key from https://dashboard.cohere.com`,
  ],
  xai: [
    { provider: 'xai', xaiApiKey: 'YOUR_XAI_API_KEY', xaiModel: 'grok-2' },
    `Created ${CONFIG_FILE} — add your xAI API key from https://console.x.ai`,
  ],
  deepseek: [
    { provider: 'deepseek', deepseekApiKey: 'YOUR_DEEPSEEK_API_KEY', deepseekModel: 'deepseek-chat' },
    `Created ${CONFIG_FILE} — add your DeepSeek API key from https://platform.deepseek.com`,
  ],
  together: [
    { provider: 'together', togetherApiKey: 'YOUR_TOGETHER_API_KEY', togetherModel: 'meta-llama/Llama-3-70b-chat-hf' },
    `Created ${CONFIG_FILE} — add your Together AI API key from https://api.together.xyz`,
  ],
  perplexity: [
    { provider: 'perplexity', perplexityApiKey: 'YOUR_PERPLEXITY_API_KEY', perplexityModel: 'llama-3.1-sonar-large-128k-online' },
    `Created ${CONFIG_FILE} — add your Perplexity API key from https://www.perplexity.ai/settings/api`,
  ],
  'azure-openai': [
    {
      provider: 'azure-openai',
      azureOpenaiApiKey: 'YOUR_AZURE_OPENAI_API_KEY',
      azureOpenaiEndpoint: 'https://YOUR_RESOURCE.openai.azure.com',
      azureOpenaiDeployment: 'YOUR_DEPLOYMENT_NAME',
      azureOpenaiApiVersion: '2024-10-01-preview',
    },
    `Created ${CONFIG_FILE} — fill in your Azure OpenAI endpoint, deployment, and API key from https://portal.azure.com`,
  ],
};

export function initConfig(provider: ProviderName = 'gemini', framework?: string): void {
  const configPath = join(process.cwd(), CONFIG_FILE);
  if (existsSync(configPath)) {
    console.log(`${CONFIG_FILE} already exists.`);
    return;
  }
  const [starter, message] = STARTER_CONFIGS[provider];
  const config = framework ? { ...starter, framework } : starter;
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(message);
}
