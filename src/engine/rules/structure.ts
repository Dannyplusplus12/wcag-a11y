import type { Rule } from '../types.js';

export const structureRules: Rule[] = [
  {
    id: 'heading-order',
    wcag: '1.3.1',
    level: 'A',
    impact: 'moderate',
    description: 'Heading levels must not be skipped (e.g. h1 → h3 skips h2)',
    check: () => {
      const getCssPath = (el: Element): string => {
        if ((el as HTMLElement).id) return '#' + (el as HTMLElement).id;
        const parts: string[] = [];
        let node: Element | null = el;
        while (node && node.tagName !== 'BODY') {
          const parent: HTMLElement | null = node.parentElement;
          if (!parent) break;
          const tag = node.tagName.toLowerCase();
          const sibs = Array.from<Element>(parent.children).filter((c) => c.tagName === (node as Element).tagName);
          parts.unshift(sibs.length === 1 ? tag : tag + ':nth-of-type(' + (sibs.indexOf(node as Element) + 1) + ')');
          if (parent.id) { parts.unshift('#' + parent.id); break; }
          node = parent;
        }
        return parts.join(' > ') || el.tagName.toLowerCase();
      };
      const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'));
      const violations: Array<{ selector: string; html: string }> = [];
      let prevLevel = 0;
      for (const h of headings) {
        const level = parseInt(h.tagName[1]);
        if (prevLevel > 0 && level > prevLevel + 1) {
          violations.push({ selector: getCssPath(h), html: h.outerHTML.slice(0, 200) });
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
      const getCssPath = (el: Element): string => {
        if ((el as HTMLElement).id) return '#' + (el as HTMLElement).id;
        const parts: string[] = [];
        let node: Element | null = el;
        while (node && node.tagName !== 'BODY') {
          const parent: HTMLElement | null = node.parentElement;
          if (!parent) break;
          const tag = node.tagName.toLowerCase();
          const sibs = Array.from<Element>(parent.children).filter((c) => c.tagName === (node as Element).tagName);
          parts.unshift(sibs.length === 1 ? tag : tag + ':nth-of-type(' + (sibs.indexOf(node as Element) + 1) + ')');
          if (parent.id) { parts.unshift('#' + parent.id); break; }
          node = parent;
        }
        return parts.join(' > ') || el.tagName.toLowerCase();
      };
      const items = Array.from(document.querySelectorAll('li'));
      return items
        .filter((li) => !li.closest('ul, ol'))
        .map((li) => ({ selector: getCssPath(li), html: li.outerHTML.slice(0, 200) }));
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
  {
    id: 'duplicate-id',
    wcag: '4.1.1',
    level: 'A',
    impact: 'critical',
    description: 'IDs must be unique — duplicate IDs break ARIA label associations',
    check: () => {
      const getCssPath = (el: Element): string => {
        if ((el as HTMLElement).id) return '#' + (el as HTMLElement).id;
        const parts: string[] = [];
        let node: Element | null = el;
        while (node && node.tagName !== 'BODY') {
          const parent: HTMLElement | null = node.parentElement;
          if (!parent) break;
          const tag = node.tagName.toLowerCase();
          const sibs = Array.from<Element>(parent.children).filter((c) => c.tagName === (node as Element).tagName);
          parts.unshift(sibs.length === 1 ? tag : tag + ':nth-of-type(' + (sibs.indexOf(node as Element) + 1) + ')');
          if (parent.id) { parts.unshift('#' + parent.id); break; }
          node = parent;
        }
        return parts.join(' > ') || el.tagName.toLowerCase();
      };
      const allEls = Array.from(document.querySelectorAll('[id]'));
      const seen = new Set<string>();
      const dupes = new Set<string>();
      for (const el of allEls) {
        const id = el.getAttribute('id') ?? '';
        if (id && seen.has(id)) dupes.add(id);
        else if (id) seen.add(id);
      }
      if (dupes.size === 0) return [];
      const results: Array<{ selector: string; html: string }> = [];
      for (const id of dupes) {
        const matches = Array.from(document.querySelectorAll(`[id="${id}"]`));
        for (const el of matches) {
          results.push({ selector: getCssPath(el), html: el.outerHTML.slice(0, 200) });
        }
      }
      return results;
    },
  },
  {
    id: 'frame-title',
    wcag: '2.4.1',
    level: 'A',
    impact: 'serious',
    description: '<iframe> elements must have a non-empty title attribute',
    check: () => {
      const getCssPath = (el: Element): string => {
        if ((el as HTMLElement).id) return '#' + (el as HTMLElement).id;
        const parts: string[] = [];
        let node: Element | null = el;
        while (node && node.tagName !== 'BODY') {
          const parent: HTMLElement | null = node.parentElement;
          if (!parent) break;
          const tag = node.tagName.toLowerCase();
          const sibs = Array.from<Element>(parent.children).filter((c) => c.tagName === (node as Element).tagName);
          parts.unshift(sibs.length === 1 ? tag : tag + ':nth-of-type(' + (sibs.indexOf(node as Element) + 1) + ')');
          if (parent.id) { parts.unshift('#' + parent.id); break; }
          node = parent;
        }
        return parts.join(' > ') || el.tagName.toLowerCase();
      };
      const frames = Array.from(document.querySelectorAll('iframe, frame'));
      return frames
        .filter((el) => {
          const title = el.getAttribute('title')?.trim() ?? '';
          const ariaLabel = el.getAttribute('aria-label')?.trim() ?? '';
          return !title && !ariaLabel;
        })
        .map((el) => ({ selector: getCssPath(el), html: el.outerHTML.slice(0, 200) }));
    },
  },
  {
    id: 'meta-viewport',
    wcag: '1.4.4',
    level: 'AA',
    impact: 'critical',
    description: 'Viewport meta must not prevent users from zooming (user-scalable=no or maximum-scale < 2)',
    check: () => {
      const metas = Array.from(document.querySelectorAll('meta[name="viewport"]'));
      return metas
        .filter((meta) => {
          const content = meta.getAttribute('content') ?? '';
          const disablesZoom = /user-scalable\s*=\s*no/i.test(content);
          const maxScaleMatch = content.match(/maximum-scale\s*=\s*([\d.]+)/i);
          const maxScale = maxScaleMatch ? parseFloat(maxScaleMatch[1]) : null;
          return disablesZoom || (maxScale !== null && maxScale < 2);
        })
        .map((meta) => ({ selector: 'meta[name="viewport"]', html: meta.outerHTML }));
    },
  },
  {
    id: 'marquee',
    wcag: '2.2.2',
    level: 'A',
    impact: 'serious',
    description: '<marquee> elements cause accessibility issues — content moves automatically with no pause control',
    check: () => {
      const getCssPath = (el: Element): string => {
        if ((el as HTMLElement).id) return '#' + (el as HTMLElement).id;
        const parts: string[] = [];
        let node: Element | null = el;
        while (node && node.tagName !== 'BODY') {
          const parent: HTMLElement | null = node.parentElement;
          if (!parent) break;
          const tag = node.tagName.toLowerCase();
          const sibs = Array.from<Element>(parent.children).filter((c) => c.tagName === (node as Element).tagName);
          parts.unshift(sibs.length === 1 ? tag : tag + ':nth-of-type(' + (sibs.indexOf(node as Element) + 1) + ')');
          if (parent.id) { parts.unshift('#' + parent.id); break; }
          node = parent;
        }
        return parts.join(' > ') || el.tagName.toLowerCase();
      };
      return Array.from(document.querySelectorAll('marquee'))
        .map((el) => ({ selector: getCssPath(el), html: el.outerHTML.slice(0, 200) }));
    },
  },
  {
    id: 'p-as-heading',
    wcag: '1.3.1',
    level: 'A',
    impact: 'moderate',
    description: '<p> elements styled to look like headings should use an actual heading element',
    check: () => {
      const getCssPath = (el: Element): string => {
        if ((el as HTMLElement).id) return '#' + (el as HTMLElement).id;
        const parts: string[] = [];
        let node: Element | null = el;
        while (node && node.tagName !== 'BODY') {
          const parent: HTMLElement | null = node.parentElement;
          if (!parent) break;
          const tag = node.tagName.toLowerCase();
          const sibs = Array.from<Element>(parent.children).filter((c) => c.tagName === (node as Element).tagName);
          parts.unshift(sibs.length === 1 ? tag : tag + ':nth-of-type(' + (sibs.indexOf(node as Element) + 1) + ')');
          if (parent.id) { parts.unshift('#' + parent.id); break; }
          node = parent;
        }
        return parts.join(' > ') || el.tagName.toLowerCase();
      };
      const paras = Array.from(document.querySelectorAll('p'));
      return paras
        .filter((p) => {
          if (!p.textContent?.trim()) return false;
          const style = window.getComputedStyle(p);
          const fontSize = parseFloat(style.fontSize);
          const fontWeight = parseInt(style.fontWeight) || 400;
          // Flag <p> that is visually heading-sized (>= 18px) and bold, or >= 24px
          return (fontSize >= 24) || (fontSize >= 18 && fontWeight >= 700);
        })
        .map((p) => ({ selector: getCssPath(p), html: p.outerHTML.slice(0, 200) }));
    },
  },
];
