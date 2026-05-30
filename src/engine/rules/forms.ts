import type { Rule } from '../types.js';

export const formRules: Rule[] = [
  {
    id: 'label-missing',
    wcag: '1.3.1',
    level: 'A',
    impact: 'critical',
    description: 'Form inputs must have an associated label',
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
      const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="button"]):not([type="submit"]):not([type="reset"]), textarea, select'));
      return inputs
        .filter((el) => {
          const id = el.getAttribute('id');
          const hasLabel = id && document.querySelector(`label[for="${id}"]`);
          const hasAriaLabel = el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby');
          const isWrapped = el.closest('label') !== null;
          return !hasLabel && !hasAriaLabel && !isWrapped;
        })
        .map((el) => ({ selector: getCssPath(el), html: el.outerHTML.slice(0, 200) }));
    },
  },
  {
    id: 'label-empty',
    wcag: '1.3.1',
    level: 'A',
    impact: 'serious',
    description: '<label> elements must have text content',
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
      const labels = Array.from(document.querySelectorAll('label'));
      return labels
        .filter((l) => !l.textContent?.trim())
        .map((l) => ({ selector: getCssPath(l), html: l.outerHTML.slice(0, 200) }));
    },
  },
  {
    id: 'error-identification',
    wcag: '3.3.1',
    level: 'A',
    impact: 'serious',
    description: 'Inputs marked as invalid must have an error message linked via aria-describedby',
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
      const invalid = Array.from(document.querySelectorAll('[aria-invalid="true"]'));
      return invalid
        .filter((el) => {
          const describedBy = el.getAttribute('aria-describedby');
          if (!describedBy) return true;
          const errorEl = document.getElementById(describedBy);
          return !errorEl || !errorEl.textContent?.trim();
        })
        .map((el) => ({ selector: getCssPath(el), html: el.outerHTML.slice(0, 200) }));
    },
  },
  {
    id: 'autocomplete',
    wcag: '1.3.5',
    level: 'AA',
    impact: 'moderate',
    description: 'Common form fields (name, email, phone) should have an autocomplete attribute',
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
      const nameFields = Array.from(document.querySelectorAll('input[type="text"][id*="name"], input[type="text"][name*="name"], input[type="email"], input[type="tel"]'));
      return nameFields
        .filter((el) => !el.hasAttribute('autocomplete'))
        .map((el) => ({ selector: getCssPath(el), html: el.outerHTML.slice(0, 200) }));
    },
  },
  {
    id: 'input-button-name',
    wcag: '4.1.2',
    level: 'A',
    impact: 'critical',
    description: 'Input buttons must have discernible text via value or aria-label',
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
      const inputs = Array.from(document.querySelectorAll('input[type="button"], input[type="submit"], input[type="reset"]'));
      return inputs
        .filter((el) => {
          const value = el.getAttribute('value')?.trim() ?? '';
          const ariaLabel = el.getAttribute('aria-label')?.trim() ?? '';
          const ariaLabelledby = el.getAttribute('aria-labelledby');
          return !value && !ariaLabel && !ariaLabelledby;
        })
        .map((el) => ({ selector: getCssPath(el), html: el.outerHTML.slice(0, 200) }));
    },
  },
  {
    id: 'fieldset-legend',
    wcag: '1.3.1',
    level: 'A',
    impact: 'moderate',
    description: '<fieldset> elements must have a <legend> with non-empty text',
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
      const fieldsets = Array.from(document.querySelectorAll('fieldset'));
      return fieldsets
        .filter((fs) => {
          const legend = fs.querySelector('legend');
          const ariaLabel = fs.getAttribute('aria-label')?.trim() ?? '';
          const ariaLabelledby = fs.getAttribute('aria-labelledby');
          return !ariaLabel && !ariaLabelledby && (!legend || !legend.textContent?.trim());
        })
        .map((fs) => ({ selector: getCssPath(fs), html: fs.outerHTML.slice(0, 200) }));
    },
  },
  {
    id: 'form-field-required-label',
    wcag: '3.3.2',
    level: 'A',
    impact: 'moderate',
    description: 'Required form fields should expose their required state via aria-required',
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
      const requiredInputs = Array.from(document.querySelectorAll('input[required], textarea[required], select[required]'));
      return requiredInputs
        .filter((el) => !el.hasAttribute('aria-required'))
        .map((el) => ({ selector: getCssPath(el), html: el.outerHTML.slice(0, 200) }));
    },
  },
];
