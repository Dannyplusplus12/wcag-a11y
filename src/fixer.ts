import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import chalk from 'chalk';
import { crawl } from './crawler.js';
import type { Violation, ImpactLevel } from './engine/types.js';
import type { AIProvider } from './ai/types.js';

export interface FixRunOptions {
  url?: string;
  pages?: string[];
  crawl?: boolean;
  reportPath?: string;
  apply: boolean;
  provider: AIProvider;
  srcDir: string;
  framework?: string;
}

const SOURCE_EXTS = new Set(['.jsx', '.tsx', '.js', '.ts', '.vue', '.svelte', '.html']);
const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', '.git', '.next', '.nuxt', 'coverage', 'public']);

export async function runFix(opts: FixRunOptions): Promise<void> {
  let allViolations: Violation[];
  let framework: string | undefined;

  if (opts.reportPath) {
    const absReport = resolve(process.cwd(), opts.reportPath);
    if (!existsSync(absReport)) {
      throw new Error(`Report file not found: ${opts.reportPath}`);
    }
    console.log(`\nLoading violations from ${opts.reportPath}...`);
    allViolations = parseReportViolations(absReport);
    if (allViolations.length === 0) {
      console.log(chalk.green('\nNo violations found in report.'));
      return;
    }
    framework = opts.framework;
    console.log(`Found ${allViolations.length} violation(s) in report. Locating source files...\n`);
  } else {
    console.log(`\nScanning ${opts.url}...`);
    const result = await crawl({ url: opts.url!, pages: opts.pages!, crawl: opts.crawl!, framework: opts.framework });
    framework = result.framework;
    if (result.totalViolations === 0) {
      console.log(chalk.green('\nNo violations found.'));
      return;
    }
    console.log(`Found ${result.totalViolations} violation(s). Locating source files...\n`);
    allViolations = result.pages.flatMap((p) => p.violations);
  }

  // Group violations by resolved source file path
  const fileGroups = new Map<string, Violation[]>();
  let unlocated = 0;

  for (const violation of allViolations) {
    const filePath = findSourceFile(violation, opts.srcDir);
    if (!filePath) {
      console.warn(chalk.yellow(`  warn: no source file for [${violation.ruleId}] ${violation.selector.slice(0, 60)}`));
      unlocated++;
      continue;
    }
    if (!fileGroups.has(filePath)) fileGroups.set(filePath, []);
    fileGroups.get(filePath)!.push(violation);
  }

  if (fileGroups.size === 0) {
    console.log(chalk.yellow('No source files located. Run from your project root and ensure sources are in ./src'));
    return;
  }

  const locatedCount = allViolations.length - unlocated;
  console.log(`Grouped ${locatedCount} violation(s) across ${fileGroups.size} file(s).\n`);
  if (!opts.apply) console.log(chalk.gray('Dry-run mode — use --apply to write changes.\n'));

  let modifiedFiles = 0;
  let modifiedViolations = 0;

  for (const [filePath, violations] of fileGroups) {
    const rel = relativize(filePath);
    console.log(chalk.bold(`\n${rel}`) + chalk.gray(` — ${violations.length} violation(s)`));
    for (const v of violations) {
      console.log(chalk.gray(`  · [${v.ruleId}] ${v.description.slice(0, 80)}`));
    }

    let oldContent: string;
    try {
      oldContent = readFileSync(filePath, 'utf8');
    } catch {
      console.warn(chalk.yellow(`  Cannot read file, skipping.`));
      continue;
    }

    process.stdout.write('  Requesting AI patch...');
    let rawResponse: string;
    try {
      rawResponse = await opts.provider.generateFilePatch(oldContent, violations, rel, framework);
    } catch (err) {
      console.log('');
      console.warn(chalk.yellow(`  AI error: ${(err as Error).message}`));
      continue;
    }
    console.log(' done');

    const newContent = stripCodeFences(rawResponse).trim();

    if (!newContent || newContent.length < oldContent.length * 0.3) {
      console.warn(chalk.yellow('  AI returned unexpected output, skipping.'));
      continue;
    }

    const normalizedOld = oldContent.trim();
    if (newContent === normalizedOld) {
      console.log(chalk.gray('  No changes.'));
      continue;
    }

    console.log(renderDiff(oldContent, newContent, rel));

    if (opts.apply) {
      writeFileSync(filePath, newContent + '\n', 'utf8');
      console.log(chalk.green(`  Written.`));
    }

    modifiedFiles++;
    modifiedViolations += violations.length;
  }

  // Summary
  console.log('\n' + '─'.repeat(60));
  if (modifiedFiles === 0) {
    console.log(chalk.gray('No files changed.'));
  } else if (opts.apply) {
    console.log(chalk.green.bold(`Fixed ${modifiedViolations} violation(s) across ${modifiedFiles} file(s).`));
  } else {
    console.log(chalk.blue.bold(`Would fix ${modifiedViolations} violation(s) across ${modifiedFiles} file(s).`));
    console.log(chalk.gray('Run with --apply to write changes to disk.'));
  }
  if (unlocated > 0) {
    console.log(chalk.yellow(`${unlocated} violation(s) could not be located in source files.`));
  }
}

function parseReportViolations(reportPath: string): Violation[] {
  const content = readFileSync(reportPath, 'utf8');
  const violations: Violation[] = [];

  const pageParts = content.split(/^## Page:/m).slice(1);

  for (const part of pageParts) {
    const pageUrl = part.split('\n')[0].trim();
    if (part.includes('✅ No violations found')) continue;

    for (const group of part.split(/^---$/m)) {
      const headingMatch = group.match(/^###\s+\S+\s+\[(\w+)\]\s+(.+)$/m);
      if (!headingMatch) continue;
      const impact = headingMatch[1].toLowerCase() as ImpactLevel;
      const description = headingMatch[2].trim();

      const ruleMatch = group.match(/\*\*Rule:\*\*\s+`([^`]+)`/);
      if (!ruleMatch) continue;
      const ruleId = ruleMatch[1];

      let wcag = '';
      let level: 'A' | 'AA' | 'AAA' = 'A';
      const wcagStd = group.match(/\*\*WCAG:\*\*\s+SC\s+([\d.]+)\s+\(Level\s+([A-Z]+)\)/);
      if (wcagStd) {
        wcag = wcagStd[1];
        level = wcagStd[2] as 'A' | 'AA' | 'AAA';
      } else {
        const wcagAI = group.match(/\*\*WCAG:\*\*\s+WCAG\s+[\d.]+\s+SC\s+([\d.]+)/);
        if (wcagAI) wcag = wcagAI[1];
      }

      const repMatch = group.match(/\*\*Representative element:\*\*\s*\n`([^`]+)`(?:\s+—\s+`([^`]+)`)?/);
      if (!repMatch) continue;
      const selector = repMatch[1];
      const source = repMatch[2];

      const htmlMatch = group.match(/\*\*Representative element:\*\*[\s\S]*?```html\n([\s\S]*?)\n```/);
      const html = htmlMatch?.[1] ?? '';

      violations.push({ ruleId, wcag, level, impact, description, selector, html, page: pageUrl, ...(source ? { source } : {}) });

      const alsoSection = group.match(/\*\*Also affects[^*]*\*\*([\s\S]*?)(?:\n\n\*\*|\n---|\n```|$)/);
      if (alsoSection) {
        for (const line of alsoSection[1].split('\n')) {
          const m = line.match(/^-\s+`([^`]+)`(?:\s+—\s+`([^`]+)`)?/);
          if (!m) continue;
          violations.push({ ruleId, wcag, level, impact, description, selector: m[1], html: '', page: pageUrl, ...(m[2] ? { source: m[2] } : {}) });
        }
      }
    }
  }

  return violations;
}

export function findSourceFile(violation: Violation, srcDir: string): string | null {
  // Priority 1: React dev-mode source annotation
  if (violation.source) {
    const filePart = violation.source.split(':')[0];
    for (const candidate of [resolve(process.cwd(), filePart), resolve(filePart)]) {
      if (existsSync(candidate)) return candidate;
    }
  }

  // Priority 2: grep src/ for unique attributes/text from the HTML snippet
  for (const needle of extractNeedles(violation.html)) {
    const hits = grepDir(srcDir, needle);
    if (hits.length > 0) return hits[0];
  }

  return null;
}

function extractNeedles(html: string): string[] {
  const results: string[] = [];

  const id = html.match(/\bid=["']([^"']{2,})["']/)?.[1];
  if (id) results.push(`id="${id}"`);

  const name = html.match(/\bname=["']([^"']{2,})["']/)?.[1];
  if (name) results.push(`name="${name}"`);

  const forAttr = html.match(/\bfor=["']([^"']{2,})["']/)?.[1];
  if (forAttr) results.push(`for="${forAttr}"`);

  // local src paths only
  const src = html.match(/\bsrc=["'](?!https?:\/\/)([^"']{4,})["']/)?.[1];
  if (src) results.push(src);

  const text = html.match(/>([^<\s][^<]{4,60})</)?.[1]?.trim();
  if (text) results.push(text);

  // fallback: first meaningful class name
  if (results.length === 0) {
    const cls = html.match(/\bclass=["']([^"']+)["']/)?.[1]?.split(/\s+/)[0];
    if (cls && cls.length > 3) results.push(cls);
  }

  return results.filter((s) => s.length >= 3);
}

function grepDir(dir: string, needle: string): string[] {
  if (!existsSync(dir)) return [];
  const hits: string[] = [];

  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        hits.push(...grepDir(full, needle));
      } else if (entry.isFile() && SOURCE_EXTS.has(extOf(entry.name))) {
        try {
          if (readFileSync(full, 'utf8').includes(needle)) hits.push(full);
        } catch { /* skip */ }
      }
    }
  } catch { /* skip unreadable dirs */ }

  return hits;
}

function extOf(name: string): string {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i) : '';
}

function stripCodeFences(text: string): string {
  const m = text.match(/^```[\w]*\n([\s\S]*?)\n?```\s*$/);
  if (m) return m[1];
  return text.replace(/^```[\w]*\n?/, '').replace(/\n?```\s*$/, '');
}

function relativize(absPath: string): string {
  const cwd = process.cwd();
  return absPath.startsWith(cwd)
    ? absPath.slice(cwd.length + 1).replace(/\\/g, '/')
    : absPath.replace(/\\/g, '/');
}

// ── Diff rendering ────────────────────────────────────────────────────────────

type DiffEntry = { type: 'add' | 'del' | 'eq'; line: string };

function computeDiff(a: string[], b: string[]): DiffEntry[] {
  // Cap to avoid O(n²) freeze on huge files
  if (a.length * b.length > 800_000) {
    return [
      ...a.map((line) => ({ type: 'del' as const, line })),
      ...b.map((line) => ({ type: 'add' as const, line })),
    ];
  }

  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);

  const result: DiffEntry[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      result.unshift({ type: 'eq', line: a[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'add', line: b[j - 1] });
      j--;
    } else {
      result.unshift({ type: 'del', line: a[i - 1] });
      i--;
    }
  }
  return result;
}

function renderDiff(oldContent: string, newContent: string, _filePath: string): string {
  const a = oldContent.split('\n');
  const b = newContent.split('\n');
  const diff = computeDiff(a, b);

  const changeIdxs: number[] = [];
  for (let k = 0; k < diff.length; k++) if (diff[k].type !== 'eq') changeIdxs.push(k);
  if (changeIdxs.length === 0) return chalk.gray('  (no changes)');

  const CONTEXT = 3;
  const hunks: Array<{ start: number; end: number }> = [];
  for (const idx of changeIdxs) {
    const start = Math.max(0, idx - CONTEXT);
    const end = Math.min(diff.length - 1, idx + CONTEXT);
    const last = hunks[hunks.length - 1];
    if (!last || start > last.end + 1) hunks.push({ start, end });
    else last.end = Math.max(last.end, end);
  }

  const addCount = changeIdxs.filter((i) => diff[i].type === 'add').length;
  const delCount = changeIdxs.filter((i) => diff[i].type === 'del').length;

  const lines: string[] = [];
  lines.push(`  ${chalk.green(`+${addCount}`)} ${chalk.red(`-${delCount}`)}`);

  for (let h = 0; h < hunks.length; h++) {
    if (h > 0) lines.push(chalk.gray('    ...'));
    for (let k = hunks[h].start; k <= hunks[h].end; k++) {
      const { type, line } = diff[k];
      if (type === 'add') lines.push(chalk.green(`  + ${line}`));
      else if (type === 'del') lines.push(chalk.red(`  - ${line}`));
      else lines.push(chalk.gray(`    ${line}`));
    }
  }

  return lines.join('\n');
}
