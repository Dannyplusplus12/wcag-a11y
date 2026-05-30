#!/usr/bin/env node
import { Command } from 'commander';
import { loadConfig, initConfig, type Config } from './config.js';
import { crawl } from './crawler.js';
import { createAIProvider } from './ai/index.js';
import { printTerminalReport, printAIPrompts } from './reporter/terminal.js';
import { generateMarkdownReport } from './reporter/markdown.js';
import { runDemo } from './demo.js';

const program = new Command();

program
  .name('wcag-a11y')
  .description('WCAG 2.1/2.2 accessibility auditor with AI-powered fixes')
  .version('0.1.0');

program
  .command('init')
  .description('Create a11y.config.json in the current directory')
  .option('--provider <name>', 'AI provider to configure (gemini|openai|ollama)', 'gemini')
  .action((opts: { provider: Config['provider'] }) => {
    initConfig(opts.provider);
  });

program
  .command('scan')
  .description('Scan a running dev server for accessibility violations')
  .requiredOption('-u, --url <url>', 'Base URL of your dev server (e.g. http://localhost:3000)')
  .option('-p, --pages <pages...>', 'Specific pages to scan (e.g. / /about /contact)', ['/'])
  .option('-c, --crawl', 'Auto-discover pages by following same-origin links', false)
  .option('-r, --report', 'Save a full markdown report to a11y-report.md', false)
  .option('--no-ai', 'Skip AI fix generation (faster, violations only)')
  .option('--no-explain', 'Hide AI fix explanations in terminal output')
  .option('--group <strategy>', 'Group violations by rule or show individually (rule|none)', 'rule')
  .option('--ci', 'Exit with code 1 if any violations are found (for CI/CD pipelines)', false)
  .option('--provider <name>', 'Override the AI provider from config (gemini|openai|ollama)')
  .action(async (opts: { url: string; pages: string[]; crawl: boolean; report: boolean; ai: boolean; explain: boolean; group: string; ci: boolean; provider?: string }) => {
    try {
      console.log(`\nScanning ${opts.url}...`);

      const result = await crawl({ url: opts.url, pages: opts.pages, crawl: opts.crawl });
      printTerminalReport(result);

      const strategy = opts.group === 'none' ? 'none' : 'rule';

      if (opts.ai && result.totalViolations > 0) {
        const config = loadConfig();
        if (opts.provider) {
          config.provider = opts.provider as Config['provider'];
        }
        const provider = createAIProvider(config);
        const allViolations = result.pages.flatMap((p) => p.violations);

        console.log(`\nGenerating AI fixes for ${allViolations.length} violations...`);
        const fixes = await provider.generateFixes(allViolations, strategy);

        printAIPrompts(fixes, { explain: opts.explain });

        if (opts.report) {
          generateMarkdownReport(result, fixes);
        }
      } else if (opts.report) {
        generateMarkdownReport(result, []);
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
  .command('demo')
  .description('Scan a built-in demo page with intentional violations — no dev server needed')
  .option('-r, --report', 'Save a full markdown report to a11y-report.md', false)
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
