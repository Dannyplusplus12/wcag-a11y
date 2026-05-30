import type { Rule } from '../types.js';

export const keyboardRules: Rule[] = [
  {
    id: 'no-positive-tabindex',
    wcag: '2.4.3',
    level: 'A',
    impact: 'serious',
    description: 'tabindex values greater than 0 disrupt the natural tab order',
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
      const els = Array.from(document.querySelectorAll('[tabindex]'));
      return els
        .filter((el) => parseInt(el.getAttribute('tabindex') ?? '0') > 0)
        .map((el) => ({ selector: getCssPath(el), html: el.outerHTML.slice(0, 200) }));
    },
  },
  {
    id: 'interactive-not-focusable',
    wcag: '2.1.1',
    level: 'A',
    impact: 'critical',
    description: 'Non-semantic elements with click handlers must have a role and be keyboard focusable',
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
      const nonInteractiveTags = ['div', 'span', 'li', 'td', 'p'];
      const results: Array<{ selector: string; html: string }> = [];
      for (const tag of nonInteractiveTags) {
        const els = Array.from(document.querySelectorAll(`${tag}[onclick]`));
        for (const el of els) {
          const hasRole = el.hasAttribute('role');
          const hasTabIndex = el.hasAttribute('tabindex');
          if (!hasRole || !hasTabIndex) {
            results.push({ selector: getCssPath(el), html: el.outerHTML.slice(0, 200) });
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
      const interactive = Array.from(document.querySelectorAll('a, button, input, select, textarea, [tabindex="0"]'));
      return interactive
        .filter((el) => {
          const style = window.getComputedStyle(el, ':focus');
          const outline = style.outline;
          const outlineWidth = parseFloat(style.outlineWidth);
          return outline === 'none' || outline === '0px none' || outlineWidth === 0;
        })
        .map((el) => ({ selector: getCssPath(el), html: el.outerHTML.slice(0, 200) }));
    },
  },
  {
    id: 'scrollable-region-focusable',
    wcag: '2.1.1',
    level: 'A',
    impact: 'moderate',
    description: 'Scrollable regions must be accessible by keyboard (tabindex="0" or contain focusable child)',
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
      const nativelyFocusable = ['a', 'button', 'input', 'select', 'textarea'];
      const results: Array<{ selector: string; html: string }> = [];
      const allEls = Array.from(document.querySelectorAll('*'));
      for (const el of allEls) {
        const style = window.getComputedStyle(el);
        const overflow = style.overflow;
        const overflowX = style.overflowX;
        const overflowY = style.overflowY;
        const isScrollable = ['auto', 'scroll'].includes(overflow) || ['auto', 'scroll'].includes(overflowX) || ['auto', 'scroll'].includes(overflowY);
        if (!isScrollable) continue;
        const hasActualOverflow = el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
        if (!hasActualOverflow) continue;
        if (nativelyFocusable.includes(el.tagName.toLowerCase())) continue;
        if (el.hasAttribute('tabindex')) continue;
        const hasFocusableChild = el.querySelector('a[href], button, input, select, textarea, [tabindex="0"]') !== null;
        if (!hasFocusableChild) {
          results.push({ selector: getCssPath(el), html: el.outerHTML.slice(0, 200) });
        }
      }
      return results;
    },
  },
  {
    id: 'accesskey-unique',
    wcag: '4.1.1',
    level: 'A',
    impact: 'moderate',
    description: 'accesskey attribute values must be unique across the page',
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
      const els = Array.from(document.querySelectorAll('[accesskey]'));
      const seen = new Map<string, Element>();
      const dupes = new Set<Element>();
      for (const el of els) {
        const key = (el.getAttribute('accesskey') ?? '').toLowerCase();
        if (seen.has(key)) {
          dupes.add(seen.get(key) as Element);
          dupes.add(el);
        } else {
          seen.set(key, el);
        }
      }
      return Array.from(dupes).map((el) => ({ selector: getCssPath(el), html: el.outerHTML.slice(0, 200) }));
    },
  },
];
