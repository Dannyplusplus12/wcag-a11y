# WCAG A11y

[![CI](https://github.com/Dannyplusplus12/WCAG-A11y/actions/workflows/ci.yml/badge.svg)](https://github.com/Dannyplusplus12/WCAG-A11y/actions/workflows/ci.yml)

Most accessibility auditors stop at detection — they tell you *what* is broken and leave the rest to you. `wcag-a11y` goes further. It crawls your running dev server with Playwright, runs 40+ WCAG 2.1/2.2 checks, and uses AI to generate ready-to-paste fix prompts **or write the fixes directly into your source files**.

Two modes:
- **`scan`** — find violations + generate AI prompts you paste into Cursor, Copilot, or Claude
- **`fix`** — find violations + patch source files automatically (dry-run by default, `--apply` to write)

---

## Try it instantly

No dev server, no config, no setup:

```bash
npx wcag-a11y demo
```

---

## What the output looks like

Running a scan prints a violation summary per page, then AI-generated fixes for each rule:

```
Scanning http://localhost:3000...

  /
  ✖  critical   img-alt                  3 violations
  ✖  serious    color-contrast-text      2 violations
  ✖  serious    label-missing            1 violation
  ✖  moderate   no-positive-tabindex     1 violation

  7 violations across 1 page

Generating AI fixes for 7 violations...

────────────────────────────────────────────
[img-alt] — 3 elements affected
  #hero-img  #logo  #banner

  Why it matters:
  Screen readers cannot describe the image to blind users without an alt attribute.
  Users relying on assistive technology receive no information about the image content.

  Fixed HTML:
  <img src="banner.jpg" alt="Summer sale — up to 50% off">

  Prompt for your AI editor:
  Fix accessibility: 3 <img> elements (#hero-img, #logo, #banner) are missing alt
  attributes, violating WCAG 1.1.1. Add descriptive alt text to each image.
────────────────────────────────────────────
```

The **prompt** at the end of each fix is what you copy into Cursor, Copilot, or Claude. It includes the affected selectors, the WCAG rule, and exactly what needs to change — no rewriting needed.

With `--report`, the full output is also saved to `a11y-report.md`.

---

## Install

```bash
npm install -g wcag-a11y
```

## Setup

```bash
wcag-a11y init                            # Gemini (free, default)
wcag-a11y init --provider openai          # OpenAI
wcag-a11y init --provider anthropic       # Anthropic Claude
wcag-a11y init --provider mistral         # Mistral
wcag-a11y init --provider groq            # Groq (fast inference)
wcag-a11y init --provider cohere          # Cohere
wcag-a11y init --provider xai             # xAI Grok
wcag-a11y init --provider deepseek        # DeepSeek
wcag-a11y init --provider together        # Together AI (open-source models)
wcag-a11y init --provider perplexity      # Perplexity
wcag-a11y init --provider azure-openai    # Azure OpenAI
wcag-a11y init --provider ollama          # Local — no API key needed
```

Each command creates an `a11y.config.json` pre-wired for that provider. Fill in your API key, then scan.

---

## Commands

### `wcag-a11y demo`

Scan a built-in page with 10 intentional violations. No dev server or config required — useful for trying the tool before pointing it at your own project.

```bash
wcag-a11y demo                  # violations + AI fixes (default, requires config)
wcag-a11y demo --no-ai          # violations only, no AI — faster
wcag-a11y demo --report         # + save a11y-report.md
```

| Flag | Description |
|---|---|
| `--no-ai` | Skip AI fix generation — prints violations only, no prompts |
| `-r, --report` | Save the full report to `a11y-report.md` in the current directory |

---

### `wcag-a11y init`

Create `a11y.config.json` in the current directory, pre-configured for your chosen provider.

```bash
wcag-a11y init                       # Gemini (default)
wcag-a11y init --provider openai     # OpenAI
wcag-a11y init --provider ollama     # Ollama (local)
```

| Flag | Description |
|---|---|
| `--provider <name>` | Which provider to configure. Valid values: `gemini` (default), `openai`, `anthropic`, `mistral`, `groq`, `cohere`, `xai`, `deepseek`, `together`, `perplexity`, `azure-openai`, `ollama`. Determines which fields are written to the config file. |

---

### `wcag-a11y scan`

Scan a running dev server for accessibility violations.

```bash
wcag-a11y scan -u http://localhost:3000
wcag-a11y scan -u http://localhost:3000 --pages / /about /contact
wcag-a11y scan -u http://localhost:3000 --crawl --report
wcag-a11y scan -u http://localhost:3000 --no-ai --ci
```

| Flag | Default | Description |
|---|---|---|
| `-u, --url <url>` | required | Base URL of your running dev server |
| `-p, --pages <pages...>` | `/` | One or more paths to scan. Separate with spaces: `--pages / /about /contact` |
| `-c, --crawl` | off | Follow same-origin links and scan all reachable pages automatically |
| `-r, --report` | off | Save the full scan output to `a11y-report.md` |
| `--no-ai` | on | Skip AI fix generation — scan runs faster and prints violations only |
| `--no-explain` | off | Print only the ready-to-paste prompt for each fix, without the AI explanation |
| `--group <strategy>` | `rule` | `rule` (default) groups all violations of the same type into one fix prompt. `none` produces a separate prompt per element. Use `none` when violations of the same rule need different fixes |
| `--ci` | off | Exit with code `1` if any violations are found. Use this to fail a CI pipeline |
| `--provider <name>` | from config | Override the AI provider for this run. See [AI Providers](#ai-providers) for valid names. Does not modify the config file |

---

### `wcag-a11y fix`

Scan for violations and apply AI-generated patches directly to your source files. Works with any framework — React, Vue, Angular, Svelte, or plain HTML.

```bash
# Dry-run: scan and show what would change (safe, no files written)
wcag-a11y fix -u http://localhost:3000

# Preview specific pages
wcag-a11y fix -u http://localhost:3000 --pages / /about /contact

# Write fixes to disk
wcag-a11y fix -u http://localhost:3000 --apply

# Auto-discover pages + write fixes
wcag-a11y fix -u http://localhost:3000 --crawl --apply

# Skip rescanning — load violations from an existing report
wcag-a11y fix --from-report
wcag-a11y fix --from-report ./reports/a11y-report.md --apply
```

**How it works:**

1. Runs the same scan as `wcag-a11y scan` (or loads an existing report with `--from-report`)
2. For each violation, locates the source file — checks `violation.source` (React dev mode) first, then falls back to grepping `./src` for unique identifiers in the HTML snippet (`id=`, `name=`, `for=`, local `src=`, text content)
3. Groups violations by file (multiple violations in the same file → one AI call)
4. Sends the full file content + violation list to your configured AI provider and asks for the corrected file
5. Shows a colored diff before writing anything
6. With `--apply`, overwrites the file; without it, only prints the diff

```
src/components/Navbar.jsx — 2 violation(s)
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

| Flag | Default | Description |
|---|---|---|
| `-u, --url <url>` | — | Base URL of your running dev server. Required unless `--from-report` is used |
| `-p, --pages <pages...>` | `/` | Specific pages to scan |
| `-c, --crawl` | off | Auto-discover pages by following same-origin links |
| `--from-report [path]` | `a11y-report.md` | Load violations from an existing report instead of scanning. Useful when you already ran `scan --report` and just want to apply fixes |
| `--apply` | off | Write patched files to disk (dry-run without this flag) |
| `--provider <name>` | from config | Override AI provider for this run. See [AI Providers](#ai-providers) for valid names |

> **Tip:** Always run without `--apply` first to review the diff. The dry-run is safe — nothing is written to disk.

**Common workflow:** run `scan --report` to generate a report for review, then run `fix --from-report --apply` to patch the files — no second browser crawl needed.

```bash
wcag-a11y scan -u http://localhost:3000 --report   # review a11y-report.md
wcag-a11y fix --from-report --apply                 # patch files from that report
```

---

## AI Providers

12 providers are supported. Set your provider in `a11y.config.json` or override per-run with `--provider <name>`.

| Provider | `--provider` name | Default model | API key source |
|---|---|---|---|
| Google Gemini | `gemini` *(default)* | `gemini-2.5-flash` | [aistudio.google.com](https://aistudio.google.com) — free tier |
| OpenAI | `openai` | `gpt-4o-mini` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| Anthropic | `anthropic` | `claude-sonnet-4-6` | [console.anthropic.com](https://console.anthropic.com) |
| Mistral | `mistral` | `mistral-large-latest` | [console.mistral.ai](https://console.mistral.ai) |
| Groq | `groq` | `llama-3.3-70b-versatile` | [console.groq.com](https://console.groq.com) |
| Cohere | `cohere` | `command-r-plus` | [dashboard.cohere.com](https://dashboard.cohere.com) |
| xAI | `xai` | `grok-2` | [console.x.ai](https://console.x.ai) |
| DeepSeek | `deepseek` | `deepseek-chat` | [platform.deepseek.com](https://platform.deepseek.com) |
| Together AI | `together` | `meta-llama/Llama-3-70b-chat-hf` | [api.together.xyz](https://api.together.xyz) |
| Perplexity | `perplexity` | `llama-3.1-sonar-large-128k-online` | [perplexity.ai/settings/api](https://www.perplexity.ai/settings/api) |
| Azure OpenAI | `azure-openai` | *(your deployment)* | [portal.azure.com](https://portal.azure.com) |
| Ollama | `ollama` | `llama3` | None — run `ollama serve` locally |

All models are configurable. Change the model field in `a11y.config.json` to use any model your API key has access to. If the AI response is unparseable, the tool generates a fix prompt directly from the violation data so you always get something actionable.

---

## Config (`a11y.config.json`)

Only the fields for your active `provider` are required. This file is gitignored by default.

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

---

## What it checks

40+ rules across 10 categories, mapped to WCAG 2.1/2.2 success criteria.

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
