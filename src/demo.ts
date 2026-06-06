import { createServer } from 'http';
import type { Server } from 'http';
import chalk from 'chalk';
import { crawl } from './crawler.js';
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

    <!-- missing alt attribute -->
    <img src="hero.jpg" width="800" height="400">

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
        <button type="submit">Subscribe</button>
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

    // One sample per impact level
    const shown = new Set<string>();
    const samples: typeof violations = [];
    for (const impact of ['critical', 'serious', 'moderate', 'minor'] as const) {
      const v = violations.find((x) => x.impact === impact && !shown.has(x.ruleId));
      if (v) { samples.push(v); shown.add(v.ruleId); }
    }

    for (const v of samples) {
      const color = IMPACT_COLOR[v.impact] ?? chalk.white;
      console.log(`  ${color(`[${v.impact.toUpperCase()}]`)}  ${v.description}  ${chalk.gray(`WCAG ${v.wcag}`)}`);
      console.log(`  ${chalk.gray('→')} ${chalk.dim(v.selector)}\n`);
    }

    const remaining = violations.length - samples.length;
    if (remaining > 0) {
      console.log(chalk.gray(`  ... and ${remaining} more violation${remaining === 1 ? '' : 's'}`));
    }

    console.log('\n' + chalk.gray('─'.repeat(60)));

    if (opts.report) {
      generateMarkdownReport(result, []);
      console.log(chalk.gray(`  ${violations.length} violations · open a11y-report.md for the full breakdown`));
    }

    console.log(chalk.gray('\nRun on your own project:') + '  ' + chalk.bold('npx wcag-a11y scan -u http://localhost:3000') + '\n');
  } finally {
    server.close();
  }
}
