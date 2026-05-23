import type { Rule } from '../types.js';

export const keyboardRules: Rule[] = [
  {
    id: 'no-positive-tabindex',
    wcag: '2.4.3',
    level: 'A',
    impact: 'serious',
    description: 'tabindex values greater than 0 disrupt the natural tab order',
    check: () => {
      const els = Array.from(document.querySelectorAll('[tabindex]'));
      return els
        .filter((el) => parseInt(el.getAttribute('tabindex') ?? '0') > 0)
        .map((el) => ({
          selector: (el as HTMLElement).id ? `#${(el as HTMLElement).id}` : el.tagName.toLowerCase(),
          html: el.outerHTML.slice(0, 200),
        }));
    },
  },
  {
    id: 'interactive-not-focusable',
    wcag: '2.1.1',
    level: 'A',
    impact: 'critical',
    description: 'Non-semantic elements with click handlers must have a role and be keyboard focusable',
    check: () => {
      const nonInteractiveTags = ['div', 'span', 'li', 'td', 'p'];
      const results: Array<{ selector: string; html: string }> = [];
      for (const tag of nonInteractiveTags) {
        const els = Array.from(document.querySelectorAll(`${tag}[onclick]`));
        for (const el of els) {
          const hasRole = el.hasAttribute('role');
          const hasTabIndex = el.hasAttribute('tabindex');
          if (!hasRole || !hasTabIndex) {
            results.push({
              selector: (el as HTMLElement).id ? `#${(el as HTMLElement).id}` : tag,
              html: el.outerHTML.slice(0, 200),
            });
          }
        }
      }
      return results;
    },
  },
  {
    id: 'skip-link',
    wcag: '2.4.1',
    level: 'A',
    impact: 'moderate',
    description: 'Page should have a skip navigation link as the first focusable element',
    check: () => {
      const firstLink = document.querySelector('a[href]');
      if (!firstLink) return [{ selector: 'body', html: '<body> — no skip link found' }];
      const href = firstLink.getAttribute('href') ?? '';
      const text = firstLink.textContent?.toLowerCase() ?? '';
      const isSkipLink = href.startsWith('#') && (text.includes('skip') || text.includes('main') || text.includes('content'));
      if (!isSkipLink) return [{ selector: 'a:first-of-type', html: firstLink.outerHTML.slice(0, 200) }];
      return [];
    },
  },
  {
    id: 'focus-visible',
    wcag: '2.4.7',
    level: 'AA',
    impact: 'serious',
    description: 'Interactive elements must have a visible focus indicator',
    check: () => {
      const interactive = Array.from(document.querySelectorAll('a, button, input, select, textarea, [tabindex="0"]'));
      return interactive
        .filter((el) => {
          const style = window.getComputedStyle(el, ':focus');
          const outline = style.outline;
          const outlineWidth = parseFloat(style.outlineWidth);
          return outline === 'none' || outline === '0px none' || outlineWidth === 0;
        })
        .map((el) => ({
          selector: (el as HTMLElement).id ? `#${(el as HTMLElement).id}` : el.tagName.toLowerCase(),
          html: el.outerHTML.slice(0, 200),
        }));
    },
  },
];
