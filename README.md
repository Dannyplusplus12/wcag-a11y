# WCAG A11y

[![CI](https://github.com/Dannyplusplus12/WCAG-A11y/actions/workflows/ci.yml/badge.svg)](https://github.com/Dannyplusplus12/WCAG-A11y/actions/workflows/ci.yml)

WCAG 2.1/2.2 accessibility CLI auditor with AI-powered fixes. Crawls your running dev server with Playwright, runs a custom rule engine across 40+ checks, and generates ready-to-paste prompts for Cursor, Copilot, or Claude — so you can fix issues without leaving your editor.

## Try it instantly

No dev server needed. Scans a built-in page with intentional violations:

```bash
npx wcag-a11y demo
```

With AI fixes (requires a config file — see Setup):

```bash
npx wcag-a11y demo --ai
```

---

## Install

```bash
npm install -g wcag-a11y
```

## Setup

```bash
wcag-a11y init                       # Gemini (free, default)
wcag-a11y init --provider openai     # OpenAI
wcag-a11y init --provider ollama     # Local — no API key needed
```

Each command creates an `a11y.config.json` pre-wired for that provider. Fill in your API key, then scan.

**Get a free Gemini key:** https://aistudio.google.com  
**Get an OpenAI key:** https://platform.openai.com/api-keys  
**Ollama (local):** install from https://ollama.com then run `ollama serve`

---

## Commands

### `wcag-a11y demo`

Scan a built-in demo page with 10 intentional violations. No dev server or config required.

```bash
wcag-a11y demo                  # violations only, fast
wcag-a11y demo --ai             # violations + AI fixes
wcag-a11y demo --ai --report    # + save a11y-report.md
```

| Flag | Description |
|---|---|
| `--ai` | Generate AI fix explanations and prompts |
| `-r, --report` | Save a full markdown report to `a11y-report.md` |

---

### `wcag-a11y init`

Create `a11y.config.json` in the current directory.

```bash
wcag-a11y init                       # Gemini config (default)
wcag-a11y init --provider openai     # OpenAI config
wcag-a11y init --provider ollama     # Ollama config
```

| Flag | Description |
|---|---|
| `--provider <name>` | Provider to configure: `gemini` (default), `openai`, `ollama` |

---

### `wcag-a11y scan`

Scan a running dev server for accessibility violations.

```bash
# Scan the homepage
wcag-a11y scan -u http://localhost:3000

# Scan specific pages
wcag-a11y scan -u http://localhost:3000 --pages / /about /contact

# Auto-crawl all reachable pages
wcag-a11y scan -u http://localhost:3000 --crawl

# Full scan: crawl + AI fixes + markdown report
wcag-a11y scan -u http://localhost:3000 --crawl --ai --report

# Skip AI (violations only — fast)
wcag-a11y scan -u http://localhost:3000 --no-ai

# Show prompts only, hide AI explanations
wcag-a11y scan -u http://localhost:3000 --no-explain

# Show each violation individually instead of grouping by rule
wcag-a11y scan -u http://localhost:3000 --group none

# Gate a CI pipeline — exits 1 if any violations found
wcag-a11y scan -u http://localhost:3000 --no-ai --ci

# Override provider for this run (ignores config file setting)
wcag-a11y scan -u http://localhost:3000 --provider openai
```

| Flag | Default | Description |
|---|---|---|
| `-u, --url <url>` | required | Base URL of your dev server |
| `-p, --pages <pages...>` | `/` | Specific paths to scan |
| `-c, --crawl` | off | Auto-discover pages by following same-origin links |
| `-r, --report` | off | Save full markdown report to `a11y-report.md` |
| `--ai` / `--no-ai` | on | Generate AI fix explanations and prompts |
| `--no-explain` | off | Hide AI explanations — show `optimalPrompt` only |
| `--group <strategy>` | `rule` | Group violations by rule (`rule`) or show individually (`none`) |
| `--ci` | off | Exit code 1 if violations found (for CI/CD pipelines) |
| `--provider <name>` | from config | Override AI provider: `gemini`, `openai`, `ollama` |

---

## The core value: grouped prompts

Without grouping, 5 images missing `alt` text produce 5 nearly-identical AI prompts. With `--group rule` (the default), they collapse into one actionable prompt you paste into your editor once.

**`--group none`**
```
[img-alt] Fix #hero-img — add a descriptive alt attribute
[img-alt] Fix #logo — add a descriptive alt attribute
[img-alt] Fix #banner — add a descriptive alt attribute
[img-alt] Fix #card-1 — add a descriptive alt attribute
[img-alt] Fix #card-2 — add a descriptive alt attribute
```

**`--group rule` (default)**
```
[img-alt] Fix 5 violations — add descriptive alt attributes to:
  • #hero-img  • #logo  • #banner  • #card-1  • #card-2
```

One prompt. One fix. Done.

---

## AI Providers

| Provider | Model | Cost | API Key |
|---|---|---|---|
| `gemini` (default) | `gemini-2.5-flash` | Free tier | [aistudio.google.com](https://aistudio.google.com) |
| `openai` | `gpt-4o-mini` | Pay-per-use | [platform.openai.com](https://platform.openai.com/api-keys) |
| `ollama` | `llama3` | Free (local) | None — run `ollama serve` |

Switch providers per-run with `--provider`, or set it permanently in `a11y.config.json`.

If the AI response is unparseable, the tool falls back to generating an `optimalPrompt` directly from the violation data — you always get something useful.

---

## Config (`a11y.config.json`)

```json
{
  "provider": "gemini",

  "apiKey": "YOUR_GEMINI_API_KEY",
  "model": "gemini-2.5-flash",

  "openaiApiKey": "YOUR_OPENAI_API_KEY",
  "openaiModel": "gpt-4o-mini",

  "ollamaBaseUrl": "http://localhost:11434",
  "ollamaModel": "llama3"
}
```

Only the fields for your active provider are required. The file is gitignored by default.

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
