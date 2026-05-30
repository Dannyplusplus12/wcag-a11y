# WCAG A11y — Claude Code Context

## What this is
CLI tool (`wcag-a11y`) that crawls a running dev server with Playwright, runs a custom WCAG 2.1/2.2 rule engine, and uses an AI provider (Gemini, OpenAI, or Ollama) to generate fix code + ready-to-paste prompts for AI coding assistants.

## Commands
```bash
npm run build          # compile TypeScript → dist/
npm run dev -- scan -u http://localhost:3000 --ai --report  # run without building
npm run dev -- demo --ai                                     # run built-in demo
npm test               # vitest
npx wcag-a11y scan -u http://localhost:3000 --ai --report   # after build
npx wcag-a11y demo                                          # no dev server needed
```

## Key architecture decisions

**Rule serialization** — `Rule.check()` functions are serialized with `.toString()` and run inside `page.evaluate()` via `new Function(...)`. They MUST be pure: no imports, no closures, no references to outer scope. They return `Array<{selector: string; html: string}>` only — the engine adds all other metadata.

**AI providers** — `GeminiProvider`, `OpenAIProvider`, and `OllamaProvider` all implement `AIProvider`. Selected via `a11y.config.json` or overridden per-run with `--provider`. Gemini uses `gemini-2.5-flash` (free tier). OpenAI uses `gpt-4o-mini`. All providers use raw `fetch` — no SDK dependencies. Fallback generates `optimalPrompt` from violation data if the AI response is unparseable.

**optimalPrompt** — each violation gets a ready-to-paste prompt developers give Cursor/Copilot/Claude to fix the issue automatically. Violations of the same rule are grouped into one prompt by default (`--group rule`).

**demo command** — `src/demo.ts` spins up an in-process HTTP server serving a hardcoded HTML page with 10 intentional violations. No external server needed. Wired into CLI as `wcag-a11y demo`.

## Config
Run `wcag-a11y init --provider <gemini|openai|ollama>` to generate `a11y.config.json` pre-wired for the chosen provider. This file is gitignored.

Config fields:
- `provider`: `'gemini'` | `'openai'` | `'ollama'`
- `apiKey`: Gemini API key
- `model`: Gemini model (default: `gemini-2.5-flash`)
- `openaiApiKey`: OpenAI API key
- `openaiModel`: OpenAI model (default: `gpt-4o-mini`)
- `ollamaBaseUrl`: Ollama base URL (default: `http://localhost:11434`)
- `ollamaModel`: Ollama model (default: `llama3`)

## Rule files location
`src/engine/rules/` — 10 category files: `aria.ts`, `color-contrast.ts`, `forms.ts`, `keyboard.ts`, `language.ts`, `links.ts`, `media.ts`, `structure.ts`, `tables.ts`, `text-alternatives.ts`

## Demo test site
`D:\Dev\APP\wcag-demo\` — intentional violations across 3 pages (index, about, contact). Start with `node server.js` (port 3000).

## Do not
- Add `import` statements or references to outer variables inside `Rule.check()` functions
- Mock the Playwright browser in tests that involve page evaluation
- Change the `Rule.check` return type — it must stay `Array<{selector: string; html: string}>`
- Install npm SDKs for AI providers — all providers use raw `fetch`
