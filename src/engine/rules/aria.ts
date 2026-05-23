import type { Rule } from '../types.js';

export const ariaRules: Rule[] = [
  {
    id: 'aria-valid-role',
    wcag: '4.1.2',
    level: 'A',
    impact: 'critical',
    description: 'Elements must use valid ARIA roles',
    check: () => {
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
        .map((el) => ({
          selector: (el as HTMLElement).id ? `#${(el as HTMLElement).id}` : el.tagName.toLowerCase(),
          html: el.outerHTML.slice(0, 200),
        }));
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
      const els = Array.from(document.querySelectorAll('[aria-hidden="true"]'));
      return els
        .filter((el) => {
          const tabindex = el.getAttribute('tabindex');
          const isFocusableTag = ['a', 'button', 'input', 'select', 'textarea'].includes(el.tagName.toLowerCase());
          return (tabindex !== null && parseInt(tabindex) >= 0) || (isFocusableTag && tabindex === null);
        })
        .map((el) => ({
          selector: (el as HTMLElement).id ? `#${(el as HTMLElement).id}` : el.tagName.toLowerCase(),
          html: el.outerHTML.slice(0, 200),
        }));
    },
  },
  {
    id: 'button-name',
    wcag: '4.1.2',
    level: 'A',
    impact: 'critical',
    description: 'Buttons must have an accessible name',
    check: () => {
      const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
      return buttons
        .filter((el) => {
          const text = el.textContent?.trim() ?? '';
          const ariaLabel = el.getAttribute('aria-label')?.trim() ?? '';
          const ariaLabelledby = el.getAttribute('aria-labelledby');
          const labelledEl = ariaLabelledby ? document.getElementById(ariaLabelledby) : null;
          return !text && !ariaLabel && !labelledEl?.textContent?.trim();
        })
        .map((el) => ({
          selector: (el as HTMLElement).id ? `#${(el as HTMLElement).id}` : 'button',
          html: el.outerHTML.slice(0, 200),
        }));
    },
  },
];
