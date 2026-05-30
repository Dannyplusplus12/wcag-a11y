import type { Rule } from '../types.js';

export const mediaRules: Rule[] = [
  {
    id: 'video-captions',
    wcag: '1.2.2',
    level: 'A',
    impact: 'critical',
    description: '<video> elements must have a caption track',
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
      const videos = Array.from(document.querySelectorAll('video'));
      return videos
        .filter((v) => !v.querySelector('track[kind="captions"], track[kind="subtitles"]'))
        .map((v) => ({ selector: getCssPath(v), html: v.outerHTML.slice(0, 200) }));
    },
  },
  {
    id: 'audio-description',
    wcag: '1.2.3',
    level: 'A',
    impact: 'serious',
    description: '<video> elements should have an audio description track',
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
      const videos = Array.from(document.querySelectorAll('video'));
      return videos
        .filter((v) => !v.querySelector('track[kind="descriptions"]'))
        .map((v) => ({ selector: getCssPath(v), html: v.outerHTML.slice(0, 200) }));
    },
  },
  {
    id: 'audio-transcript',
    wcag: '1.2.1',
    level: 'A',
    impact: 'serious',
    description: '<audio> elements should have a linked transcript',
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
      const audios = Array.from(document.querySelectorAll('audio'));
      return audios
        .filter((a) => {
          const describedBy = a.getAttribute('aria-describedby');
          return !describedBy || !document.getElementById(describedBy);
        })
        .map((a) => ({ selector: getCssPath(a), html: a.outerHTML.slice(0, 200) }));
    },
  },
];
