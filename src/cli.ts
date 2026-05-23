#!/usr/bin/env node
import { Command } from 'commander';
import { loadConfig, initConfig } from './config.js';
import { crawl } from './crawler.js';
import { createAIProvider } from './ai/index.js';
import { printTerminalReport } from './reporter/terminal.js';
import { generateMarkdownReport } from './reporter/markdown.js';

const program = new Command();

program
  .name('wcag-a11y')
  .description('WCAG 2.1/2.2 accessibility auditor with AI-powered fixes')
  .version('0.1.0');

program
  .command('init')
  .description('Create a11y.config.json in the current directory')
  .action(() => {
    initConfig();
  });

program
  .command('scan')
  .description('Scan a running dev server for accessibility violations')
  .requiredOption('-u, --url <url>', 'Base URL of your dev server (e.g. http://localhost:3000)')
  .option('-p, --pages <pages...>', 'Specific pages to scan (e.g. / /about /contact)', ['/'])
  .option('-c, --crawl', 'Auto-discover pages by following same-origin links', false)
  .option('-r, --report', 'Save a full markdown report to a11y-report.md', false)
  .option('--no-ai', 'Skip AI fix generation (faster, violations only)')
  .action(async (opts: { url: string; pages: string[]; crawl: boolean; report: boolean; ai: boolean }) => {
    console.log(`\nScanning ${opts.url}...`);

    const result = await crawl({ url: opts.url, pages: opts.pages, crawl: opts.crawl });
    printTerminalReport(result);

    if (opts.ai && result.totalViolations > 0) {
      const config = loadConfig();
      const provider = createAIProvider(config);
      const allViolations = result.pages.flatMap((p) => p.violations);

      console.log(`\nGenerating AI fixes for ${allViolations.length} violations...`);
      const fixes = await provider.generateFixes(allViolations);

      if (opts.report) {
        generateMarkdownReport(result, fixes);
      }
    } else if (opts.report && result.totalViolations > 0) {
      generateMarkdownReport(result, []);
    }
  });

program.parse();
