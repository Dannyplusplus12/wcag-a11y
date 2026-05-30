import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface Config {
  provider: 'gemini' | 'ollama' | 'openai';
  apiKey?: string;
  model?: string;
  ollamaBaseUrl?: string;
  ollamaModel?: string;
  openaiApiKey?: string;
  openaiModel?: string;
}

const CONFIG_FILE = 'a11y.config.json';
const DEFAULTS: Config = {
  provider: 'gemini',
  model: 'gemini-2.5-flash',
  ollamaBaseUrl: 'http://localhost:11434',
  ollamaModel: 'llama3',
  openaiModel: 'gpt-4o-mini',
};

export function loadConfig(): Config {
  const configPath = join(process.cwd(), CONFIG_FILE);
  if (!existsSync(configPath)) {
    console.error(`No ${CONFIG_FILE} found. Run: wcag-a11y init`);
    process.exit(1);
  }
  const raw = JSON.parse(readFileSync(configPath, 'utf-8'));
  return { ...DEFAULTS, ...raw };
}

const STARTER_CONFIGS: Record<Config['provider'], [Partial<Config>, string]> = {
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
};

export function initConfig(provider: Config['provider'] = 'gemini'): void {
  const configPath = join(process.cwd(), CONFIG_FILE);
  if (existsSync(configPath)) {
    console.log(`${CONFIG_FILE} already exists.`);
    return;
  }
  const [starter, message] = STARTER_CONFIGS[provider];
  writeFileSync(configPath, JSON.stringify(starter, null, 2));
  console.log(message);
}
