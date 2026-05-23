# WCAG A11y

WCAG 2.1/2.2 accessibility CLI auditor with AI-powered fixes.

## Install

```bash
npm install -g wcag-a11y
```

## Setup

```bash
wcag-a11y init          # creates a11y.config.json
# Add your free Gemini API key from https://aistudio.google.com
```

## Usage

```bash
# Scan a single page
wcag-a11y scan --url http://localhost:3000

# Scan specific pages
wcag-a11y scan --url http://localhost:3000 --pages / /about /contact

# Auto-crawl all pages + generate report
wcag-a11y scan --url http://localhost:3000 --crawl --report

# Skip AI (violations only, no fixes)
wcag-a11y scan --url http://localhost:3000 --no-ai
```

## Config (`a11y.config.json`)

```json
{
  "provider": "gemini",
  "apiKey": "YOUR_FREE_KEY",
  "model": "gemini-2.0-flash"
}
```

For local AI (no API key): set `"provider": "ollama"` and run `ollama serve`.
