import type { Rule } from '../types.js';

export const ariaRules: Rule[] = [
  {
    id: 'aria-valid-role',
    wcag: '4.1.2',
    level: 'A',
    impact: 'critical',
    description: 'Elements must use valid ARIA roles',
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
      const validRoles = new Set([
        'alert','alertdialog','application','article','banner','button','cell','checkbox',
        'columnheader','combobox','complementary','contentinfo','definition','dialog',
        'directory','document','feed','figure','form','grid','gridcell','group','heading',
        'img','link','list','listbox','listitem','log','main','marquee','math','menu',
        'menubar','menuitem','menuitemcheckbox','menuitemradio','navigation','none',
        'note','option','presentation','progressbar','radio','radiogroup','region','row',
        'rowgroup','rowheader','scrollbar','search','searchbox','separator','slider',
        'spinbutton','status','switch','tab','table','tablist','tabpanel','term',
        'textbox','timer','toolbar','tooltip','tree','treegrid','treeitem',
      ]);
      const els = Array.from(document.querySelectorAll('[role]'));
      return els
        .filter((el) => !validRoles.has(el.getAttribute('role') ?? ''))
        .map((el) => ({ selector: getCssPath(el), html: el.outerHTML.slice(0, 200) }));
    },
  },
  {
    id: 'aria-required-attr',
    wcag: '4.1.2',
    level: 'A',
    impact: 'critical',
    description: 'ARIA roles must include all required attributes',
    check: () => {
      const roleRequiredAttrs: Record<string, string[]> = {
        checkbox: ['aria-checked'],
        combobox: ['aria-expanded'],
        option: ['aria-selected'],
        radio: ['aria-checked'],
        scrollbar: ['aria-controls', 'aria-valuenow'],
        slider: ['aria-valuenow'],
        spinbutton: ['aria-valuenow'],
        switch: ['aria-checked'],
      };
      const results: Array<{ selector: string; html: string }> = [];
      for (const [role, required] of Object.entries(roleRequiredAttrs)) {
        const els = Array.from(document.querySelectorAll(`[role="${role}"]`));
        for (const el of els) {
          const missing = required.filter((attr) => !el.hasAttribute(attr));
          if (missing.length > 0) {
            results.push({
              selector: (el as HTMLElement).id ? `#${(el as HTMLElement).id}` : `[role="${role}"]`,
              html: el.outerHTML.slice(0, 200),
            });
          }
        }
      }
      return results;
    },
  },
  {
    id: 'aria-hidden-focus',
    wcag: '4.1.2',
    level: 'A',
    impact: 'serious',
    description: 'Elements with aria-hidden="true" must not be keyboard focusable',
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
      const els = Array.from(document.querySelectorAll('[aria-hidden="true"]'));
      return els
        .filter((el) => {
          const tabindex = el.getAttribute('tabindex');
          const isFocusableTag = ['a', 'button', 'input', 'select', 'textarea'].includes(el.tagName.toLowerCase());
          return (tabindex !== null && parseInt(tabindex) >= 0) || (isFocusableTag && tabindex === null);
        })
        .map((el) => ({ selector: getCssPath(el), html: el.outerHTML.slice(0, 200) }));
    },
  },
  {
    id: 'button-name',
    wcag: '4.1.2',
    level: 'A',
    impact: 'critical',
    description: 'Buttons must have an accessible name',
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
      const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
      return buttons
        .filter((el) => {
          const text = el.textContent?.trim() ?? '';
          const ariaLabel = el.getAttribute('aria-label')?.trim() ?? '';
          const ariaLabelledby = el.getAttribute('aria-labelledby');
          const labelledEl = ariaLabelledby ? document.getElementById(ariaLabelledby) : null;
          return !text && !ariaLabel && !labelledEl?.textContent?.trim();
        })
        .map((el) => ({ selector: getCssPath(el), html: el.outerHTML.slice(0, 200) }));
    },
  },
  {
    id: 'aria-required-children',
    wcag: '1.3.1',
    level: 'A',
    impact: 'critical',
    description: 'Elements with ARIA owner roles must contain the required child roles',
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
      const required: Record<string, string[]> = {
        listbox: ['option'],
        radiogroup: ['radio'],
        grid: ['row', 'rowgroup'],
        menu: ['menuitem', 'menuitemcheckbox', 'menuitemradio'],
        menubar: ['menuitem', 'menuitemcheckbox', 'menuitemradio'],
        tablist: ['tab'],
        tree: ['treeitem'],
        treegrid: ['row'],
      };
      const results: Array<{ selector: string; html: string }> = [];
      for (const [role, children] of Object.entries(required)) {
        const els = Array.from(document.querySelectorAll(`[role="${role}"]`));
        for (const el of els) {
          if (el.getAttribute('aria-busy') === 'true') continue;
          const hasChild = children.some((childRole) => el.querySelector(`[role="${childRole}"]`) !== null);
          if (!hasChild) {
            results.push({ selector: getCssPath(el), html: el.outerHTML.slice(0, 200) });
          }
        }
      }
      return results;
    },
  },
  {
    id: 'aria-required-parent',
    wcag: '1.3.1',
    level: 'A',
    impact: 'critical',
    description: 'ARIA child roles must be contained in a required parent role',
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
      const parentMap: Record<string, string[]> = {
        option: ['listbox', 'combobox'],
        tab: ['tablist'],
        treeitem: ['tree', 'group'],
        menuitem: ['menu', 'menubar'],
        menuitemcheckbox: ['menu', 'menubar'],
        menuitemradio: ['menu', 'menubar'],
        gridcell: ['row'],
        row: ['grid', 'rowgroup', 'treegrid'],
        columnheader: ['row'],
        rowheader: ['row'],
      };
      const results: Array<{ selector: string; html: string }> = [];
      for (const [role, parents] of Object.entries(parentMap)) {
        const els = Array.from(document.querySelectorAll(`[role="${role}"]`));
        for (const el of els) {
          const hasParent = parents.some((parentRole) => el.closest(`[role="${parentRole}"]`) !== null);
          if (!hasParent) {
            results.push({ selector: getCssPath(el), html: el.outerHTML.slice(0, 200) });
          }
        }
      }
      return results;
    },
  },
  {
    id: 'aria-prohibited-attr',
    wcag: '4.1.2',
    level: 'A',
    impact: 'moderate',
    description: 'Elements with role="presentation" or role="none" must not carry ARIA semantics',
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
      const prohibited = ['aria-label', 'aria-labelledby', 'aria-describedby', 'aria-checked', 'aria-selected', 'aria-expanded', 'aria-required'];
      const els = Array.from(document.querySelectorAll('[role="presentation"],[role="none"]'));
      return els
        .filter((el) => prohibited.some((attr) => el.hasAttribute(attr)))
        .map((el) => ({ selector: getCssPath(el), html: el.outerHTML.slice(0, 200) }));
    },
  },
];
