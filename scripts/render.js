import { render } from 'svelte/server';
import { mkdirSync, writeFileSync } from 'node:fs';
import { posix } from 'node:path';

const pages = import.meta.glob('../src/routes/kb/**/+page.svx', { eager: true, import: 'default' });
for (const [source, component] of Object.entries(pages)) {
  const path = source.replace('../src/routes/', '').replace('/+page.svx', '');
  const { head, body } = render(component);
  const linked = body.replace(/href="(\/kb[^"#]*)(#[^"]*)?"/g, (_, route, hash = '') => {
    const target = route.replace(/^\//, '').replace(/\/$/, '') + '/index.html';
    return `href="${posix.relative(path, target)}${hash}"`;
  });
  mkdirSync(`rendered/${path}`, { recursive: true });
  writeFileSync(`rendered/${path}/index.html`, `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${head}</head><body>${linked}</body></html>\n`);
}
console.log(`Rendered ${Object.keys(pages).length} KB pages with Svelte SSR and relative file links.`);
