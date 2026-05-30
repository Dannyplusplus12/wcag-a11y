import type { Rule } from '../types.js';

export const tableRules: Rule[] = [
  {
    id: 'table-headers',
    wcag: '1.3.1',
    level: 'A',
    impact: 'serious',
    description: 'Data tables must use <th> or role="columnheader"/"rowheader" to identify headers',
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
      const tables = Array.from(document.querySelectorAll('table'));
      return tables
        .filter((table) => {
          const role = table.getAttribute('role');
          if (role === 'presentation' || role === 'none') return false;
          const hasDataCells = table.querySelector('td') !== null;
          if (!hasDataCells) return false;
          const hasHeaders =
            table.querySelector('th') !== null ||
            table.querySelector('[scope]') !== null ||
            table.querySelector('[role="columnheader"], [role="rowheader"]') !== null;
          return !hasHeaders;
        })
        .map((table) => ({ selector: getCssPath(table), html: table.outerHTML.slice(0, 200) }));
    },
  },
  {
    id: 'table-scope-valid',
    wcag: '1.3.1',
    level: 'A',
    impact: 'moderate',
    description: 'The scope attribute on <th> must have a valid value: col, row, colgroup, or rowgroup',
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
      const validScopes = new Set(['col', 'row', 'colgroup', 'rowgroup']);
      const ths = Array.from(document.querySelectorAll('th[scope]'));
      return ths
        .filter((th) => !validScopes.has(th.getAttribute('scope') ?? ''))
        .map((th) => ({ selector: getCssPath(th), html: th.outerHTML.slice(0, 200) }));
    },
  },
  {
    id: 'td-headers-attr',
    wcag: '1.3.1',
    level: 'A',
    impact: 'serious',
    description: 'Table cells using the headers attribute must reference valid, non-empty <th> IDs',
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
      const cells = Array.from(document.querySelectorAll('td[headers], th[headers]'));
      return cells
        .filter((cell) => {
          const ids = (cell.getAttribute('headers') ?? '').trim().split(/\s+/).filter(Boolean);
          if (ids.length === 0) return false;
          return ids.some((id) => {
            const target = document.getElementById(id);
            return !target || target.tagName.toLowerCase() !== 'th' || !target.textContent?.trim();
          });
        })
        .map((cell) => ({ selector: getCssPath(cell), html: cell.outerHTML.slice(0, 200) }));
    },
  },
  {
    id: 'table-duplicate-name',
    wcag: '1.3.1',
    level: 'A',
    impact: 'moderate',
    description: 'Table summary and caption must not be identical',
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
      const tables = Array.from(document.querySelectorAll('table[summary]'));
      return tables
        .filter((table) => {
          const summary = (table.getAttribute('summary') ?? '').trim().toLowerCase();
          const caption = table.querySelector('caption');
          const captionText = (caption?.textContent ?? '').trim().toLowerCase();
          return summary && captionText && summary === captionText;
        })
        .map((table) => ({ selector: getCssPath(table), html: table.outerHTML.slice(0, 200) }));
    },
  },
];
