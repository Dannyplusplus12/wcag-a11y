import type { Rule } from '../types.js';

export const formRules: Rule[] = [
  {
    id: 'label-missing',
    wcag: '1.3.1',
    level: 'A',
    impact: 'critical',
    description: 'Form inputs must have an associated label',
    check: () => {
      const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="button"]):not([type="submit"]):not([type="reset"]), textarea, select'));
      return inputs
        .filter((el) => {
          const id = el.getAttribute('id');
          const hasLabel = id && document.querySelector(`label[for="${id}"]`);
          const hasAriaLabel = el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby');
          const isWrapped = el.closest('label') !== null;
          return !hasLabel && !hasAriaLabel && !isWrapped;
        })
        .map((el) => ({
          selector: (el as HTMLElement).id ? `#${(el as HTMLElement).id}` : el.tagName.toLowerCase(),
          html: el.outerHTML.slice(0, 200),
        }));
    },
  },
  {
    id: 'label-empty',
    wcag: '1.3.1',
    level: 'A',
    impact: 'serious',
    description: '<label> elements must have text content',
    check: () => {
      const labels = Array.from(document.querySelectorAll('label'));
      return labels
        .filter((l) => !l.textContent?.trim())
        .map((l) => ({
          selector: (l as HTMLElement).id ? `#${(l as HTMLElement).id}` : 'label',
          html: l.outerHTML.slice(0, 200),
        }));
    },
  },
  {
    id: 'error-identification',
    wcag: '3.3.1',
    level: 'A',
    impact: 'serious',
    description: 'Inputs marked as invalid must have an error message linked via aria-describedby',
    check: () => {
      const invalid = Array.from(document.querySelectorAll('[aria-invalid="true"]'));
      return invalid
        .filter((el) => {
          const describedBy = el.getAttribute('aria-describedby');
          if (!describedBy) return true;
          const errorEl = document.getElementById(describedBy);
          return !errorEl || !errorEl.textContent?.trim();
        })
        .map((el) => ({
          selector: (el as HTMLElement).id ? `#${(el as HTMLElement).id}` : el.tagName.toLowerCase(),
          html: el.outerHTML.slice(0, 200),
        }));
    },
  },
  {
    id: 'autocomplete',
    wcag: '1.3.5',
    level: 'AA',
    impact: 'moderate',
    description: 'Common form fields (name, email, phone) should have an autocomplete attribute',
    check: () => {
      const nameFields = Array.from(document.querySelectorAll('input[type="text"][id*="name"], input[type="text"][name*="name"], input[type="email"], input[type="tel"]'));
      return nameFields
        .filter((el) => !el.hasAttribute('autocomplete'))
        .map((el) => ({
          selector: (el as HTMLElement).id ? `#${(el as HTMLElement).id}` : el.tagName.toLowerCase(),
          html: el.outerHTML.slice(0, 200),
        }));
    },
  },
];
