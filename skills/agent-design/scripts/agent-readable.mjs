#!/usr/bin/env node
// agent-readable: checks how well a page can be read and operated by an AI agent.
// No dependencies. Node 18+.
//
//   node agent-readable.mjs <file | directory | url> [--json] [--quiet]
//
// Exit codes: 0 no blocking or warning findings, 2 findings, 1 target could not be scanned.
//
// What it can see: the markup. A file or a fetched URL is scanned as served, before
// any JavaScript runs, which is also what a fetching agent gets. It cannot see
// contrast, layout shift or behavior after hydration; check those in a browser.

import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const RAW = new Set(['script', 'style']);
const MARKUP_EXT = new Set(['.html', '.htm']);
const COMPONENT_EXT = new Set(['.jsx', '.tsx', '.vue', '.svelte', '.astro']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'out', 'coverage', '.turbo', '.vercel']);
const VAGUE_LINKS = new Set(['click here', 'here', 'read more', 'learn more', 'more', 'link', 'this', 'details', 'continue']);
const INJECTION = /(ignore|disregard|forget)\s+(all\s+|any\s+|your\s+)?(previous|prior|above|earlier)\s+(instructions|prompts|rules)|you\s+are\s+now\s+(an?|the)\s|system\s+prompt\s*:|(ai|llm)\s+(agents?|assistants?|models?)\s*[:,]\s*(you\s+)?(must|should|always|never)/i;

const RULES = {
  'unnamed-control': ['block', 'A control has no accessible name. An agent reading the accessibility tree sees "button" and has to guess what it does.'],
  'fake-button': ['block', 'A div or span handles clicks without a role. It is missing from the list of things an agent can press.'],
  'unlabeled-field': ['block', 'A form field has no label. A placeholder is not a name, and it disappears once the field has a value.'],
  'empty-shell': ['block', 'The served HTML has almost no text. An agent that fetches this page without running JavaScript gets nothing.'],
  'hidden-instructions': ['block', 'Text that addresses AI agents with instructions. Agents are built to treat page text as data, and this pattern is how prompt injection looks. Remove it and say it in visible content or a declared tool.'],
  'nameless-field': ['warn', 'A form field has no name attribute, so there is no stable key for the value.'],
  'vague-link': ['warn', 'Link text says nothing about the destination when read out of context, which is how agents read links.'],
  'no-main': ['warn', 'No <main> landmark. Agents use landmarks to separate the content from navigation and chrome.'],
  'heading-outline': ['warn', 'The heading outline is missing, duplicated or skips levels. Headings are how agents find a section without reading everything.'],
  'image-no-alt': ['warn', 'An image has no alt attribute. Use alt text for content, alt="" for decoration.'],
  'no-title': ['warn', 'No <title>. It is the first thing an agent uses to check it landed on the right page.'],
  'no-lang': ['warn', 'No lang attribute on <html>.'],
  'no-llms-txt': ['warn', 'No /llms.txt. It is a cheap index of what the site is and where the useful pages are.'],
  'no-markdown': ['info', 'The server does not answer Accept: text/markdown with markdown, and the page links no markdown alternate. Markdown costs agents far fewer tokens than HTML.'],
  'no-structured-data': ['info', 'No JSON-LD. Structured data states facts (price, date, availability) that otherwise have to be inferred from layout.'],
  'no-description': ['info', 'No meta description.'],
  'no-autocomplete': ['info', 'A personal-data field has no autocomplete attribute. The token tells an agent exactly which value belongs there.'],
  'tool-candidate': ['info', 'A form with no WebMCP declaration (toolname, tooldescription). Declaring it lets an agent call it as a tool instead of driving the fields. WebMCP is experimental; treat it as an enhancement.'],
};

// ---------- parsing ----------

function parse(src) {
  const root = { tag: '#root', attrs: {}, children: [], parent: null, index: 0 };
  let node = root;
  let i = 0;
  const n = src.length;
  const addText = (text) => { if (text) node.children.push({ text }); };

  while (i < n) {
    const lt = src.indexOf('<', i);
    if (lt === -1) { addText(src.slice(i)); break; }
    addText(src.slice(i, lt));
    if (src.startsWith('<!--', lt)) { const e = src.indexOf('-->', lt + 4); i = e === -1 ? n : e + 3; continue; }
    if (src[lt + 1] === '!' || src[lt + 1] === '?') { const e = src.indexOf('>', lt); i = e === -1 ? n : e + 1; continue; }
    if (src[lt + 1] === '/') {
      const e = src.indexOf('>', lt);
      if (e === -1) { i = n; break; }
      const name = src.slice(lt + 2, e).trim().toLowerCase();
      let p = node;
      while (p && p.tag !== name) p = p.parent;
      if (p && p.parent) node = p.parent;
      i = e + 1;
      continue;
    }
    const m = /^<([A-Za-z][\w:.-]*)/.exec(src.slice(lt, lt + 80));
    if (!m) { addText('<'); i = lt + 1; continue; }
    const rawTag = m[1];
    const tag = rawTag.toLowerCase();
    let j = lt + m[0].length;
    const attrs = {};
    let selfClose = false;
    // attributes: handles quotes and {expressions} so JSX does not end the tag early
    while (j < n) {
      while (j < n && /\s/.test(src[j])) j++;
      if (src[j] === '>') { j++; break; }
      if (src[j] === '/' && src[j + 1] === '>') { selfClose = true; j += 2; break; }
      if (src[j] === '{') { j = skipBraces(src, j); continue; }
      let k = j;
      while (k < n && !/[\s=>]/.test(src[k]) && !(src[k] === '/' && src[k + 1] === '>')) k++;
      if (k === j) { j++; continue; }
      const name = src.slice(j, k);
      j = k;
      while (j < n && /\s/.test(src[j])) j++;
      let value = '';
      if (src[j] === '=') {
        j++;
        while (j < n && /\s/.test(src[j])) j++;
        const q = src[j];
        if (q === '"' || q === "'") { const e = src.indexOf(q, j + 1); value = src.slice(j + 1, e === -1 ? n : e); j = e === -1 ? n : e + 1; }
        else if (q === '{') { const e = skipBraces(src, j); value = src.slice(j, e); j = e; }
        else { let e = j; while (e < n && !/[\s>]/.test(src[e])) e++; value = src.slice(j, e); j = e; }
      }
      attrs[name.toLowerCase().replace(/^[:@]|^v-bind:|^v-on:/, (p) => (p === '@' || p === 'v-on:' ? 'on' : ''))] = value;
    }
    const el = { tag, rawTag, attrs, children: [], parent: node, index: lt };
    node.children.push(el);
    if (RAW.has(tag) && !selfClose) {
      const close = src.toLowerCase().indexOf(`</${tag}`, j);
      const end = close === -1 ? n : close;
      el.children.push({ text: src.slice(j, end), raw: true });
      const gt = src.indexOf('>', end);
      i = gt === -1 ? n : gt + 1;
      continue;
    }
    if (!selfClose && !VOID.has(tag)) node = el;
    i = j;
  }
  return root;
}

function skipBraces(src, j) {
  let depth = 0;
  let quote = null;
  for (; j < src.length; j++) {
    const c = src[j];
    if (quote) { if (c === '\\') j++; else if (c === quote) quote = null; continue; }
    if (c === '"' || c === "'" || c === '`') quote = c;
    else if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return j + 1; }
  }
  return src.length;
}

function* walk(node) {
  for (const c of node.children || []) {
    if (c.tag) { yield c; yield* walk(c); }
  }
}

function text(node) {
  let out = '';
  for (const c of node.children || []) {
    if (c.text !== undefined) { if (!c.raw) out += c.text; }
    else if (!RAW.has(c.tag)) out += ' ' + text(c);
  }
  return out;
}

const clean = (s) => s.replace(/\{[^}]*\}/g, ' x ').replace(/&nbsp;|&#160;/g, ' ').replace(/\s+/g, ' ').trim();
const has = (el, name) => Object.prototype.hasOwnProperty.call(el.attrs, name);
const within = (el, tag) => { for (let p = el.parent; p; p = p.parent) if (p.tag === tag) return p; return null; };

function accessibleName(el) {
  if (clean(el.attrs['aria-label'] || '')) return 'x';
  if (has(el, 'aria-labelledby') || clean(el.attrs.title || '')) return 'x';
  let name = clean(text(el));
  if (name) return name;
  for (const d of walk(el)) {
    if (d.tag === 'img' && clean(d.attrs.alt || '')) return d.attrs.alt;
    if (clean(d.attrs['aria-label'] || '')) return 'x';
    // A capitalized child is a component we cannot see into; assume it may render text unless it looks like an icon.
    if (/^[A-Z]/.test(d.rawTag) && !/icon|svg|spinner|chevron|arrow/i.test(d.rawTag)) return 'x';
  }
  return '';
}

// ---------- checks ----------

function check(src, file, isComponent) {
  const findings = [];
  const root = parse(src);
  const lineStarts = [0];
  for (let i = 0; i < src.length; i++) if (src[i] === '\n') lineStarts.push(i + 1);
  const lineOf = (index) => { let lo = 0, hi = lineStarts.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (lineStarts[mid] <= index) lo = mid; else hi = mid - 1; } return lo + 1; };
  const add = (rule, el, detail) => findings.push({ rule, level: RULES[rule][0], file, line: el ? lineOf(el.index) : 1, detail: detail || '' });
  const snippet = (el) => `<${el.rawTag}${el.attrs.id ? ` id="${el.attrs.id}"` : ''}${el.attrs.class ? ` class="${String(el.attrs.class).slice(0, 40)}"` : ''}>`;

  const els = [...walk(root)];
  const labelFor = new Set(els.filter((e) => e.tag === 'label').map((e) => e.attrs.for || e.attrs.htmlfor).filter(Boolean));
  const fullPage = !isComponent && els.some((e) => e.tag === 'html' || e.tag === 'body');

  for (const el of els) {
    const { tag, attrs } = el;
    const role = attrs.role;
    const isLink = tag === 'a' && has(el, 'href');
    const isButton = tag === 'button' || role === 'button' || (tag === 'input' && ['button', 'submit', 'reset', 'image'].includes(attrs.type));

    if (isButton || isLink || role === 'link' || role === 'menuitem' || role === 'tab') {
      const named = tag === 'input' ? clean(attrs.value || attrs.alt || attrs['aria-label'] || '') || (attrs.type === 'submit' || attrs.type === 'reset' ? 'x' : '') : accessibleName(el);
      if (!named) add('unnamed-control', el, snippet(el));
    }

    if ((tag === 'div' || tag === 'span' || tag === 'li' || tag === 'td' || tag === 'img') && has(el, 'onclick') && !role) add('fake-button', el, snippet(el));

    if (isLink) {
      const t = clean(text(el)).toLowerCase().replace(/[.…»›→>]+$/, '').trim();
      if (VAGUE_LINKS.has(t) && !attrs['aria-label'] && !has(el, 'aria-labelledby')) add('vague-link', el, `"${clean(text(el))}"`);
    }

    if (tag === 'img' && !has(el, 'alt') && attrs.role !== 'presentation' && attrs['aria-hidden'] !== 'true') add('image-no-alt', el, attrs.src ? String(attrs.src).slice(0, 60) : '');

    const isField = (tag === 'input' && !['hidden', 'submit', 'button', 'reset', 'image'].includes(attrs.type)) || tag === 'select' || tag === 'textarea';
    if (isField) {
      const labelled = clean(attrs['aria-label'] || '') || has(el, 'aria-labelledby') || (attrs.id && labelFor.has(attrs.id)) || within(el, 'label') || clean(attrs.title || '');
      if (!labelled) add('unlabeled-field', el, attrs.placeholder ? `placeholder="${attrs.placeholder}" is its only name` : snippet(el));
      if (!isComponent && within(el, 'form') && !has(el, 'name')) add('nameless-field', el, snippet(el));
      const hint = `${attrs.name || ''} ${attrs.id || ''} ${attrs.type || ''}`.toLowerCase();
      if (tag === 'input' && !has(el, 'autocomplete') && /e-?mail|phone|tel|first|last|fullname|full_name|address|street|city|zip|postal|country|cc-|card/.test(hint)) add('no-autocomplete', el, snippet(el));
    }

    if (tag === 'form' && !has(el, 'toolname') && !isComponent) {
      const fields = [...walk(el)].filter((d) => d.tag === 'input' || d.tag === 'select' || d.tag === 'textarea').length;
      if (fields) add('tool-candidate', el, snippet(el));
    }
  }

  const visibleText = clean(text(root));
  const hit = INJECTION.exec(visibleText) || INJECTION.exec(els.map((e) => `${e.attrs['aria-label'] || ''} ${e.attrs.alt || ''} ${e.attrs.content || ''}`).join(' '));
  const comments = src.match(/<!--[\s\S]*?-->/g) || [];
  const commentHit = comments.map((c) => INJECTION.exec(c)).find(Boolean);
  if (hit || commentHit) {
    const phrase = (hit || commentHit)[0];
    const at = src.indexOf(phrase);
    add('hidden-instructions', at === -1 ? null : { index: at }, `"${phrase.slice(0, 80)}"`);
  }

  if (fullPage) {
    const html = els.find((e) => e.tag === 'html');
    const body = els.find((e) => e.tag === 'body') || root;
    if (html && !clean(html.attrs.lang || '')) add('no-lang', html);
    const title = els.find((e) => e.tag === 'title');
    if (!title || !clean(text(title))) add('no-title', null);
    if (!els.some((e) => e.tag === 'meta' && (e.attrs.name || '').toLowerCase() === 'description' && clean(e.attrs.content || ''))) add('no-description', null);
    if (!els.some((e) => e.tag === 'main' || e.attrs.role === 'main')) add('no-main', null);
    if (!els.some((e) => e.tag === 'script' && /ld\+json/i.test(e.attrs.type || ''))) add('no-structured-data', null);

    const heads = els.filter((e) => /^h[1-6]$/.test(e.tag));
    const h1 = heads.filter((e) => e.tag === 'h1').length;
    if (h1 === 0) add('heading-outline', null, 'no <h1>');
    else if (h1 > 1) add('heading-outline', heads.filter((e) => e.tag === 'h1')[1], `${h1} <h1> elements`);
    let prev = 0;
    for (const h of heads) {
      const level = Number(h.tag[1]);
      if (prev && level > prev + 1) { add('heading-outline', h, `<h${prev}> is followed by <h${level}>`); break; }
      prev = level;
    }

    const bodyText = clean(text(body));
    const scripts = els.filter((e) => e.tag === 'script' && !/ld\+json/i.test(e.attrs.type || '')).length;
    // An empty mount point (<div id="root"></div>) is the signature of a client-rendered app.
    const mount = els.some((e) => /^(root|app|__next|__nuxt|svelte)$/i.test(e.attrs.id || '') && !clean(text(e)));
    if (scripts > 0 && (bodyText.length < 40 || (mount && bodyText.length < 200))) add('empty-shell', body.tag ? body : null, `${bodyText.length} characters of text, ${scripts} script${scripts === 1 ? '' : 's'}`);
  }
  return findings;
}

// ---------- targets ----------

async function scanUrl(url) {
  const findings = [];
  const ua = 'agent-readable-check';
  let res;
  try { res = await fetch(url, { headers: { 'user-agent': ua, accept: 'text/html' }, redirect: 'follow' }); }
  catch (e) { throw new Error(`could not fetch ${url}: ${e.message}`); }
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  const html = await res.text();
  findings.push(...check(html, url, false));

  const origin = new URL(res.url).origin;
  const probe = async (path, headers) => { try { return await fetch(origin + path, { headers: { 'user-agent': ua, ...headers }, redirect: 'follow' }); } catch { return null; } };
  const llms = await probe('/llms.txt', {});
  const llmsBody = llms && llms.ok ? await llms.text() : '';
  if (!llmsBody.trim() || /^\s*<(!doctype|html)/i.test(llmsBody)) findings.push({ rule: 'no-llms-txt', level: 'warn', file: origin + '/llms.txt', line: 1, detail: llms ? `status ${llms.status}` : 'no response' });
  let md = null;
  try { md = await fetch(res.url, { headers: { 'user-agent': ua, accept: 'text/markdown' }, redirect: 'follow' }); } catch { /* reported below */ }
  const type = md ? md.headers.get('content-type') || '' : '';
  const altLink = /<link\b[^>]*type=["']?text\/markdown/i.test(html);
  if (!/markdown/i.test(type) && !altLink) findings.push({ rule: 'no-markdown', level: 'info', file: url, line: 1, detail: type ? `answered ${type.split(';')[0]}` : 'no response' });
  return findings;
}

async function collect(target) {
  const s = await stat(target);
  if (s.isFile()) return [target];
  const out = [];
  const visit = async (dir) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') && entry.name !== '.') continue;
      const p = join(dir, entry.name);
      if (entry.isDirectory()) { if (!SKIP_DIRS.has(entry.name)) await visit(p); }
      else if (MARKUP_EXT.has(extname(entry.name)) || COMPONENT_EXT.has(extname(entry.name))) out.push(p);
    }
  };
  await visit(target);
  return out;
}

// ---------- report ----------

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const target = args.find((a) => !a.startsWith('--'));

if (!target || flags.has('--help')) {
  console.log('Usage: node agent-readable.mjs <file | directory | url> [--json] [--quiet]\n\nChecks how well a page can be read and operated by an AI agent.\n--json   machine-readable findings\n--quiet  hide info-level findings\n\nRules:');
  for (const [id, [level, why]] of Object.entries(RULES)) console.log(`  ${level.padEnd(5)} ${id.padEnd(20)} ${why}`);
  process.exit(target ? 0 : 1);
}

let findings = [];
let scanned = 0;
try {
  if (/^https?:\/\//i.test(target)) { findings = await scanUrl(target); scanned = 1; }
  else {
    const files = await collect(resolve(target));
    if (!files.length) throw new Error(`no .html or component files under ${target}`);
    for (const f of files) {
      const src = await readFile(f, 'utf8');
      findings.push(...check(src, f, COMPONENT_EXT.has(extname(f))));
      scanned++;
    }
  }
} catch (e) {
  console.error(`agent-readable: ${e.message}`);
  process.exit(1);
}

if (flags.has('--quiet')) findings = findings.filter((f) => f.level !== 'info');
const order = { block: 0, warn: 1, info: 2 };
findings.sort((a, b) => order[a.level] - order[b.level] || a.file.localeCompare(b.file) || a.line - b.line);
const count = (level) => findings.filter((f) => f.level === level).length;

if (flags.has('--json')) {
  console.log(JSON.stringify({ target, scanned, summary: { block: count('block'), warn: count('warn'), info: count('info') }, findings: findings.map((f) => ({ ...f, why: RULES[f.rule][1] })) }, null, 2));
} else {
  const cwd = process.cwd() + '/';
  const label = { block: 'BLOCK', warn: 'WARN ', info: 'INFO ' };
  const seen = new Set();
  for (const f of findings) {
    console.log(`${label[f.level]} ${f.rule}  ${f.file.replace(cwd, '')}:${f.line}${f.detail ? `  ${f.detail}` : ''}`);
    if (!seen.has(f.rule)) { console.log(`      ${RULES[f.rule][1]}`); seen.add(f.rule); }
  }
  console.log(`${findings.length ? '\n' : ''}${scanned} ${scanned === 1 ? 'target' : 'files'} scanned: ${count('block')} blocking, ${count('warn')} warnings, ${count('info')} notes.`);
  console.log('Scanned as served, before JavaScript runs. Check contrast, layout shift and post-load behavior in a browser.');
}
process.exit(count('block') + count('warn') > 0 ? 2 : 0);
