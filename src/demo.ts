import { createServer } from 'http';
import type { Server } from 'http';
import { crawl } from './crawler.js';
import { createAIProvider } from './ai/index.js';
import { loadConfig } from './config.js';
import { printTerminalReport, printAIPrompts } from './reporter/terminal.js';
import { generateMarkdownReport } from './reporter/markdown.js';

const DEMO_HTML = `<!DOCTYPE html>
<html lang="">
<head>
  <meta charset="UTF-8">
  <title></title>
</head>
<body>

  <h1>Welcome to Acme Shop</h1>

  <!-- 1. img-alt: missing alt -->
  <img src="banner.jpg">

  <!-- 2. color-contrast: low contrast on solid background (fails 4.5:1) -->
  <p style="color:#aaa;background:#fff;font-size:14px;">
    Summer sale — up to 50% off selected items.
  </p>

  <!-- 3. color-contrast: rgba(0,0,0,0) transparent bg — walks up to dark parent -->
  <div style="background:#1a1a2e;padding:8px;">
    <p style="color:#888;background:rgba(0,0,0,0);font-size:14px;">
      Free shipping on orders over $50.
    </p>
  </div>

  <!-- 4. keyboard: div with click but no role/tabindex -->
  <div onclick="addToCart()">Add to Cart</div>

  <!-- 5. form: input with no label -->
  <form id="newsletter">
    <input type="email" placeholder="your@email.com">
    <button type="submit"></button>
  </form>

  <!-- 6. ARIA: invalid role -->
  <div role="widget" id="promo-banner">Special offer!</div>

  <!-- 7. Structure: heading skips h2 → h4 -->
  <h4>Featured Products</h4>

  <!-- 8. Link: non-descriptive text -->
  <a href="/sale">Click here</a>

  <!-- 9. Media: video without captions -->
  <video src="promo.mp4" controls></video>

  <!-- 10. ARIA: aria-hidden but focusable -->
  <button aria-hidden="true" tabindex="0">Hidden action</button>

  <!-- 11. Link: empty anchor -->
  <a href="/about"></a>

</body>
</html>`;

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

export async function runDemo(opts: { ai: boolean; report: boolean }): Promise<void> {
  const { server, url } = await startDemoServer();

  try {
    console.log('\nRunning demo scan against a built-in page with 11 intentional WCAG violations...\n');

    const result = await crawl({ url, pages: ['/'] });
    printTerminalReport(result);

    if (opts.ai && result.totalViolations > 0) {
      const config = loadConfig();
      const provider = createAIProvider(config);
      const violations = result.pages.flatMap((p) => p.violations);

      console.log(`\nGenerating AI fixes for ${violations.length} violations...`);
      const fixes = await provider.generateFixes(violations, 'rule', result.framework);
      printAIPrompts(fixes, { explain: true });

      if (opts.report) generateMarkdownReport(result, fixes);
    } else if (opts.report) {
      generateMarkdownReport(result, []);
    }
  } finally {
    server.close();
  }
}
