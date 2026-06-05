#!/usr/bin/env node
import { Command } from 'commander';
import { loadConfig, initConfig, type Config, type ProviderName } from './config.js';
import { crawl } from './crawler.js';
import { createAIProvider } from './ai/index.js';
import { groupViolations } from './ai/group.js';
import { printTerminalReport, printAIPrompts } from './reporter/terminal.js';
import { generateMarkdownReport } from './reporter/markdown.js';
import { runDemo } from './demo.js';
import { runFix } from './fixer.js';
import { resolve } from 'path';

const program = new Command();

program
  .name('wcag-a11y')
  .description('WCAG 2.1/2.2 accessibility auditor with AI-powered fixes')
  .version('0.4.3');

program
  .command('init')
  .description('Create a11y.config.json in the current directory')
  .option('--provider <name>', 'AI provider to configure (gemini|openai|ollama|anthropic|mistral|groq|cohere|xai|deepseek|together|perplexity|azure-openai)', 'gemini')
  .option('--framework <name>', 'Your project framework — saves to config so every run uses it automatically (e.g. next, react, vue, angular, svelte, astro)')
  .action((opts: { provider: ProviderName; framework?: string }) => {
    initConfig(opts.provider, opts.framework);
  });

program
  .command('scan')
  .description('Scan a running dev server for accessibility violations')
  .requiredOption('-u, --url <url>', 'Base URL of your dev server (e.g. http://localhost:3000)')
  .option('-p, --pages <pages...>', 'Specific pages to scan (e.g. / /about /contact)', ['/'])
  .option('-c, --crawl', 'Auto-discover pages by following same-origin links', false)
  .option('--no-report', 'Skip saving markdown report to a11y-report.md')
  .option('--no-ai', 'Skip AI fix generation (faster, violations only)')
  .option('--no-explain', 'Hide AI fix explanations in terminal output')
  .option('--terminal', 'Print violations summary to terminal', false)
  .option('--fast-mode', 'Output only AI fix prompts — no summaries or explanations', false)
  .option('--group <strategy>', 'Group violations by rule or show individually (rule|none)', 'rule')
  .option('--ci', 'Exit with code 1 if any violations are found (for CI/CD pipelines)', false)
  .option('--auth-state <path>', 'Path to Playwright storageState JSON for authenticated sessions (e.g. auth.json)')
  .option('--provider <name>', 'Override the AI provider from config (gemini|openai|ollama|anthropic|mistral|groq|cohere|xai|deepseek|together|perplexity|azure-openai)')
  .option('--framework <name>', 'Override framework detection for this run (e.g. next, react, vue, angular, svelte, astro)')
  .action(async (opts: { url: string; pages: string[]; crawl: boolean; report: boolean; ai: boolean; explain: boolean; terminal: boolean; fastMode: boolean; group: string; ci: boolean; authState?: string; provider?: string; framework?: string }) => {
    try {
      console.log(`\nScanning ${opts.url}...`);

      const result = await crawl({ url: opts.url, pages: opts.pages, crawl: opts.crawl, framework: opts.framework, authState: opts.authState });

      if (opts.terminal && !opts.fastMode) {
        printTerminalReport(result);
      }

      const strategy = opts.group === 'none' ? 'none' : 'rule';

      if (opts.ai && result.totalViolations > 0) {
        const config = loadConfig();
        if (opts.provider) {
          config.provider = opts.provider as Config['provider'];
        }
        const provider = createAIProvider(config);
        const allViolations = result.pages.flatMap((p) => p.violations);
        const ruleGroups = groupViolations(allViolations, strategy);
        const framework = result.framework ?? config.framework;

        if (!opts.fastMode) {
          console.log(`\nGenerating AI fixes for ${ruleGroups.length} rule groups (${allViolations.length} violations)...`);
        }
        const fixes = await provider.generateFixes(allViolations, strategy, framework);

        if (opts.terminal) {
          printAIPrompts(fixes, { explain: opts.explain, fastMode: opts.fastMode });
        }

        if (opts.report) {
          generateMarkdownReport(result, fixes, { fastMode: opts.fastMode });
        }
      } else if (opts.report) {
        generateMarkdownReport(result, [], { fastMode: opts.fastMode });
      }

      if (opts.ci && result.totalViolations > 0) {
        process.exit(1);
      }
    } catch (err) {
      console.error(`\nError: ${(err as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('fix')
  .description('Scan for violations and apply AI fixes directly to source files')
  .option('-u, --url <url>', 'Base URL of your dev server (e.g. http://localhost:3000)')
  .option('-p, --pages <pages...>', 'Specific pages to scan', ['/'])
  .option('-c, --crawl', 'Auto-discover pages by following same-origin links', false)
  .option('--from-report [path]', 'Use an existing report instead of scanning (default: a11y-report.md)')
  .option('--apply', 'Write fixes to source files (default: dry-run, shows diff only)', false)
  .option('--force', 'Skip git dirty-state check when using --apply', false)
  .option('--provider <name>', 'Override the AI provider from config (gemini|openai|ollama|anthropic|mistral|groq|cohere|xai|deepseek|together|perplexity|azure-openai)')
  .option('--framework <name>', 'Override framework detection for this run (e.g. next, react, vue, angular, svelte, astro)')
  .action(async (opts: { url?: string; pages: string[]; crawl: boolean; fromReport?: string | boolean; apply: boolean; force: boolean; provider?: string; framework?: string }) => {
    if (!opts.url && !opts.fromReport) {
      console.error('\nError: provide --url <url> to scan, or --from-report [path] to load an existing report.');
      process.exit(1);
    }
    try {
      const config = loadConfig();
      if (opts.provider) config.provider = opts.provider as Config['provider'];
      const provider = createAIProvider(config);
      const reportPath = opts.fromReport
        ? (opts.fromReport === true ? 'a11y-report.md' : opts.fromReport)
        : undefined;
      await runFix({
        url: opts.url,
        pages: opts.pages,
        crawl: opts.crawl,
        reportPath,
        apply: opts.apply,
        force: opts.force,
        provider,
        srcDir: resolve(process.cwd(), 'src'),
        framework: opts.framework ?? config.framework,
      });
    } catch (err) {
      console.error(`\nError: ${(err as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('demo')
  .description('Scan a built-in demo page with intentional violations — no dev server needed')
  .option('--no-report', 'Skip saving markdown report to a11y-report.md')
  .option('--no-ai', 'Skip AI fix generation (faster, violations only)')
  .action(async (opts: { report: boolean; ai: boolean }) => {
    try {
      await runDemo({ ai: opts.ai, report: opts.report });
    } catch (err) {
      console.error(`\nError: ${(err as Error).message}`);
      process.exit(1);
    }
  });

program.parse();
