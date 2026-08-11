#!/usr/bin/env node
/**
 * Build /inventory — one orphan page listing everything this project has
 * published, so it can all be reviewed from one place.
 *
 *   node scripts/build-inventory.js
 *
 * It is GENERATED rather than hand-written on purpose. A hand-kept index of a
 * repo that changes this fast is stale within a week, and a stale index is
 * worse than none because it quietly stops mentioning the new things.
 *
 * Everything on the page is read off disk or out of git at build time:
 * titles, descriptions, word counts and last-changed dates. Nothing is typed
 * in here, so nothing can drift out of sync with what actually exists.
 *
 * The page is noindex, absent from the sitemap, and linked from nowhere.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const REPO = 'https://github.com/markbarrera/slush-sisters/blob/main';

/* ------------------------------------------------------------- extraction */

// Last commit that touched the file. Empty string if git has never seen it,
// which is the honest answer for something only just written.
function lastChanged(rel) {
  try {
    return execSync(`git log -1 --format=%cs -- "${rel}"`, { cwd: ROOT })
      .toString().trim();
  } catch { return ''; }
}

function words(text) {
  const n = text.trim().split(/\s+/).filter(Boolean).length;
  return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(n);
}

// Visible words only — strip the inline <style>/<script> blocks first, or every
// page reads as thousands of words of CSS.
function htmlInfo(file) {
  const s = fs.readFileSync(file, 'utf8');
  const title = (s.match(/<title>([^<]*)<\/title>/) || [, ''])[1]
    .replace(/&amp;/g, '&').replace(/\s+—.*$/, '').trim();
  const desc = (s.match(/<meta name="description" content="([^"]*)"/) || [, ''])[1]
    .replace(/&amp;/g, '&').trim();
  const body = s
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ');
  return { title, desc, words: words(body) };
}

// First real paragraph after the H1, skipping "Written <date>." style lines
// and blockquote callouts.
function mdInfo(file) {
  const s = fs.readFileSync(file, 'utf8');
  const lines = s.split('\n');
  const title = (lines.find(l => l.startsWith('# ')) || '# ').slice(2).trim();
  // Work in whole paragraphs. Skipping only the matching *line* left
  // "Written 2026-08-03, after the goal was restated as: *the money is not in
  // the" dropped and the rest of its sentence promoted into the description.
  const after = lines.slice(lines.findIndex(l => l.startsWith('# ')) + 1);
  const paras = after.join('\n').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const skip = p => /^(#|>|\||```|-{3,}|[-*] )/.test(p)
                 || /^\*?\*?Written \d{4}/.test(p)
                 || /^\d{4}-\d{2}-\d{2}/.test(p);
  let desc = (paras.find(p => !skip(p)) || '').replace(/\n/g, ' ');
  desc = desc.replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '')
             .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  if (desc.length > 240) desc = desc.slice(0, 237).replace(/\s\S*$/, '') + '…';
  return { title, desc, words: words(s) };
}

/* ------------------------------------------------------------- collection */

// Pages that exist to be found, versus pages deliberately linked from nowhere.
const ORPHAN = new Set([
  'cockpit.html', 'competition.html', 'dashboard.html', 'for-everest.html',
  'ideas.html', 'inventory.html', 'launch-plan.html', 'outreach.html',
  'party-play.html', 'play.html',
  'slush-rush.html', 'slushie-catch.html', 'slushie-guys.html',
  'slushie-playhouse.html', 'slushie-street.html', 'slushie-style.html',
]);
const SKIP = new Set(['404.html']);

const sitePages = [], orphanPages = [];
for (const f of fs.readdirSync(path.join(ROOT, 'public')).sort()) {
  if (!f.endsWith('.html') || SKIP.has(f)) continue;
  const rel = 'public/' + f;
  const url = '/' + f.replace(/\.html$/, '').replace(/^index$/, '');
  const info = htmlInfo(path.join(ROOT, rel));
  const row = { ...info, url, rel, changed: lastChanged(rel) };
  (ORPHAN.has(f) ? orphanPages : sitePages).push(row);
}

const readPages = [];
for (const f of fs.readdirSync(path.join(ROOT, 'public/read')).sort()) {
  if (!f.endsWith('.html')) continue;
  const rel = 'public/read/' + f;
  const info = htmlInfo(path.join(ROOT, rel));
  readPages.push({
    ...info,
    url: '/read/' + f.replace(/\.html$/, '').replace(/^index$/, ''),
    rel, changed: lastChanged(rel),
  });
}

const docs = [];
// Walk docs/ recursively so subfoldered docs (e.g. docs/competitors/*.md) are
// listed too. Skip docs/board (generators, not prose) and docs/history
// (snapshots, rendered separately below).
(function walkDocs(dir, prefix) {
  for (const f of fs.readdirSync(dir).sort()) {
    const full = path.join(dir, f);
    const rel = prefix + f;
    if (fs.statSync(full).isDirectory()) {
      if (rel === 'docs/board' || rel === 'docs/history') continue;
      walkDocs(full, rel + '/');
      continue;
    }
    if (!f.endsWith('.md')) continue;
    docs.push({ ...mdInfo(full), rel, changed: lastChanged(rel) });
  }
})(path.join(ROOT, 'docs'), 'docs/');

const builders = [];
for (const rel of ['scripts/snapshot.js', 'scripts/build-inventory.js',
                   'docs/board/generate.js', 'docs/board/reading-room.js']) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) continue;
  const s = fs.readFileSync(p, 'utf8');
  // The purpose line is the first prose line of the leading block comment.
  const m = s.match(/\/\*\*?\s*\n([\s\S]*?)\*\//);
  const desc = m ? m[1].split('\n').map(l => l.replace(/^\s*\*ss?\s?/, '').replace(/^\s*\*\s?/, '').trim())
      .filter(l => l && !l.startsWith('node ')).slice(0, 2).join(' ') : '';
  builders.push({ rel, desc, changed: lastChanged(rel),
    words: (fs.statSync(p).size / 1024).toFixed(0) + 'KB' });
}

const snapshotDirs = fs.existsSync(path.join(ROOT, 'docs/history'))
  ? fs.readdirSync(path.join(ROOT, 'docs/history')).sort().reverse() : [];

/* ---------------------------------------------------------------- render */

const esc = s => String(s).replace(/&(?!#?\w+;)/g, '&amp;').replace(/</g, '&lt;');

const row = (r) => `<li>
  <a class="n" href="${r.url || REPO + '/' + r.rel}"${r.url ? '' : ' rel="noopener"'}>${esc(r.title || r.rel)}</a>
  <span class="meta">${r.url ? esc(r.url) : esc(r.rel)}${r.changed ? ' · ' + r.changed : ''}${r.words ? ' · ' + r.words + (r.words.endsWith('KB') ? '' : ' words') : ''}</span>
  ${r.desc ? `<span class="d">${esc(r.desc)}</span>` : ''}
</li>`;

const section = (id, title, blurb, items) => `
<section>
<h2 id="${id}">${title} <span class="count">${items.length}</span></h2>
<p class="blurb">${blurb}</p>
<ul class="list">
${items.map(row).join('\n')}
</ul>
</section>`;

const totalWords = [...sitePages, ...orphanPages, ...readPages, ...docs]
  .reduce((n, r) => n + (r.words.endsWith('k') ? parseFloat(r.words) * 1000 : parseInt(r.words) || 0), 0);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Everything we have made — Slush Sisters</title>
<style>
:root{
  --brand:#1a237e; --ice:#4fc3f7; --wash:#e8f4fd; --blush:#fff5f7;
  --ink-ice:#0165a8; --ink-pink:#c2185b; --line:#e4ebf2;
}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'DM Sans',system-ui,sans-serif;color:#1a1a1a;background:#fff;
  line-height:1.6;padding:32px 20px 72px;}
.wrap{max-width:820px;margin:0 auto;}
h1{font-family:'Baloo 2',system-ui,sans-serif;font-size:clamp(1.7rem,6vw,2.3rem);
  font-weight:800;color:var(--brand);line-height:1.1;margin-bottom:10px;}
.kicker{font-family:'Baloo 2',system-ui,sans-serif;font-weight:800;font-size:.72rem;
  letter-spacing:.14em;text-transform:uppercase;color:var(--ink-ice);margin-bottom:8px;}
.lede{color:#555;font-size:.98rem;margin-bottom:6px;}
.stat{font-size:.82rem;color:#777;margin-bottom:30px;}
.stat b{color:var(--brand);font-family:'Baloo 2',system-ui,sans-serif;
  font-variant-numeric:tabular-nums lining;}
.toc{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:34px;}
.toc a{font-size:.78rem;font-weight:600;text-decoration:none;color:var(--brand);
  background:var(--wash);border-radius:99px;padding:7px 14px;}
.toc a:hover{background:var(--ice);color:#fff;}
section{margin-bottom:38px;}
h2{font-family:'Baloo 2',system-ui,sans-serif;font-size:1.25rem;font-weight:800;
  color:var(--brand);margin-bottom:4px;display:flex;align-items:center;gap:10px;}
.count{font-size:.7rem;font-weight:700;background:var(--brand);color:#fff;
  border-radius:99px;padding:3px 9px;font-variant-numeric:tabular-nums lining;}
.blurb{font-size:.86rem;color:#666;margin-bottom:14px;}
ul.list{list-style:none;}
ul.list li{padding:13px 0;border-bottom:1px solid var(--line);display:flex;
  flex-direction:column;gap:3px;}
ul.list li:last-child{border-bottom:none;}
a.n{font-weight:700;font-size:.96rem;color:var(--brand);text-decoration:none;}
a.n:hover{text-decoration:underline;}
.meta{font-size:.74rem;color:#8a8f99;font-variant-numeric:tabular-nums lining;}
.d{font-size:.85rem;color:#555;}
.note{border-left:3px solid var(--ink-pink);padding:2px 0 2px 15px;margin:26px 0;}
.note p{font-size:.86rem;color:#555;}
.note b{color:var(--ink-pink);}
.hist{font-size:.8rem;color:#666;}
.hist code{background:var(--wash);border-radius:5px;padding:2px 7px;font-size:.78rem;}
footer{margin-top:48px;padding-top:20px;border-top:1px solid var(--line);
  font-size:.76rem;color:#8a8f99;}
</style>
<link rel="stylesheet" href="/fonts/fonts.css">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
</head>
<body>
<div class="wrap">

<p class="kicker">Not linked from anywhere · Not in search</p>
<h1>Everything we have made</h1>
<p class="lede">One page listing every page on the site and every document in the repo, so it can all be reviewed from one place. Nothing here is typed by hand — titles, descriptions, word counts and dates are read off the files themselves each time this is rebuilt, so it cannot quietly go out of date.</p>
<p class="stat">Roughly <b>${Math.round(totalWords / 1000)}k</b> words across <b>${sitePages.length + orphanPages.length + readPages.length}</b> pages and <b>${docs.length}</b> documents.</p>

<div class="toc">
  <a href="#site">The site</a>
  <a href="#read">The reading room</a>
  <a href="#orphan">Orphan pages</a>
  <a href="#docs">Research &amp; strategy</a>
  <a href="#build">How it gets built</a>
  <a href="#history">Visual history</a>
</div>

${section('site', 'The site', 'Pages a customer can reach by clicking or searching. These are indexed and in the sitemap.', sitePages)}

${section('read', 'The reading room', 'Every strategy document rewritten for the two people who own the business, as cards they can read on a phone. Noindex, and linked only from its own hub.', readPages)}

${section('orphan', 'Orphan pages', 'Deliberately linked from nowhere and kept out of search. Including this one.', orphanPages)}

<section>
<h2 id="docs">Research &amp; strategy <span class="count">${docs.length}</span></h2>
<p class="blurb">The grown-up versions. These live in the repository rather than on the website, so the links go to GitHub.</p>
<ul class="list">
${docs.map(row).join('\n')}
</ul>
</section>

${section('build', 'How it gets built', 'The scripts that generate pages and check them. Run by hand, not on deploy.', builders)}

<section>
<h2 id="history">Visual history <span class="count">${snapshotDirs.length}</span></h2>
<p class="blurb">Every canonical page rendered at phone and desktop width, kept by date, so you can see what the site looked like on a given day rather than only what the code was.</p>
<ul class="list">
${snapshotDirs.map(d => `<li><a class="n" href="${REPO}/docs/history/${d}" rel="noopener">${d}</a><span class="meta">docs/history/${d}</span></li>`).join('\n')}
</ul>
</section>

<div class="note">
<p><b>To rebuild this page:</b> <code>node scripts/build-inventory.js</code>. It reads the filesystem and git, so anything added since the last run appears automatically and nothing needs editing here.</p>
</div>

<footer>
Generated ${new Date().toISOString().slice(0, 10)} · Slush Sisters LLC · this page is noindex and absent from the sitemap
</footer>
</div>
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT, 'public/inventory.html'), html);
console.log(`wrote public/inventory.html — ${sitePages.length} site pages, ` +
  `${readPages.length} reading room, ${orphanPages.length} orphan, ` +
  `${docs.length} docs, ${snapshotDirs.length} snapshot days`);
