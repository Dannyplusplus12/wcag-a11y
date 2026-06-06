import chalk from 'chalk';
import type { ScanResult } from '../engine/types.js';
import type { AIFix } from '../ai/types.js';
import { groupViolations } from '../ai/group.js';

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

    const groups = groupViolations(page.violations, 'rule');
    for (const g of groups) {
      const color = IMPACT_COLOR[g.impact] ?? chalk.white;
      const countSuffix = g.count > 1 ? chalk.gray(` ×${g.count}`) : '';
      const tag  = color(`[${g.impact.toUpperCase()}]`) + countSuffix;
      const wcag = chalk.gray(`WCAG ${g.wcag}`);
      console.log(`     ${tag} ${g.description}  ${wcag}`);
      const sourceHint = g.representative.source ? chalk.dim(`  ${g.representative.source}`) : '';
      console.log(`     ${chalk.gray('→')} ${chalk.dim(g.selectors[0])}${sourceHint}`);
      if (g.count > 1) {
        console.log(`     ${chalk.gray(`   …and ${g.count - 1} more`)}`);
      }
    }
  }

  console.log('\n' + chalk.gray('─'.repeat(60)));
  console.log(`Total: ${chalk.red(result.criticalCount + ' critical')} · ${chalk.yellow(result.seriousCount + ' serious')} · ${chalk.blue(result.moderateCount + ' moderate')}\n`);
}

export function printAIPrompts(fixes: AIFix[], opts: { explain: boolean; fastMode?: boolean }): void {
  if (fixes.length === 0) return;

  if (opts.fastMode) {
    for (let i = 0; i < fixes.length; i++) {
      console.log(fixes[i].optimalPrompt);
      if (i < fixes.length - 1) console.log('\n' + chalk.gray('─'.repeat(60)));
    }
    console.log('');
    return;
  }

  console.log('\n' + chalk.bold.magenta('AI Fix Prompts') + chalk.gray(' — paste any of these into Cursor, Copilot, or Claude'));
  console.log(chalk.gray('─'.repeat(60)));

  for (const fix of fixes) {
    const countLabel = fix.instanceCount > 1 ? chalk.gray(` × ${fix.instanceCount} instances`) : '';
    console.log('\n' + chalk.bold(`[${fix.ruleId}]`) + countLabel);
    for (const sel of fix.selectors) {
      console.log(chalk.gray(`  → ${sel}`));
    }
    if (opts.explain && fix.explanation) {
      console.log(chalk.gray(fix.explanation));
    }
    console.log(chalk.cyan('┌─ Copy this prompt ──────────────────────────────────────'));
    for (const line of fix.optimalPrompt.split('\n')) {
      console.log(chalk.cyan('│ ') + line);
    }
    console.log(chalk.cyan('└─────────────────────────────────────────────────────────'));
  }

  console.log('');
}
