# WCAG A11y

[![CI](https://github.com/Dannyplusplus12/WCAG-A11y/actions/workflows/ci.yml/badge.svg)](https://github.com/Dannyplusplus12/WCAG-A11y/actions/workflows/ci.yml)

Most accessibility auditors stop at detection — they tell you *what* is broken and leave the rest to you. `wcag-a11y` crawls your running dev server with Playwright, runs 40+ WCAG 2.1/2.2 checks, and uses AI to generate ready-to-paste fix prompts **or write the fixes directly into your source files**. Works with authenticated apps via Playwright session state.

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

Running `wcag-a11y demo` scans a built-in page, prints a compact summary, and saves `a11y-report.md`:

```
wcag-a11y demo — scanning built-in page with intentional WCAG violations...

Scan complete  ───────────────────────────────────────────────────────

  ✖  http://127.0.0.1:PORT  4 critical · 1 serious

  [CRITICAL]  Images must have an alt attribute  WCAG 1.1.1
  → img[src="hero.jpg"]

  [SERIOUS]  Text must have a contrast ratio of at least 4.5:1 against its background  WCAG 1.4.3
  → #main > p

  ... and 3 more violations

────────────────────────────────────────────────────────────

Report saved → a11y-report.md
  5 violations · open a11y-report.md for the full breakdown

Run on your own project:  npx wcag-a11y scan -u http://localhost:3000
```

`a11y-report.md` is a clean, under-100-line breakdown — one entry per rule, with the selector and failing HTML:

```markdown
### 🔴 [CRITICAL] Images must have an alt attribute

**Rule:** `img-alt`
**WCAG:** SC 1.1.1 (Level A)
**Instances:** 1

**Representative element:**
`img[src="hero.jpg"]`
```html
<img src="hero.jpg" width="800" height="400">
```

---

### 🟠 [SERIOUS] Text must have a contrast ratio of at least 4.5:1 against its background

**Rule:** `color-contrast-text`
**WCAG:** SC 1.4.3 (Level AA)
**Instances:** 1
...
```

Run `wcag-a11y scan -u http://localhost:3000` on your own project to get the full report with AI-generated fix prompts for every violation.

---

## Install

```bash
npm install -g wcag-a11y
```

## Quick start

```bash
# 1. Configure your AI provider (Gemini is free, no credit card)
wcag-a11y init

# 2. Start your dev server, then scan
wcag-a11y scan -u http://localhost:3000
```

Add `--pages / /about /contact` to scan specific routes, or `--crawl` to follow links automatically.

**Optional — set your framework once:** The tool auto-detects common frameworks at runtime. If detection fails (e.g. scanning a staging URL, or using Astro/SvelteKit), set it in your config so every run uses the right syntax:

```bash
wcag-a11y init --framework next    # or react, vue, angular, svelte, astro, …
```

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
| `--auth-state <path>` | — | Path to a Playwright `storageState` JSON. Loads cookies and localStorage so you can scan pages behind a login wall |
| `--provider <name>` | from config | Override AI provider for this run |
| `--framework <name>` | from config | *(optional)* Override framework for this run. Auto-detected by default; use this when scanning staging URLs or for frameworks outside the detection list |

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
| `--force` | off | Skip the git dirty-state check when using `--apply` |
| `--provider <name>` | from config | Override AI provider for this run |
| `--framework <name>` | from config | *(optional)* Override framework for this run. Auto-detected by default; use this when scanning staging URLs or for frameworks outside the detection list |

**Git safety:** `wcag-a11y fix --apply` checks for uncommitted changes before writing anything. If the working tree is dirty it exits with an error — commit or stash first, or pass `--force` to override.

---

### Scanning authenticated pages

Most real apps require a login. Save your session with Playwright once, then reuse it on every scan:

```bash
# 1. Save session (run this once after logging in)
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('http://localhost:3000/login');
  // log in manually in the browser window that opens
  await page.waitForTimeout(30000);
  await context.storageState({ path: 'auth.json' });
  await browser.close();
})();
"

# 2. Scan with your saved session
wcag-a11y scan -u http://localhost:3000 --auth-state auth.json --pages / /dashboard /settings
```

`auth.json` captures cookies and `localStorage`. Keep it out of source control (add `auth.json` to `.gitignore`).

---

### `wcag-a11y init`

Create `a11y.config.json` pre-configured for your chosen provider.

```bash
wcag-a11y init                                      # Gemini (free, default)
wcag-a11y init --provider openai
wcag-a11y init --provider ollama                    # local — no API key needed
wcag-a11y init --provider openai --framework next   # optional: save framework too
```

| Flag | Description |
|---|---|
| `--provider <name>` | AI provider. Default: `gemini`. See [AI Providers](#ai-providers) for all options |
| `--framework <name>` | *(optional)* Your project framework — saved to config so every scan uses it automatically. The tool auto-detects common frameworks; use this flag when scanning staging URLs or using a framework not in the detection list |

Accepted framework values: `next`, `react`, `vue`, `nuxt`, `angular`, `svelte`, `gatsby`, `remix`, `astro` — or any free-form string. You can also add `"framework": "next"` directly to `a11y.config.json` at any time.

---

### `wcag-a11y demo`

Scan a built-in page with intentional violations. No dev server or config required — runs in seconds and shows you exactly what a real scan produces.

```bash
wcag-a11y demo               # scan + fix prompts + saves a11y-report.md (no config needed)
wcag-a11y demo --no-report  # print summary only, skip saving the report file
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
  "apiKey": "YOUR_GEMINI_API_KEY"
}
```

`"framework"` is optional — add it if auto-detection fails for your setup:

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
