import { createServer } from 'http';
import type { Server } from 'http';
import chalk from 'chalk';
import { crawl } from './crawler.js';
import { generateFallbackFixes } from './ai/base.js';
import { generateMarkdownReport } from './reporter/markdown.js';

const DEMO_HTML = `<!DOCTYPE html>
<html lang="">
<head>
  <meta charset="UTF-8">
  <title></title>
</head>
<body>

  <h1>Welcome to Acme Shop</h1>

  <!-- img-alt: missing alt -->
  <img src="banner.jpg">

  <!-- color-contrast: low contrast on solid background (fails 4.5:1) -->
  <p style="color:#aaa;background:#fff;font-size:14px;">
    Summer sale — up to 50% off selected items.
  </p>

  <!-- color-contrast: rgba transparent bg — walks up to dark parent -->
  <div style="background:#1a1a2e;padding:8px;">
    <p style="color:#888;background:rgba(0,0,0,0);font-size:14px;">
      Free shipping on orders over $50.
    </p>
  </div>

  <!-- keyboard: div with click but no role/tabindex -->
  <div onclick="addToCart()">Add to Cart</div>

  <!-- form: input with no label, submit button with no name -->
  <form id="newsletter">
    <input type="email" placeholder="your@email.com">
    <button type="submit"></button>
  </form>

  <!-- ARIA: invalid role -->
  <div role="widget" id="promo-banner">Special offer!</div>

  <!-- Structure: heading skips h2 → h4 -->
  <h4>Featured Products</h4>

  <!-- Link: non-descriptive text -->
  <a href="/sale">Click here</a>

  <!-- Media: video without captions -->
  <video src="promo.mp4" controls></video>

  <!-- ARIA: aria-hidden but focusable -->
  <button aria-hidden="true" tabindex="0">Hidden action</button>

  <!-- Link: empty anchor -->
  <a href="/about"></a>

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

    // Show one sample per impact level (up to 4 total)
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

    const fixes = generateFallbackFixes(violations, 'rule');

    if (opts.report) {
      generateMarkdownReport(result, fixes);
      console.log(chalk.gray(`  ${violations.length} violations · fix prompts included`));
    }

    console.log(chalk.gray('\nRun on your own project:') + '  ' + chalk.bold('npx wcag-a11y scan -u http://localhost:3000') + '\n');
  } finally {
    server.close();
  }
}
