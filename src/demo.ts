import { createServer } from 'http';
import type { Server } from 'http';
import chalk from 'chalk';
import { crawl } from './crawler.js';
import { generateFallbackFixes } from './ai/base.js';
import { generateMarkdownReport } from './reporter/markdown.js';

const DEMO_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Acme Store</title>
</head>
<body>
  <a href="#main" class="skip-link">Skip to content</a>
  <header>
    <nav aria-label="Main">
      <a href="/">Home</a>
      <a href="/products">Products</a>
    </nav>
  </header>
  <main id="main">
    <h1>Summer Sale</h1>

    <img src="hero.jpg" width="800" height="400" alt="Summer sale promotional banner">

    <!-- low contrast: #aaa on #fff fails 4.5:1 -->
    <p style="color:#aaa; background:#fff; font-size:14px;">Free shipping on orders over $50.</p>

    <h2>Featured Products</h2>

    <!-- div used as button — not keyboard reachable -->
    <div onclick="addToCart(1)">Add to Cart</div>

    <section aria-label="Newsletter">
      <h2>Stay in the loop</h2>
      <form>
        <!-- email input with no label -->
        <input type="email" placeholder="your@email.com" autocomplete="email">
        <!-- icon-only button with no accessible name -->
        <button type="submit">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M2 8l6-6 6 6M8 2v12"/>
          </svg>
        </button>
      </form>
    </section>

    <!-- anchor with no text content -->
    <a href="/wishlist"></a>
  </main>
  <footer>
    <p>&copy; 2024 Acme Store. All rights reserved.</p>
  </footer>
</body>
</html>`;

const IMPACT_COLOR: Record<string, (s: string) => string> = {
  critical: chalk.red,
  serious: chalk.yellow,
  moderate: chalk.blue,
  minor: chalk.gray,
};

function startDemoServer(): Promise<{ server: Server; url: string }> {
  return new Promise((resolve) => {
    const server = createServer((_, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(DEMO_HTML);
    });
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address() as { port: number };
      resolve({ server, url: `http://127.0.0.1:${addr.port}` });
    });
  });
}

export async function runDemo(opts: { report: boolean }): Promise<void> {
  const { server, url } = await startDemoServer();

  try {
    console.log('\n' + chalk.bold('wcag-a11y demo') + chalk.gray(' — scanning built-in page with intentional WCAG violations...') + '\n');

    const result = await crawl({ url, pages: ['/'] });
    const violations = result.pages.flatMap((p) => p.violations);

    const { criticalCount: c, seriousCount: s, moderateCount: m, minorCount: mn } = result;

    console.log(chalk.bold('Scan complete') + '  ' + chalk.gray('─'.repeat(55)));

    const counts = [
      c > 0 ? chalk.red(`${c} critical`) : '',
      s > 0 ? chalk.yellow(`${s} serious`) : '',
      m > 0 ? chalk.blue(`${m} moderate`) : '',
      mn > 0 ? chalk.gray(`${mn} minor`) : '',
    ].filter(Boolean).join(' · ');
    console.log(`\n  ${chalk.red('✖')}  ${chalk.cyan(url)}  ${counts}\n`);

    // Show every violation grouped by rule (same as real scan --terminal)
    const { groupViolations } = await import('./ai/group.js');
    const groups = groupViolations(violations, 'rule');
    for (const g of groups) {
      const color = IMPACT_COLOR[g.impact] ?? chalk.white;
      const countSuffix = g.count > 1 ? chalk.gray(` ×${g.count}`) : '';
      console.log(`  ${color(`[${g.impact.toUpperCase()}]`)}${countSuffix}  ${g.description}  ${chalk.gray(`WCAG ${g.wcag}`)}`);
      console.log(`  ${chalk.gray('→')} ${chalk.dim(g.selectors[0])}\n`);
    }

    console.log('\n' + chalk.gray('─'.repeat(60)));

    if (opts.report) {
      const fixes = generateFallbackFixes(violations, 'rule');
      generateMarkdownReport(result, fixes);
      console.log(chalk.gray(`  ${violations.length} violations · fix prompts for each — open a11y-report.md`));
    }

    console.log(chalk.gray('\nRun on your own project:') + '  ' + chalk.bold('npx wcag-a11y scan -u http://localhost:3000') + '\n');
  } finally {
    server.close();
  }
}
