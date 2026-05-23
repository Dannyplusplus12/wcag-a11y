import type { Rule } from '../types.js';

export const structureRules: Rule[] = [
  {
    id: 'heading-order',
    wcag: '1.3.1',
    level: 'A',
    impact: 'moderate',
    description: 'Heading levels must not be skipped (e.g. h1 → h3 skips h2)',
    check: () => {
      const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'));
      const violations: Array<{ selector: string; html: string }> = [];
      let prevLevel = 0;
      for (const h of headings) {
        const level = parseInt(h.tagName[1]);
        if (prevLevel > 0 && level > prevLevel + 1) {
          violations.push({
            selector: (h as HTMLElement).id ? `#${(h as HTMLElement).id}` : h.tagName.toLowerCase(),
            html: h.outerHTML.slice(0, 200),
          });
        }
        prevLevel = level;
      }
      return violations;
    },
  },
  {
    id: 'page-title',
    wcag: '2.4.2',
    level: 'A',
    impact: 'serious',
    description: 'Page must have a non-empty <title> element',
    check: () => {
      const title = document.querySelector('title');
      if (!title || !title.textContent?.trim()) {
        return [{ selector: 'head', html: '<title> missing or empty' }];
      }
      return [];
    },
  },
  {
    id: 'landmark-one-main',
    wcag: '2.4.1',
    level: 'A',
    impact: 'moderate',
    description: 'Page must have exactly one <main> landmark',
    check: () => {
      const mains = Array.from(document.querySelectorAll('main, [role="main"]'));
      if (mains.length === 0) return [{ selector: 'body', html: 'No <main> landmark found' }];
      if (mains.length > 1) return mains.slice(1).map((el) => ({ selector: el.tagName.toLowerCase(), html: el.outerHTML.slice(0, 200) }));
      return [];
    },
  },
  {
    id: 'list-structure',
    wcag: '1.3.1',
    level: 'A',
    impact: 'moderate',
    description: '<li> elements must be contained within <ul> or <ol>',
    check: () => {
      const items = Array.from(document.querySelectorAll('li'));
      return items
        .filter((li) => !li.closest('ul, ol'))
        .map((li) => ({
          selector: (li as HTMLElement).id ? `#${(li as HTMLElement).id}` : 'li',
          html: li.outerHTML.slice(0, 200),
        }));
    },
  },
  {
    id: 'region-landmark',
    wcag: '1.3.1',
    level: 'A',
    impact: 'moderate',
    description: 'Page sections must use appropriate landmark roles (header, nav, main, footer)',
    check: () => {
      const hasHeader = document.querySelector('header, [role="banner"]') !== null;
      const hasNav = document.querySelector('nav, [role="navigation"]') !== null;
      const hasMain = document.querySelector('main, [role="main"]') !== null;
      const violations: Array<{ selector: string; html: string }> = [];
      if (!hasHeader) violations.push({ selector: 'body', html: 'No <header> or role="banner" found' });
      if (!hasNav) violations.push({ selector: 'body', html: 'No <nav> or role="navigation" found' });
      if (!hasMain) violations.push({ selector: 'body', html: 'No <main> or role="main" found' });
      return violations;
    },
  },
];
