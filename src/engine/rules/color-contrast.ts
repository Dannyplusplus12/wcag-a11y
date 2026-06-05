import type { Rule } from '../types.js';

export const colorContrastRules: Rule[] = [
  {
    id: 'color-contrast-text',
    wcag: '1.4.3',
    level: 'AA',
    impact: 'serious',
    description: 'Text must have a contrast ratio of at least 4.5:1 against its background',
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

      const parseRgba = (raw: string): [number, number, number, number] | null => {
        const m = raw.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (!m) return null;
        return [+m[1], +m[2], +m[3], m[4] !== undefined ? parseFloat(m[4]) : 1];
      };

      const getOpaqueBg = (el: Element): [number, number, number] => {
        let node: Element | null = el;
        while (node) {
          const rgba = parseRgba(window.getComputedStyle(node).backgroundColor);
          if (rgba && rgba[3] > 0.01) return [rgba[0], rgba[1], rgba[2]];
          node = node.parentElement;
        }
        return [255, 255, 255];
      };

      const resolveBackground = (bgRaw: string, el: Element): [number, number, number] => {
        const bgRgba = parseRgba(bgRaw);
        if (!bgRgba || bgRgba[3] <= 0.01) return getOpaqueBg(el.parentElement ?? el);
        if (bgRgba[3] < 0.99) {
          const parent = getOpaqueBg(el.parentElement ?? el);
          const a = bgRgba[3];
          return [
            Math.round(bgRgba[0] * a + parent[0] * (1 - a)),
            Math.round(bgRgba[1] * a + parent[1] * (1 - a)),
            Math.round(bgRgba[2] * a + parent[2] * (1 - a)),
          ];
        }
        return [bgRgba[0], bgRgba[1], bgRgba[2]];
      };

      const elements = Array.from(document.querySelectorAll('p, span, li, td, th, h1, h2, h3, h4, h5, h6, a, label'));
      const violations: Array<{ selector: string; html: string }> = [];

      for (const el of elements) {
        if (!el.textContent?.trim()) continue;
        const style = window.getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        const fontWeight = style.fontWeight;
        const isLargeText = fontSize >= 24 || (fontSize >= 18.67 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
        if (isLargeText) continue;

        const fgRgba = parseRgba(style.color);
        if (!fgRgba) continue;
        const [bgR, bgG, bgB] = resolveBackground(style.backgroundColor, el);

        const toLinear = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
        const lum = (r: number, g: number, b: number) => 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

        const l1 = lum(fgRgba[0], fgRgba[1], fgRgba[2]);
        const l2 = lum(bgR, bgG, bgB);
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

        if (ratio < 4.5) {
          violations.push({ selector: getCssPath(el), html: el.outerHTML.slice(0, 200) });
        }
      }
      return violations;
    },
  },
  {
    id: 'color-contrast-large-text',
    wcag: '1.4.3',
    level: 'AA',
    impact: 'serious',
    description: 'Large text (18pt or 14pt bold) must have a contrast ratio of at least 3:1',
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

      const parseRgba = (raw: string): [number, number, number, number] | null => {
        const m = raw.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (!m) return null;
        return [+m[1], +m[2], +m[3], m[4] !== undefined ? parseFloat(m[4]) : 1];
      };

      const getOpaqueBg = (el: Element): [number, number, number] => {
        let node: Element | null = el;
        while (node) {
          const rgba = parseRgba(window.getComputedStyle(node).backgroundColor);
          if (rgba && rgba[3] > 0.01) return [rgba[0], rgba[1], rgba[2]];
          node = node.parentElement;
        }
        return [255, 255, 255];
      };

      const resolveBackground = (bgRaw: string, el: Element): [number, number, number] => {
        const bgRgba = parseRgba(bgRaw);
        if (!bgRgba || bgRgba[3] <= 0.01) return getOpaqueBg(el.parentElement ?? el);
        if (bgRgba[3] < 0.99) {
          const parent = getOpaqueBg(el.parentElement ?? el);
          const a = bgRgba[3];
          return [
            Math.round(bgRgba[0] * a + parent[0] * (1 - a)),
            Math.round(bgRgba[1] * a + parent[1] * (1 - a)),
            Math.round(bgRgba[2] * a + parent[2] * (1 - a)),
          ];
        }
        return [bgRgba[0], bgRgba[1], bgRgba[2]];
      };

      const elements = Array.from(document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6'));
      const violations: Array<{ selector: string; html: string }> = [];

      for (const el of elements) {
        if (!el.textContent?.trim()) continue;
        const style = window.getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        const fontWeight = style.fontWeight;
        const isLargeText = fontSize >= 24 || (fontSize >= 18.67 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
        if (!isLargeText) continue;

        const fgRgba = parseRgba(style.color);
        if (!fgRgba) continue;
        const [bgR, bgG, bgB] = resolveBackground(style.backgroundColor, el);

        const toLinear = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
        const lum = (r: number, g: number, b: number) => 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

        const l1 = lum(fgRgba[0], fgRgba[1], fgRgba[2]);
        const l2 = lum(bgR, bgG, bgB);
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

        if (ratio < 3) {
          violations.push({ selector: getCssPath(el), html: el.outerHTML.slice(0, 200) });
        }
      }
      return violations;
    },
  },
];
