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
        .map((svg) => {
          const getCssPath = (el: Element): string => {
            if ((el as SVGElement & { id: string }).id) return '#' + (el as SVGElement & { id: string }).id;
            const parts: string[] = [];
            let node: Element | null = el;
            while (node && node.tagName !== 'BODY') {
              const parent: HTMLElement | null = node.parentElement;
              if (!parent) break;
              const tag = node.tagName.toLowerCase();
              const sibs = Array.from<Element>(parent.children).filter((c) => c.tagName === (node as Element).tagName);
              parts.unshift(sibs.length === 1 ? tag : tag + ':nth-of-type(' + (sibs.indexOf(node as Element) + 1) + ')');
              if ((parent as HTMLElement).id) { parts.unshift('#' + (parent as HTMLElement).id); break; }
              node = parent;
            }
            return parts.join(' > ') || el.tagName.toLowerCase();
          };
          return { selector: getCssPath(svg), html: svg.outerHTML.slice(0, 200) };
        });
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
        .map((obj) => {
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
          return { selector: getCssPath(obj), html: obj.outerHTML.slice(0, 200) };
        });
    },
  },
  {
    id: 'role-img-alt',
    wcag: '1.1.1',
    level: 'A',
    impact: 'serious',
    description: 'Elements with role="img" must have an accessible name',
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
      const els = Array.from(document.querySelectorAll('[role="img"]'));
      return els
        .filter((el) => {
          if (el.getAttribute('aria-hidden') === 'true') return false;
          const ariaLabel = el.getAttribute('aria-label')?.trim() ?? '';
          const ariaLabelledby = el.getAttribute('aria-labelledby');
          const labelledEl = ariaLabelledby ? document.getElementById(ariaLabelledby) : null;
          return !ariaLabel && !labelledEl?.textContent?.trim();
        })
        .map((el) => ({ selector: getCssPath(el), html: el.outerHTML.slice(0, 200) }));
    },
  },
  {
    id: 'image-redundant-alt',
    wcag: '1.1.1',
    level: 'A',
    impact: 'minor',
    description: 'Image alt text must not duplicate text that is already visible nearby',
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
      const images = Array.from(document.querySelectorAll('img[alt]'));
      return images
        .filter((img) => {
          const alt = (img.getAttribute('alt') ?? '').trim().toLowerCase();
          if (!alt) return false;
          const parent = img.parentElement;
          if (!parent) return false;
          // Get sibling/adjacent text, excluding the img alt itself
          const siblingText = Array.from(parent.childNodes)
            .filter((n) => n !== img && n.nodeType === Node.TEXT_NODE)
            .map((n) => n.textContent ?? '')
            .join(' ')
            .trim()
            .toLowerCase();
          const adjacentLabel = parent.querySelector('figcaption, caption');
          const captionText = (adjacentLabel?.textContent ?? '').trim().toLowerCase();
          return siblingText.includes(alt) || captionText.includes(alt);
        })
        .map((img) => ({
          selector: getCssPath(img),
          html: img.outerHTML.slice(0, 200),
        }));
    },
  },
];
