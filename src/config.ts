import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface Config {
  provider: 'gemini' | 'ollama';
  apiKey?: string;
  model?: string;
  ollamaBaseUrl?: string;
  ollamaModel?: string;
}

const CONFIG_FILE = 'a11y.config.json';
const DEFAULTS: Config = {
  provider: 'gemini',
  model: 'gemini-2.0-flash',
  ollamaBaseUrl: 'http://localhost:11434',
  ollamaModel: 'llama3',
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

export function initConfig(): void {
  const configPath = join(process.cwd(), CONFIG_FILE);
  if (existsSync(configPath)) {
    console.log(`${CONFIG_FILE} already exists.`);
    return;
  }
  const starter: Config = {
    provider: 'gemini',
    apiKey: 'YOUR_GEMINI_API_KEY',
    model: 'gemini-2.0-flash',
  };
  writeFileSync(configPath, JSON.stringify(starter, null, 2));
  console.log(`Created ${CONFIG_FILE} — add your Gemini API key from https://aistudio.google.com`);
}
