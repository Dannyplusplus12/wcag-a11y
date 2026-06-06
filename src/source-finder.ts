import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

export const SOURCE_EXTS = new Set(['.jsx', '.tsx', '.js', '.ts', '.vue', '.svelte', '.html']);
export const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', '.git', '.next', '.nuxt', 'coverage', 'public']);

export function grepForFile(html: string, srcDir: string): string | null {
  for (const needle of extractNeedles(html)) {
    const hits = grepDir(srcDir, needle);
    if (hits.length > 0) return hits[0];
  }
  return null;
}

export function extractNeedles(html: string): string[] {
  const results: string[] = [];

  const id = html.match(/\bid=["']([^"']{2,})["']/)?.[1];
  if (id) results.push(`id="${id}"`);

  const name = html.match(/\bname=["']([^"']{2,})["']/)?.[1];
  if (name) results.push(`name="${name}"`);

  const forAttr = html.match(/\bfor=["']([^"']{2,})["']/)?.[1];
  if (forAttr) results.push(`for="${forAttr}"`);

  // Local src paths — also try filename alone for Vite asset URLs (/src/assets/foo.png → foo.png)
  const src = html.match(/\bsrc=["'](?!https?:\/\/)([^"']{4,})["']/)?.[1];
  if (src) {
    results.push(src);
    const filename = src.split('/').pop();
    if (filename && filename.length > 4) results.push(filename);
  }

  const text = html.match(/>([^<\s][^<]{4,60})</)?.[1]?.trim();
  if (text) results.push(text);

  // Fallback: first meaningful class name
  if (results.length === 0) {
    const cls = html.match(/\bclass=["']([^"']+)["']/)?.[1]?.split(/\s+/)[0];
    if (cls && cls.length > 3) results.push(cls);
  }

  return results.filter((s) => s.length >= 3);
}

export function grepDir(dir: string, needle: string): string[] {
  if (!existsSync(dir)) return [];
  const hits: string[] = [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        hits.push(...grepDir(full, needle));
      } else if (entry.isFile() && SOURCE_EXTS.has(extOf(entry.name))) {
        try {
          if (readFileSync(full, 'utf8').includes(needle)) hits.push(full);
        } catch { /* skip unreadable files */ }
      }
    }
  } catch { /* skip unreadable dirs */ }
  return hits;
}

export function extOf(name: string): string {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i) : '';
}
