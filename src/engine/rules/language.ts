import type { Rule } from '../types.js';

export const languageRules: Rule[] = [
  {
    id: 'html-lang',
    wcag: '3.1.1',
    level: 'A',
    impact: 'serious',
    description: 'The <html> element must have a lang attribute',
    check: () => {
      const html = document.documentElement;
      if (!html.hasAttribute('lang') || !html.getAttribute('lang')?.trim()) {
        return [{ selector: 'html', html: html.outerHTML.slice(0, 100) }];
      }
      return [];
    },
  },
  {
    id: 'html-lang-valid',
    wcag: '3.1.1',
    level: 'A',
    impact: 'serious',
    description: 'The lang attribute must be a valid BCP 47 language tag',
    check: () => {
      const lang = document.documentElement.getAttribute('lang') ?? '';
      const valid = /^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/.test(lang);
      if (lang && !valid) {
        return [{ selector: 'html', html: `lang="${lang}" is not a valid BCP 47 tag` }];
      }
      return [];
    },
  },
];
