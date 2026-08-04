#!/usr/bin/env node
/**
 * Snapshot every page of the site, at phone width and desktop width, into
 * docs/history/<date>/.
 *
 * This exists because the build itself is a story worth telling — for the
 * girls, and as a case study. Git records what the code was; this records what
 * the site *looked like* on a given day, which is the part anyone outside the
 * repo can actually read.
 *
 *   node scripts/snapshot.js              # snapshot as today's date
 *   node scripts/snapshot.js 2026-08-04   # or force a date
 *
 * Serves public/ over http first, because file:// does not resolve the
 * absolute /img/... paths and every photo would come out broken.
 */

// Playwright is deliberately NOT in package.json. Every deploy runs `npm ci`,
// and adding a browser-downloading dependency to that path costs time and
// reliability for a tool only ever run by hand. Install it when you need it:
//   npm i --no-save playwright
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('This script needs Playwright, which is not installed.\n' +
                'Run:  npm i --no-save playwright\n' +
                'Then: npm run snapshot');
  process.exit(1);
}
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

// The canonical set. Service-area pages share one template, so one stands in
// for the six — snapshotting all of them would just grow the repo.
const PAGES = [
  ['index', '/'],
  ['about', '/about'],
  ['book', '/book'],
  ['pricing', '/pricing'],
  ['flavors', '/flavors'],
  ['austin', '/austin'],
  ['grown-ups', '/grown-ups'],
  ['promise', '/promise'],
  ['read-hub', '/read'],
  ['read-freezes', '/read/why-it-freezes'],
  ['read-other-kids', '/read/other-kids-businesses'],
  ['margarita-machine-rental-austin', '/margarita-machine-rental-austin'],
  ['service-area-lakeway', '/frozen-drink-machine-rental-lakeway'],
];

const VIEWPORTS = [
  ['phone', 390, 844],
  ['desktop', 1280, 900],
];

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.xml': 'application/xml',
  '.txt': 'text/plain', '.ico': 'image/x-icon',
};

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/') p = '/index.html';
      let file = path.join(PUBLIC, p);
      // mirror the Worker's auto-trailing-slash handling
      if (!fs.existsSync(file) && fs.existsSync(file + '.html')) file += '.html';
      // a directory serves its index.html, as the Worker does for /read
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
        file = path.join(file, 'index.html');
      }
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404); return res.end('not found');
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    // port 0 = let the OS pick a free one, so a stale run can't block this one
    server.listen(0, () => resolve(server));
  });
}

(async () => {
  const date = process.argv[2] || new Date().toISOString().slice(0, 10);
  const outDir = path.join(ROOT, 'docs', 'history', date);
  fs.mkdirSync(outDir, { recursive: true });

  const server = await serve();
  const PORT = server.address().port;
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  });

  const problems = [];

  for (const [name, route] of PAGES) {
    for (const [label, width, height] of VIEWPORTS) {
      const page = await browser.newPage({ viewport: { width, height } });
      const res = await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'load' });
      if (!res || res.status() !== 200) {
        problems.push(`${route} returned ${res ? res.status() : 'no response'} — skipped`);
        await page.close();
        continue;
      }
      await page.waitForTimeout(400); // let fonts settle

      // While we are here, check the two things that matter most on a phone.
      if (label === 'phone') {
        const checks = await page.evaluate(() => {
          // Check EVERY candidate, not the first in document order — the nav
          // CTA precedes the mobile one in markup and is hidden on phones, so
          // a single querySelector here reports a false negative.
          const visible = e => !!(e && e.offsetParent !== null);
          const bookVisible = [...document.querySelectorAll('.cta-m, header nav a.cta')].some(visible);
          const broken = [...document.images].filter(i => !i.complete || i.naturalWidth === 0).length;
          return {
            bookVisible,
            // /book is the booking form itself, and /read and /ideas are
            // orphan reading pages that deliberately carry no site chrome.
            isBookPage: location.pathname.replace(/\/$/, '') === '/book'
                        || /^\/(read|ideas)/.test(location.pathname),
            sideScroll: document.documentElement.scrollWidth > window.innerWidth,
            brokenImages: broken,
          };
        });
        if (!checks.bookVisible && !checks.isBookPage) {
          problems.push(`${route}: no Book button visible at 390px`);
        }
        if (checks.sideScroll) problems.push(`${route}: scrolls sideways at 390px`);
        if (checks.brokenImages) problems.push(`${route}: ${checks.brokenImages} broken image(s)`);
      }

      await page.screenshot({
        path: path.join(outDir, `${name}-${label}.jpg`),
        fullPage: true, type: 'jpeg', quality: 72,
      });
      await page.close();
    }
    console.log(`  captured ${name}`);
  }

  await browser.close();
  server.close();

  console.log(`\nSnapshot written to docs/history/${date}/`);
  if (problems.length) {
    console.log('\nProblems found:');
    for (const p of problems) console.log('  ✗ ' + p);
    process.exitCode = 1;
  } else {
    console.log('No problems found at 390px.');
  }
})();
