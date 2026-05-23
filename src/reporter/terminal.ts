import chalk from 'chalk';
import type { ScanResult } from '../engine/types.js';

const IMPACT_COLOR: Record<string, (s: string) => string> = {
  critical: chalk.red,
  serious:  chalk.yellow,
  moderate: chalk.blue,
  minor:    chalk.gray,
};

export function printTerminalReport(result: ScanResult): void {
  console.log('\n' + chalk.bold('WCAG A11y') + ' — scan complete\n' + chalk.gray('─'.repeat(60)));

  for (const page of result.pages) {
    const url = chalk.cyan(page.url);

    if (page.violations.length === 0) {
      console.log(`\n  ${chalk.green('✔')}  ${url}  ${chalk.green('No violations found')}`);
      continue;
    }

    const c = page.violations.filter((v) => v.impact === 'critical').length;
    const s = page.violations.filter((v) => v.impact === 'serious').length;
    const m = page.violations.filter((v) => v.impact === 'moderate').length;
    const counts = [
      c > 0 ? chalk.red(`${c} critical`) : '',
      s > 0 ? chalk.yellow(`${s} serious`) : '',
      m > 0 ? chalk.blue(`${m} moderate`) : '',
    ].filter(Boolean).join('  ');

    console.log(`\n  ${chalk.red('✖')}  ${url}  ${counts}`);

    for (const v of page.violations) {
      const color = IMPACT_COLOR[v.impact] ?? chalk.white;
      const tag   = color(`[${v.impact.toUpperCase()}]`);
      const wcag  = chalk.gray(`WCAG ${v.wcag}`);
      console.log(`     ${tag} ${v.description}  ${wcag}`);
      console.log(`     ${chalk.gray('→')} ${chalk.dim(v.selector)}`);
    }
  }

  console.log('\n' + chalk.gray('─'.repeat(60)));
  console.log(`Total: ${chalk.red(result.criticalCount + ' critical')} · ${chalk.yellow(result.seriousCount + ' serious')} · ${chalk.blue(result.moderateCount + ' moderate')}`);
  console.log(chalk.gray('Run with --report to save a full markdown report with AI fix suggestions.\n'));
}
