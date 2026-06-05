# WCAG A11y

[![CI](https://github.com/Dannyplusplus12/WCAG-A11y/actions/workflows/ci.yml/badge.svg)](https://github.com/Dannyplusplus12/WCAG-A11y/actions/workflows/ci.yml)

Most accessibility auditors stop at detection — they tell you *what* is broken and leave the rest to you. `wcag-a11y` crawls your running dev server with Playwright, runs 40+ WCAG 2.1/2.2 checks, and uses AI to generate ready-to-paste fix prompts **or write the fixes directly into your source files**.

Two modes:
- **`scan`** — find violations + get AI prompts you paste into Cursor, Copilot, or Claude
- **`fix`** — find violations + patch source files automatically (dry-run by default, `--apply` to write)

---

## Try it instantly

No dev server, no config:

```bash
npx wcag-a11y demo
```

---

## What the output looks like

```
WCAG A11y — scan complete
────────────────────────────────────────────────────────────

  ✖  http://localhost:3000  3 critical  4 serious  3 moderate

     [CRITICAL] Images must have an alt attribute  WCAG 1.1.1
     → img
     [CRITICAL] Form inputs must have an associated label  WCAG 1.3.1
     → input[type="email"]
     [CRITICAL] Buttons must have an accessible name  WCAG 4.1.2
     → button[type="submit"]
     [SERIOUS]  Normal text must meet 4.5:1 contrast ratio  WCAG 1.4.3
     → p
     [SERIOUS]  Links must have descriptive text  WCAG 2.4.4
     → a[href="/sale"]
     … and 5 more

────────────────────────────────────────────────────────────
Total: 3 critical · 4 serious · 3 moderate

AI Fix Prompts — paste any of these into Cursor, Copilot, or Claude
────────────────────────────────────────────────────────────

[img-alt]
  → img
  Screen reader users hear nothing for this image — branding, instructions,
  or data it conveys is completely invisible to them.
┌─ Copy this prompt ──────────────────────────────────────
│ Fix WCAG 1.1.1 (Level A) — img is missing an alt attribute
│
│ Current HTML:
│   <img src="banner.jpg">
│
│ How to fix:
│   Add alt text describing the image content.
│   Use alt="" if the image is purely decorative.
│   Example: <img src="banner.jpg" alt="Summer sale — 50% off">
└─────────────────────────────────────────────────────────

… 9 more prompts — full report saved to a11y-report.md
```

Each prompt tells you the WCAG criterion, shows the broken element, and gives the exact fix — ready to paste into your AI editor.

---

## Install

```bash
npm install -g wcag-a11y
```

## Quick start

```bash
# 1. Configure your AI provider and framework (Gemini is free, no credit card)
wcag-a11y init --framework next      # Next.js
wcag-a11y init --framework react     # React / Vite
wcag-a11y init --framework vue       # Vue / Nuxt
wcag-a11y init --framework angular   # Angular
wcag-a11y init --framework svelte    # Svelte / SvelteKit
wcag-a11y init                       # plain HTML or auto-detect

# 2. Start your dev server, then scan
wcag-a11y scan -u http://localhost:3000
```

Add `--pages / /about /contact` to scan specific routes, or `--crawl` to follow links automatically.

---

## Commands

### `wcag-a11y scan`

Scan a running dev server for accessibility violations.

```bash
wcag-a11y scan -u http://localhost:3000
wcag-a11y scan -u http://localhost:3000 --pages / /about /contact
wcag-a11y scan -u http://localhost:3000 --crawl
wcag-a11y scan -u http://localhost:3000 --no-ai --ci
wcag-a11y scan -u http://localhost:3000 --terminal --fast-mode
```

| Flag | Default | Description |
|---|---|---|
| `-u, --url <url>` | required | Base URL of your running dev server |
| `-p, --pages <paths...>` | `/` | Paths to scan. Space-separated: `--pages / /about /contact` |
| `-c, --crawl` | off | Follow same-origin links and scan all reachable pages |
| `--no-ai` | — | Skip AI fix generation — scan runs faster, violations only |
| `--no-report` | — | Skip saving `a11y-report.md` |
| `--no-explain` | — | Omit explanations, show prompts only |
| `--terminal` | off | Print violations and AI prompts to terminal |
| `--fast-mode` | off | Output only the raw prompts — no summaries or decoration |
| `--group <strategy>` | `rule` | `rule`: one prompt per rule type. `none`: one prompt per element |
| `--ci` | off | Exit with code `1` if any violations are found |
| `--provider <name>` | from config | Override AI provider for this run |
| `--framework <name>` | from config | Override framework for this run (e.g. `next`, `react`, `vue`, `angular`, `svelte`, `astro`) |

---

### `wcag-a11y fix`

Scan for violations and apply AI-generated patches directly to your source files. Works with any framework — React, Vue, Angular, Svelte, or plain HTML.

```bash
wcag-a11y fix -u http://localhost:3000               # dry-run: show diff, nothing written
wcag-a11y fix -u http://localhost:3000 --apply       # write fixes to disk
wcag-a11y fix --from-report --apply                  # patch from an existing report
```

```
src/components/Navbar.jsx — 2 violations
  · [button-name] Buttons must have an accessible name
  · [aria-valid-role] Elements must use valid ARIA roles

  Requesting AI patch... done
  +2 -1
    <nav className="navbar">
  -   <button onClick={toggle}><MenuIcon /></button>
  +   <button onClick={toggle} aria-label="Toggle navigation"><MenuIcon /></button>
      <ul role="navigation">
  -     <li role="listbox">Home</li>
  +     <li>Home</li>
```

**Common workflow:** scan first to review, then patch:

```bash
wcag-a11y scan -u http://localhost:3000   # generates a11y-report.md
wcag-a11y fix --from-report --apply       # patches files from that report, no second crawl
```

| Flag | Default | Description |
|---|---|---|
| `-u, --url <url>` | — | Base URL. Required unless `--from-report` is used |
| `-p, --pages <paths...>` | `/` | Paths to scan |
| `-c, --crawl` | off | Auto-discover pages by following same-origin links |
| `--from-report [path]` | `a11y-report.md` | Load violations from an existing report instead of rescanning |
| `--apply` | off | Write fixes to disk (dry-run without this flag) |
| `--provider <name>` | from config | Override AI provider for this run |
| `--framework <name>` | from config | Override framework for this run (e.g. `next`, `react`, `vue`, `angular`, `svelte`, `astro`) |

---

### `wcag-a11y init`

Create `a11y.config.json` pre-configured for your chosen provider and framework.

```bash
wcag-a11y init                                      # Gemini (free, default)
wcag-a11y init --provider openai --framework next   # OpenAI + Next.js
wcag-a11y init --provider ollama --framework react  # local Ollama + React
# … 12 providers total, any framework string accepted
```

| Flag | Description |
|---|---|
| `--provider <name>` | AI provider. Default: `gemini`. See [AI Providers](#ai-providers) for all options |
| `--framework <name>` | Your project framework — saved to config so every scan uses it automatically |

Framework is saved as `"framework"` in `a11y.config.json`. You can also edit the file directly at any time. Supported values for best results: `next`, `react`, `vue`, `nuxt`, `angular`, `svelte`, `gatsby`, `remix`, `astro` — or any free-form string.

---

### `wcag-a11y demo`

Scan a built-in page with 10 intentional violations. No dev server or config required — useful for trying the tool before pointing it at your own project.

```bash
wcag-a11y demo           # violations + AI fix prompts (requires config)
wcag-a11y demo --no-ai  # violations only, no AI
```

---

## AI Providers

12 providers supported. Configure once in `a11y.config.json`, or override per-run with `--provider`.

| Provider | `--provider` | Default model | Notes |
|---|---|---|---|
| Google Gemini | `gemini` *(default)* | `gemini-2.5-flash` | Free tier available |
| OpenAI | `openai` | `gpt-4o-mini` | |
| Anthropic | `anthropic` | `claude-sonnet-4-6` | |
| Mistral | `mistral` | `mistral-large-latest` | |
| Groq | `groq` | `llama-3.3-70b-versatile` | Fast inference |
| Cohere | `cohere` | `command-r-plus` | |
| xAI | `xai` | `grok-2` | |
| DeepSeek | `deepseek` | `deepseek-chat` | |
| Together AI | `together` | `meta-llama/Llama-3-70b-chat-hf` | Open-source models |
| Perplexity | `perplexity` | `llama-3.1-sonar-large-128k-online` | |
| Azure OpenAI | `azure-openai` | *(your deployment)* | |
| Ollama | `ollama` | `llama3` | Local — no API key |

All models are configurable. If the AI response is unparseable, the tool generates a fix prompt directly from the violation data — you always get something actionable.

---

## Config

Run `wcag-a11y init` to generate `a11y.config.json`. Only fill in the fields for your chosen provider. This file is gitignored by default.

```json
{
  "provider": "gemini",
  "apiKey": "YOUR_GEMINI_API_KEY",
  "framework": "next"
}
```

<details>
<summary>Full config reference (all 12 providers)</summary>

```json
{
  "provider": "gemini",

  "apiKey": "YOUR_GEMINI_API_KEY",
  "model": "gemini-2.5-flash",

  "openaiApiKey": "YOUR_OPENAI_API_KEY",
  "openaiModel": "gpt-4o-mini",

  "anthropicApiKey": "YOUR_ANTHROPIC_API_KEY",
  "anthropicModel": "claude-sonnet-4-6",

  "mistralApiKey": "YOUR_MISTRAL_API_KEY",
  "mistralModel": "mistral-large-latest",

  "groqApiKey": "YOUR_GROQ_API_KEY",
  "groqModel": "llama-3.3-70b-versatile",

  "cohereApiKey": "YOUR_COHERE_API_KEY",
  "cohereModel": "command-r-plus",

  "xaiApiKey": "YOUR_XAI_API_KEY",
  "xaiModel": "grok-2",

  "deepseekApiKey": "YOUR_DEEPSEEK_API_KEY",
  "deepseekModel": "deepseek-chat",

  "togetherApiKey": "YOUR_TOGETHER_API_KEY",
  "togetherModel": "meta-llama/Llama-3-70b-chat-hf",

  "perplexityApiKey": "YOUR_PERPLEXITY_API_KEY",
  "perplexityModel": "llama-3.1-sonar-large-128k-online",

  "azureOpenaiApiKey": "YOUR_AZURE_KEY",
  "azureOpenaiEndpoint": "https://YOUR_RESOURCE.openai.azure.com",
  "azureOpenaiDeployment": "YOUR_DEPLOYMENT_NAME",
  "azureOpenaiApiVersion": "2024-10-01-preview",

  "ollamaBaseUrl": "http://localhost:11434",
  "ollamaModel": "llama3"
}
```

</details>

---

## What it checks

40+ rules across 10 WCAG 2.1/2.2 categories: Text Alternatives, Color Contrast, Forms, Keyboard, ARIA, Structure, Links, Media, Tables, and Language.

<details>
<summary>Full rule list</summary>

### Text Alternatives — WCAG 1.1.1

| Rule | Impact | Description |
|---|---|---|
| `img-alt` | critical | Images must have an `alt` attribute |
| `input-image-alt` | critical | `<input type="image">` must have `alt` |
| `svg-title` | serious | Inline SVGs must have `<title>` or `aria-label` |
| `object-alt` | serious | `<object>` must have fallback text content |
| `role-img-alt` | serious | Elements with `role="img"` must have an accessible name |
| `image-redundant-alt` | minor | Image `alt` must not duplicate nearby visible text |

### Color Contrast — WCAG 1.4.3 / 1.4.6

| Rule | Impact | Description |
|---|---|---|
| `color-contrast-text` | serious | Normal text must meet 4.5:1 contrast ratio |
| `color-contrast-large-text` | serious | Large text must meet 3:1 contrast ratio |

### Forms — WCAG 1.3.1, 1.3.5, 3.3.1, 3.3.2, 4.1.2

| Rule | Impact | Description |
|---|---|---|
| `label-missing` | critical | Form inputs must have an associated label |
| `label-empty` | serious | `<label>` elements must have text content |
| `error-identification` | serious | Invalid inputs must link to an error message via `aria-describedby` |
| `input-button-name` | critical | Input buttons must have a discernible label |
| `fieldset-legend` | moderate | `<fieldset>` must have a `<legend>` with text |
| `autocomplete` | moderate | Common fields (name, email, phone) should declare `autocomplete` |
| `form-field-required-label` | moderate | Required inputs should expose state via `aria-required` |

### Keyboard — WCAG 2.1.1, 2.4.1, 2.4.3, 2.4.7

| Rule | Impact | Description |
|---|---|---|
| `no-positive-tabindex` | serious | `tabindex` > 0 disrupts natural tab order |
| `interactive-not-focusable` | serious | Clickable `div`/`span` elements must be keyboard accessible |
| `skip-link` | moderate | Pages should have a skip navigation link |
| `focus-visible` | serious | Focusable elements must not hide the focus indicator |
| `scrollable-region-focusable` | moderate | Scrollable regions must be keyboard reachable |
| `accesskey-unique` | moderate | `accesskey` values must be unique per page |

### ARIA — WCAG 4.1.2

| Rule | Impact | Description |
|---|---|---|
| `aria-valid-role` | critical | Elements must use valid ARIA roles |
| `aria-required-attr` | critical | Roles must include all required attributes |
| `aria-hidden-focus` | serious | `aria-hidden` elements must not be focusable |
| `button-name` | critical | Buttons must have an accessible name |
| `aria-required-children` | serious | Roles must contain required child roles |
| `aria-required-parent` | serious | Roles must be inside a required parent role |
| `aria-prohibited-attr` | moderate | ARIA attributes must be allowed on the element |

### Structure — WCAG 1.3.1, 2.4.2, 4.1.1

| Rule | Impact | Description |
|---|---|---|
| `heading-order` | moderate | Heading levels must not skip (e.g. h1 → h4) |
| `page-title` | serious | Pages must have a non-empty `<title>` |
| `landmark-one-main` | moderate | Page must have exactly one `<main>` landmark |
| `list-structure` | serious | `<li>`, `<dt>`, `<dd>` must be inside the correct parent |
| `region-landmark` | moderate | Content must be inside a landmark region |
| `duplicate-id` | serious | `id` attributes must be unique per page |
| `frame-title` | serious | `<iframe>` elements must have a `title` attribute |
| `meta-viewport` | critical | Viewport must not block user scaling |
| `marquee` | serious | `<marquee>` is deprecated and inaccessible |
| `p-as-heading` | moderate | Paragraphs styled as headings should use heading elements |

### Links — WCAG 2.4.4, 2.4.9

| Rule | Impact | Description |
|---|---|---|
| `link-name` | serious | Links must have descriptive text (not "click here", "read more") |
| `link-empty` | critical | Links must not be empty |
| `identical-links-different-purpose` | moderate | Links with the same text must go to the same destination |
| `link-new-window-warn` | moderate | Links opening a new tab must warn users |

### Media — WCAG 1.2.2, 1.2.3, 1.2.5

| Rule | Impact | Description |
|---|---|---|
| `video-captions` | critical | `<video>` elements must have a captions track |
| `audio-description` | serious | Videos must have an audio description track |
| `audio-transcript` | serious | `<audio>` elements must have a transcript |

### Tables — WCAG 1.3.1

| Rule | Impact | Description |
|---|---|---|
| `table-headers` | serious | Data tables must have `<th>` header cells |
| `table-scope-valid` | moderate | `scope` attribute values must be valid |
| `td-headers-attr` | serious | `headers` attribute must reference valid `th` IDs |
| `table-duplicate-name` | minor | Table `summary` must not duplicate the `<caption>` |

### Language — WCAG 3.1.1

| Rule | Impact | Description |
|---|---|---|
| `html-lang` | serious | `<html>` must have a `lang` attribute |
| `html-lang-valid` | serious | `lang` attribute must be a valid BCP 47 language tag |

</details>

---

## Use in CI/CD

```yaml
# .github/workflows/a11y.yml
steps:
  - name: Start dev server
    run: npm run dev &

  - name: Wait for server
    run: npx wait-on http://localhost:3000

  - name: Accessibility audit
    run: npx wcag-a11y scan -u http://localhost:3000 --no-ai --ci
```

Exits `0` when clean, `1` when violations are found — gates merges on accessibility.
