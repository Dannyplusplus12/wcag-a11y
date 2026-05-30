# WCAG A11y — Claude Code Context

## What this is
CLI tool (`wcag-a11y`) that crawls a running dev server with Playwright, runs a custom WCAG 2.1/2.2 rule engine, and uses an AI provider (Gemini or Ollama) to generate fix code + ready-to-paste prompts for AI coding assistants.

## Commands
```bash
npm run build          # compile TypeScript → dist/
npm run dev -- scan -u http://localhost:3000 --ai --report  # run without building
npm test               # vitest
npx wcag-a11y scan -u http://localhost:3000 --ai --report   # after build
```

## Key architecture decisions

**Rule serialization** — `Rule.check()` functions are serialized with `.toString()` and run inside `page.evaluate()` via `new Function(...)`. They MUST be pure: no imports, no closures, no references to outer scope. They return `Array<{selector: string; html: string}>` only — the engine adds all other metadata.

**AI providers** — `GeminiProvider` and `OllamaProvider` both implement `AIProvider`. Selected via `a11y.config.json`. Gemini uses `gemini-2.5-flash` (free tier). Fallback generates `optimalPrompt` from violation data if the AI response is unparseable.

**optimalPrompt** — the core value prop: each violation gets a ready-to-paste prompt developers give Cursor/Copilot/Claude to fix the issue automatically.

## Config
Copy `a11y.config.example.json` → `a11y.config.json` and fill in your Gemini API key. This file is gitignored.

## Rule files location
`src/engine/rules/` — 9 category files: `aria.ts`, `color-contrast.ts`, `forms.ts`, `keyboard.ts`, `language.ts`, `links.ts`, `media.ts`, `structure.ts`, `text-alternatives.ts`

## Demo test site
`D:\Dev\APP\wcag-demo\` — intentional violations across 3 pages (index, about, contact). Start with `node server.js` (port 3000).

## Do not
- Add `import` statements or references to outer variables inside `Rule.check()` functions
- Mock the Playwright browser in tests that involve page evaluation
- Change the `Rule.check` return type — it must stay `Array<{selector: string; html: string}>`
