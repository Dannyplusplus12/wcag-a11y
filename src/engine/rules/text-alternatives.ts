import type { Rule } from '../types.js';

export const textAlternativeRules: Rule[] = [
  {
    id: 'img-alt',
    wcag: '1.1.1',
    level: 'A',
    impact: 'critical',
    description: 'Images must have an alt attribute',
    check: () => {
      const images = Array.from(document.querySelectorAll('img'));
      return images
        .filter((img) => !img.hasAttribute('alt'))
        .map((img) => ({
          selector: img.id ? `#${img.id}` : `img[src="${img.getAttribute('src')}"]`,
          html: img.outerHTML.slice(0, 200),
        }));
    },
  },
  {
    id: 'input-image-alt',
    wcag: '1.1.1',
    level: 'A',
    impact: 'critical',
    description: '<input type="image"> must have an alt attribute',
    check: () => {
      const inputs = Array.from(document.querySelectorAll('input[type="image"]'));
      return inputs
        .filter((el) => !el.hasAttribute('alt'))
        .map((el) => ({
          selector: el.id ? `#${el.id}` : `input[type="image"]`,
          html: el.outerHTML.slice(0, 200),
        }));
    },
  },
  {
    id: 'svg-title',
    wcag: '1.1.1',
    level: 'A',
    impact: 'serious',
    description: 'Inline SVGs must have a <title> or aria-label for screen readers',
    check: () => {
      const svgs = Array.from(document.querySelectorAll('svg'));
      return svgs
        .filter((svg) => {
          const hasTitle = svg.querySelector('title') !== null;
          const hasAriaLabel = svg.hasAttribute('aria-label') || svg.hasAttribute('aria-labelledby');
          const isDecorative = svg.getAttribute('aria-hidden') === 'true';
          return !hasTitle && !hasAriaLabel && !isDecorative;
        })
        .map((svg) => ({
          selector: svg.id ? `#${svg.id}` : 'svg',
          html: svg.outerHTML.slice(0, 200),
        }));
    },
  },
  {
    id: 'object-alt',
    wcag: '1.1.1',
    level: 'A',
    impact: 'serious',
    description: '<object> elements must have fallback text content',
    check: () => {
      const objects = Array.from(document.querySelectorAll('object'));
      return objects
        .filter((obj) => !obj.textContent?.trim())
        .map((obj) => ({
          selector: obj.id ? `#${obj.id}` : 'object',
          html: obj.outerHTML.slice(0, 200),
        }));
    },
  },
];
