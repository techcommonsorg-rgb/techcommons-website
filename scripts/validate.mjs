import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, relative, resolve } from 'node:path';

const root = resolve(process.cwd());
const ignored = new Set(['dist', '.git', 'node_modules']);
const pages = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (ignored.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (extname(path) === '.html') pages.push(path);
  }
}
walk(root);
const errors = [];
const requiredMeta = [/<title>[^<]+<\/title>/i,/<meta name="description" content="[^"]+">/i,/<link rel="canonical" href="https:\/\/[^\"]+">/i,/<meta property="og:title" content="[^"]+">/i,/<meta property="og:description" content="[^"]+">/i,/<meta property="og:image" content="[^"]+">/i];
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const label = relative(root, page);
  requiredMeta.forEach((pattern, index) => { if (!pattern.test(html)) errors.push(`${label}: missing metadata check ${index + 1}`); });
  if ((html.match(/<h1(?:\s|>)/gi) || []).length !== 1) errors.push(`${label}: must have exactly one h1`);
  for (const match of html.matchAll(/<(?:a|link|script|img|iframe)\b[^>]*(?:href|src)="([^"]+)"/gi)) {
    const value = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|#)/.test(value)) continue;
    const clean = value.split('#')[0].split('?')[0];
    if (!clean) continue;
    let target = normalize(resolve(dirname(page), clean));
    if (clean.endsWith('/')) target = join(target, 'index.html');
    if (!existsSync(target)) errors.push(`${label}: broken local reference ${value}`);
  }
  for (const match of html.matchAll(/<a\b[^>]*href="([^"]*#[^"]+)"/gi)) {
    const value = match[1];
    if (/^(?:https?:|mailto:|tel:)/.test(value)) continue;
    const [pathPart, fragment] = value.split('#');
    if (!fragment) continue;
    let targetPage = page;
    if (pathPart) {
      targetPage = normalize(resolve(dirname(page), pathPart));
      if (pathPart.endsWith('/')) targetPage = join(targetPage, 'index.html');
    }
    if (existsSync(targetPage)) {
      const targetHtml = readFileSync(targetPage, 'utf8');
      const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!new RegExp(`id=["']${escaped}["']`).test(targetHtml)) errors.push(`${label}: missing anchor target ${value}`);
    }
  }
  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    if (!/\balt="[^"]*"/i.test(match[1])) errors.push(`${label}: image missing alt attribute`);
  }
}
const allSource = pages.map((page) => readFileSync(page, 'utf8')).join('\n');
const siteJs = readFileSync(join(root, 'assets', 'site.js'), 'utf8');
const retiredPatterns = [
  [/<form\b/i, 'visible form markup'],
  [/data-email-form/i, 'retired email-form behaviour'],
  [/(?:#interest|#school-enquiry|#organisation-enquiry|#support-enquiry)/i, 'retired form anchor'],
  [/assets\/logo\.png/i, 'obsolete logo reference'],
  [/(?:5[–—-]6|5[–—-]8|Years 7[–—-]8)/i, 'obsolete school-year range']
];
for (const [pattern, description] of retiredPatterns) {
  if (pattern.test(allSource) || pattern.test(siteJs)) errors.push(`${description} remains in source`);
}
const forbidden = [
  ['aged','care'].join('-'), ['aged','care'].join(' '), ['senior','digital-literacy'].join(' '),
  ['home','visit'].join(' '), ['volunteer','phone'].join(' '), ['Baptist','Care'].join(''),
  ['Hammond','Care'].join(' '), ['Anglicare','NSW'].join(' '), ['Uniting','AgeWell'].join(' '),
  `>${['Marg','aret'].join('')}<`, `>${['De','rek'].join('')}<`, `>${['Ro','byn'].join('')}<`,
  ['tax','deductible'].join('-'), ['registered','nonprofit'].join(' '), ['registered','charity'].join(' '),
  ['grant','funding'].join(' '), ['corporate','funding'].join(' ')
];
for (const term of forbidden) if (allSource.toLowerCase().includes(term.toLowerCase())) errors.push(`prohibited content remains: ${term}`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Validated ${pages.length} HTML pages: metadata, headings, assets, local links and prohibited content.`);
