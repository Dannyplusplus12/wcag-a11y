# WCAG A11y

[![CI](https://github.com/Dannyplusplus12/WCAG-A11y/actions/workflows/ci.yml/badge.svg)](https://github.com/Dannyplusplus12/WCAG-A11y/actions/workflows/ci.yml)

Most accessibility auditors stop at detection — they tell you *what* is broken and leave the rest to you. `wcag-a11y` goes further. It crawls your running dev server with Playwright, runs 40+ WCAG 2.1/2.2 checks, and uses AI to generate a ready-to-paste fix prompt for each violation. You paste it into Cursor, Copilot, or Claude and the fix writes itself.

The goal is to close the loop between finding an accessibility issue and actually fixing it, without interrupting your existing workflow.

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
wcag-a11y init                       # Gemini (free, default)
wcag-a11y init --provider openai     # OpenAI
wcag-a11y init --provider ollama     # Local — no API key needed
```

Each command creates an `a11y.config.json` pre-wired for that provider. Fill in your API key, then scan.

**Get a free Gemini key:** https://aistudio.google.com  
**Get an OpenAI key:** https://platform.openai.com/api-keys  
**Ollama (local):** install from https://ollama.com, then run `ollama serve`

---

## Commands

### `wcag-a11y demo`

Scan a built-in page with 10 intentional violations. No dev server or config required — useful for trying the tool before pointing it at your own project.

```bash
wcag-a11y demo                  # violations only
wcag-a11y demo --ai             # violations + AI fixes (requires config)
wcag-a11y demo --ai --report    # + save a11y-report.md
```

| Flag | Description |
|---|---|
| `--ai` | Generate AI fix explanations and prompts for each violation |
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
| `--provider <name>` | Which provider to configure: `gemini` (default), `openai`, or `ollama`. Determines which fields are written to the config file. |

---

### `wcag-a11y scan`

Scan a running dev server for accessibility violations.

```bash
wcag-a11y scan -u http://localhost:3000
wcag-a11y scan -u http://localhost:3000 --pages / /about /contact
wcag-a11y scan -u http://localhost:3000 --crawl --ai --report
wcag-a11y scan -u http://localhost:3000 --no-ai --ci
```

| Flag | Default | Description |
|---|---|---|
| `-u, --url <url>` | required | Base URL of your running dev server |
| `-p, --pages <pages...>` | `/` | One or more paths to scan. Separate with spaces: `--pages / /about /contact` |
| `-c, --crawl` | off | Follow same-origin links and scan all reachable pages automatically |
| `-r, --report` | off | Save the full scan output to `a11y-report.md` |
| `--ai` / `--no-ai` | on | Generate AI fix explanations and prompts. Use `--no-ai` for a fast violation-only scan |
| `--no-explain` | off | Print only the ready-to-paste prompt for each fix, without the AI explanation |
| `--group <strategy>` | `rule` | `rule` (default) groups all violations of the same type into one fix prompt. `none` produces a separate prompt per element. Use `none` when violations of the same rule need different fixes |
| `--ci` | off | Exit with code `1` if any violations are found. Use this to fail a CI pipeline |
| `--provider <name>` | from config | Override the AI provider for this run: `gemini`, `openai`, or `ollama`. Does not modify the config file |

---

## AI Providers

| Provider | Model | Cost | API Key |
|---|---|---|---|
| `gemini` (default) | `gemini-2.5-flash` | Free tier | [aistudio.google.com](https://aistudio.google.com) |
| `openai` | `gpt-4o-mini` | Pay-per-use | [platform.openai.com](https://platform.openai.com/api-keys) |
| `ollama` | `llama3` | Free (local) | None — run `ollama serve` |

Set your provider in `a11y.config.json` or override it per-run with `--provider`. If the AI response is unparseable, the tool generates a fix prompt directly from the violation data so you always get something actionable.

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

Only the fields for your active provider are required. This file is gitignored by default.

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
