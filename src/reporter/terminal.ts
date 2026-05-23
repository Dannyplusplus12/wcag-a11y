import chalk from 'chalk';
import type { ScanResult } from '../engine/types.js';

export function printTerminalReport(result: ScanResult): void {
  console.log('\n' + chalk.bold('WCAG A11y') + ' — scan complete\n' + chalk.gray('─'.repeat(50)));

  for (const page of result.pages) {
    const c = page.violations.filter((v) => v.impact === 'critical').length;
    const s = page.violations.filter((v) => v.impact === 'serious').length;
    const m = page.violations.filter((v) => v.impact === 'moderate').length;

    const icon = page.violations.length === 0 ? chalk.green('✔') : chalk.red('✖');
    const url = chalk.cyan(page.url);

    if (page.violations.length === 0) {
      console.log(`  ${icon}  ${url}  ${chalk.green('No violations found')}`);
    } else {
      const parts = [
        c > 0 ? chalk.red(`${c} critical`) : '',
        s > 0 ? chalk.yellow(`${s} serious`) : '',
        m > 0 ? chalk.blue(`${m} moderate`) : '',
      ].filter(Boolean).join('  ');
      console.log(`  ${icon}  ${url}  ${parts}`);
    }
  }

  console.log('\n' + chalk.gray('─'.repeat(50)));
  const total = `Total: ${chalk.red(result.criticalCount + ' critical')} · ${chalk.yellow(result.seriousCount + ' serious')} · ${chalk.blue(result.moderateCount + ' moderate')}`;
  console.log(total);
}
