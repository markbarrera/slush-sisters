# Analytics & monitoring

How we see what is happening on slushsisters.com — who visits, who crawls, what
people search to find us — and, just as important, the lines we do **not** cross
to get it.

Set up 2026-08-05. Owner: Mark. This is the record of what exists, how to read
each screen, and what is deliberately left for later.

## The one rule everything here bends around

The arcade games and the kids' pages carry **no analytics, no cookies, no
capture — ever.** That is what keeps a page a child plays from making the whole
site "directed to children" under COPPA, which matters because the booking form
collects a home address and a phone number for a child's party. Every choice
below is downstream of that rule.

Practical version of the rule:

- **A page that is `noindex` gets no analytics beacon.** That covers all seven
  games, `/play`, `/party-play`, `/inventory`, `/competition`, and `404`.
- **`/ideas` (the kids' idea board) gets no beacon either** — it is for Harper
  and Finley, not the public, so we do not track it and we do not want to track
  them. (See "Orphaned pages" below — its leak risk is handled server-side, not
  with a beacon.)
- **The booking form's sensitive fields are masked at the source** (see PostHog
  below).

## What is set up

### 1. Google Search Console — verified ✅

Property: `slushsisters.com` (a "Domain" property, verified by DNS TXT record on
2026-08-05). This is the free, first-party source for **search data** and
**Googlebot crawl behavior**.

Where to look (all at <https://search.google.com/search-console>, pick
`slushsisters.com`):

- **Performance** — what people typed into Google to find us, which pages showed
  up, clicks vs impressions, average position. Backfills over 2–3 days and gets
  useful over 2–3 weeks.
- **Settings → Crawl stats** — Googlebot specifically: how often it fetches, the
  response codes it got, any host errors. This is the clearest "is Google having
  trouble reading us" screen.
- **Pages** (Indexing) — which URLs Google has indexed. Useful as a leak check:
  if a page that should be private ever appears here, it has been indexed.

### 2. Cloudflare built-ins — free, nothing to deploy

At <https://dash.cloudflare.com> → select `slushsisters.com`:

- **AI Crawl Control** (left sidebar; was "AI Audit") — which AI crawlers hit the
  site (GPTBot, ClaudeBot, PerplexityBot, etc.) and how often. This is the best
  free view of the "be the answer in an assistant" strategy actually happening.
- **Analytics & Logs → Traffic** — total requests, bandwidth, top countries,
  requests by response status. Path-level detail is limited on the free plan
  (that gap is what the future Worker below closes).
- **Security → Events** — if a crawler ever gets blocked, the rule that stopped
  it shows here. See `docs/crawlers.md` for the settings to leave alone.

### 3. PostHog — product analytics on the marketing pages only

A separate Slush Sisters PostHog project (**not** the Onramp work project). It is
loaded through one shared file, `public/analytics.js`, included on the 22
hand-authored marketing pages and on **no** game, kids', or `noindex` page.

Why one shared file instead of a snippet pasted into each page: it keeps the
COPPA route-guard and the privacy config in a single auditable place, so the rule
cannot quietly drift on one page out of two dozen. The file also refuses to
initialize on a game path even if it were ever included there by mistake — two
layers, not one.

**Privacy posture (deliberate):**

- **Cookieless.** The anonymous visitor id lives in `localStorage`, not a cookie,
  so funnels still work across pages without a tracking cookie.
- **No identify().** No one logs in, so no personal profiles are ever built.
- **"Do Not Track" honored.**
- **Session recording is on and watchable, but the booking form's sensitive
  fields are masked at the source.** The name, event address, and phone/email
  inputs on `/book` carry the class `ph-no-capture`, so a replay never shows the
  home address or phone a customer types. Every other field — date, guests,
  recipe, flavors, the "how did you hear about us" box, notes — is visible,
  which is what makes the recording worth watching. **If a new sensitive field is
  ever added to any form, give it `ph-no-capture` too.**

**What it answers, once data flows:**

- Where visitors come from (validates the "neighborhood Facebook converts best"
  thesis in `docs/marketing.md` with real numbers).
- Which pages get read vs bounced, and how far down people scroll.
- The booking funnel: landing → viewed `/book` → submitted the form, and which
  field people quit on.

**Honest caveat, carried from `docs/site-audit.md`:** the booking form currently
shows a success message without actually submitting anywhere. PostHog can record
that the button was clicked, but "a booking happened" is not real until that form
delivers somewhere. Fixing the form is the natural partner to this work —
otherwise the most important funnel step measures a button, not a booking.

**Active** as of 2026-08-05. The Slush Sisters PostHog project key is set in
`public/analytics.js` (a separate project from the Onramp work account). The key
is public by design — it ships in page source — so it is safe in the repo. To
pause all tracking, blank the key out; the loader then does nothing.

## Orphaned pages — watching for external traffic

The idea board (`/ideas`), the reading room (`/read`), and `/inventory` are built
for the family, not for customers. The question worth answering is whether
outside traffic ever leaks into them.

**Beacons are the wrong tool for this**, for two reasons: we will not put tracking
code on the kids' pages, and a client-side beacon cannot see a bot or scraper
anyway. Leak detection is a **server-side** job — the edge sees every request to
every path regardless of whether the page carries any code. That is exactly what
the edge Worker (`src/worker.js`, **live** since 2026-08-05) does: it logs every
request to the `slush_traffic` Analytics Engine dataset, orphaned paths included.
Leak check query: `SELECT blob1 AS path, sum(_sample_interval) AS hits FROM
slush_traffic WHERE blob2 = 'none' AND (blob1 LIKE '/ideas%' OR blob1 LIKE
'/read%' OR blob1 LIKE '/inventory%') GROUP BY path ORDER BY hits DESC`.

What can be checked **today**, with no build:

- **`/ideas` is now `noindex`** (fixed 2026-08-05). The board generator
  (`docs/board/generate.js`) now defaults to `noindex` — the board is for the
  family, so it should never be indexable — and the `noindex` tag was added to
  the current `public/ideas.html` directly for immediate coverage. Note: the
  generator needs the brand font (`/root/.fonts/brand-1.ttf`) to run, so the next
  full regeneration must happen in an environment that has it; the default is
  already correct, so that regen just finalizes the full document form.
- **GSC → Pages** will show any orphaned URL that Google has actually indexed —
  the cleanest signal that a "private" page leaked into search.
- **Cloudflare AI Crawl Control** shows bots hitting any path, orphaned ones
  included.

## Agent-readiness (being the answer in an AI assistant)

The site already leans into AI discovery (see `docs/crawlers.md`). Two low-cost
pieces are in place; the rest of the "agent-ready" stack is deliberately skipped
as overkill for a five-page brochure site.

In place:

- **`/llms.txt`** — a markdown map of the business (price, flavors, service area,
  key pages) that assistants can read cheaply instead of parsing HTML. It lists
  marketing pages only; no game or kids' page is surfaced. (A stale age/name
  error — "Finley and Harper, ages 10 and 8" — was corrected here 2026-08-05 to
  Harper 11, Finley 8.)
- **`robots.txt` content signals** — `Content-Signal: search=yes, ai-input=yes,
  ai-train=yes`, consistent with the deliberate allow-everything stance.
  `ai-train` can be flipped to `no` to opt out of model training while still
  allowing AI search and answers.

Deliberately **not** done (they are for sites that expose tools, APIs, agents, or
a storefront — none of which applies here): MCP server cards, A2A agent cards,
`.well-known/ai-catalog.json`, `api-catalog`, WebMCP, OAuth resource metadata,
commerce protocols. Adding them would be maintenance with no payoff.

- **Markdown for agents** — live in the edge Worker (`src/worker.js`). When an
  agent sends `Accept: text/markdown` (or adds `?format=md`) to a page URL, it
  gets a compact markdown version instead of styled HTML — title, description,
  headings, links, and body text, several times smaller. Marked `noindex` and
  `Vary: Accept` so it never reaches a browser or a search index. Assets (JS,
  CSS, images) are never converted. Every HTML page also carries a `Link:
  </llms.txt>; rel="describedby"` header pointing agents at the site map.

## How the future dashboard gets its data

The custom dashboard needs to pull from three places and cache them. Sketch, for
when the Worker is built:

- **Crawler / traffic / orphaned-page hits** → the Worker logs every request to
  **Workers Analytics Engine** and queries it back with the Analytics Engine SQL
  API. No extra service; it is the Worker logging its own traffic.
- **Search data (GSC)** → the Worker calls the **Search Console API** with a
  **Google service account** that has been added as a restricted (read-only) user
  on the `slushsisters.com` property, then caches the daily results in Cloudflare
  **KV** so the dashboard reads cache, not the live API. (Interim option without
  a service account: this session's connected GSC access can pull snapshots on a
  schedule and write them to the same KV — simpler to stand up, but it leans on a
  scheduled task here rather than being fully self-contained.)
- **Content consumption (PostHog)** → the PostHog query API with a read-only
  personal API key, stored as a Worker secret.

Each credential is created by Mark and stored as a Worker secret (never shown to
anyone); the public `phc_` key is the only one that lives in the repo.

## Status — what is live (2026-08-05)

The whole original plan shipped the same day:

- **Search Console** — verified; search + crawl-stats data flowing.
- **PostHog** — live on the 22 marketing pages; recordings masked as above.
- **Edge request logger** — live. `src/worker.js` writes every request to the
  `slush_traffic` Analytics Engine dataset (~92-day retention). Read it with the
  Analytics Engine SQL API, e.g. `SELECT blob1 AS path, blob2 AS crawler,
  sum(_sample_interval) AS hits FROM slush_traffic WHERE timestamp > NOW() -
  INTERVAL '7' DAY GROUP BY path, crawler ORDER BY hits DESC`. Creating the
  dataset by hand in the dashboard was **not** required — the binding
  auto-creates it on first write. (A hand-made `site_requests` dataset from
  setup is unused and can be deleted.)
- **Booking form → email** — live. `POST /api/book` emails each booking to the
  verified inbox via Email Routing; see `docs/booking-worker.md`.
- **Email hardening** — SPF + DKIM present, DMARC `p=reject`.
- **`www` → apex** — 301 in the Worker. Cloudflare Redirect Rules were not on
  this plan's menu, so `www` is a Worker route and `src/worker.js` does the
  redirect (preserving path + query).

## The dashboard — `/dashboard`

An orphaned, `noindex` kids'-language page ("Our Numbers"): who visited, who is
crawling us, what people googled. It reads through Worker routes (`/api/stats/*`)
so **no API token ever reaches the browser**. Each source degrades gracefully —
a card shows real data when its credential is set, and a friendly "waiting for
the key" / "coming soon" state otherwise, so it never breaks.

Like `/read` and `/ideas` it is orphaned: `noindex`, not in the nav, footer,
sitemap, or `scripts/snapshot.js` set, and — being a family page — it carries
**no** PostHog beacon.

**To light up the live data, Mark adds these as Worker secrets** (Workers & Pages
→ drop-b4ff8c50-e5c → Settings → Variables and Secrets, or `wrangler secret
put`). Until then the dashboard shows placeholders — nothing breaks.

- **Cloudflare traffic / crawlers** → `CF_ANALYTICS_TOKEN`, an API token scoped
  to **Account Analytics → Read** (My Profile → API Tokens → Create Token). The
  account id is set as the plain var `CF_ACCOUNT_ID` in `wrangler.jsonc`.
- **PostHog content** → `POSTHOG_API_KEY` (a read-only *personal* API key) plus
  `POSTHOG_PROJECT_ID`. The public `phc_` write key already in the repo cannot
  *read* data.
- **GSC search terms** → placeholder for now. Wiring it needs a Google service
  account added read-only to the property (or a scheduled pull from this
  session). Deferred deliberately ("placeholders for GSC").

## Still deferred

- **Instrument `/ideas`** — intentionally **not** done; it is a kids' page, so it
  stays beacon-free by design. Listed only so no one "fixes" its absence.
- **GSC live feed into the dashboard** — see above; placeholder until a service
  account is added.

## Access model

Every credential stays with Mark; code ships through pull requests.

- **Deploy** (this file, any future page) — the two GitHub secrets in
  `docs/setup-guide.md`. Code goes up as a PR with a preview URL; merging
  deploys.
- **PostHog install** — the public `phc_` project key, safe to paste and commit.
- **Future dashboard reads** (Cloudflare Analytics, GSC search data) — scoped,
  read-only API tokens created by Mark and stored as Worker secrets, never shown
  to anyone. Detailed click-paths to be written when that Worker is built.
