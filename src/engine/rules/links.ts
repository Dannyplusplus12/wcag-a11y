import type { Rule } from '../types.js';

export const linkRules: Rule[] = [
  {
    id: 'link-name',
    wcag: '2.4.4',
    level: 'A',
    impact: 'serious',
    description: 'Links must have descriptive text that explains their destination or purpose',
    check: () => {
      const meaningless = new Set(['click here','here','read more','more','learn more','this','link','go','continue','download','click','tap']);
      const links = Array.from(document.querySelectorAll('a[href]'));
      return links
        .filter((a) => {
          const text = (a.textContent ?? '').trim().toLowerCase();
          return meaningless.has(text);
        })
        .map((a) => ({
          selector: (a as HTMLElement).id ? `#${(a as HTMLElement).id}` : 'a',
          html: a.outerHTML.slice(0, 200),
        }));
    },
  },
  {
    id: 'link-empty',
    wcag: '2.4.4',
    level: 'A',
    impact: 'critical',
    description: 'Links must have non-empty accessible names',
    check: () => {
      const links = Array.from(document.querySelectorAll('a[href]'));
      return links
        .filter((a) => {
          const text = a.textContent?.trim() ?? '';
          const ariaLabel = a.getAttribute('aria-label')?.trim() ?? '';
          const ariaLabelledby = a.getAttribute('aria-labelledby');
          const img = a.querySelector('img[alt]');
          return !text && !ariaLabel && !ariaLabelledby && !img;
        })
        .map((a) => ({
          selector: (a as HTMLElement).id ? `#${(a as HTMLElement).id}` : 'a',
          html: a.outerHTML.slice(0, 200),
        }));
    },
  },
];
