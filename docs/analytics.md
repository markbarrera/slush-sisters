# Analytics & monitoring

How we see what is happening on slushsisters.com — who visits, who crawls, what
people search to find us — and, just as important, the lines we do **not** cross
to get it.

Set up 2026-08-05. Owner: Mark. This is the record of what exists, how to read
each screen, and what is deliberately left for later.

## The rule everything here bends around (and how it changed 2026-08-05)

The site was built cookieless, with the arcade games and kids' pages carrying
**no analytics, no cookies, no capture — ever** — the thing that kept a page a
child plays from making the whole site "directed to children" under COPPA, which
matters because the booking form collects a home address and a phone number for
a child's party.

**Mark changed this on 2026-08-05,** in two steps: (1) turn the marketing/booking
pages up to maximum granularity *with cookies* (for the business dashboard and
for retargeting when ads turn on), and (2) instrument the *game* pages too, to
see which games are popular. Both are deliberate. The practical rule is now:

- **The marketing + booking pages track fully and set cookies** — profiles for
  everyone, DNT ignored, heatmaps, per-booking attribution. (Details under
  PostHog below.)
- **The game pages now load analytics too** (pageviews + a `game_opened` event +
  cookies), but **session recording stays OFF on them** — no screen-replays of
  children — and they still have no accounts, chat, names, or free-text capture.
- **`/party-play` gets nothing** (a printable card, hard-blocked in the loader),
  and **`/ideas`, `/read`, `/inventory` carry no beacon** — they are family
  pages and simply do not include the loader.
- **The booking form's sensitive fields (name, address, phone/email) are masked
  at the source**, so raw contact PII is not duplicated into PostHog even at
  "maximum" granularity.

**The honest consequence of the change:** the site now sets tracking cookies on
pages children use directly *and* collects a child's home address on `/book`
*and* links the arcade from every page. That makes the COPPA posture a real open
question. **One follow-up is outstanding:** a lawyer's review of the posture.

**Cookie consent banner — added 2026-08-05.** A lightweight, self-built consent
notice is now baked into `public/analytics.js` itself. On first visit a banner
at the bottom of the page says what the cookies are for and offers two buttons:
OK or No thanks. The answer is saved in localStorage (not a cookie). If they
decline, PostHog never loads and no cookie is set. If they accept, tracking
works normally. Returning visitors who already chose are never asked again. A
"Cookie settings" link in the footer can re-open the choice via
`window.slushResetConsent()`. This is the visible privacy notice that was
flagged as outstanding — it doesn't replace a lawyer's COPPA review, but it's
the companion a lawyer would want to see.

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

**Tracking posture (changed 2026-08-05, decided by Mark).** The marketing and
booking pages were previously cookieless, DNT-respecting, and profile-free. Mark
asked to track visitors as granularly as possible, with cookies, to power the
business dashboard's per-customer funnel. The posture on those pages is now:

- **Cookies ON.** Durable identity that survives across sessions, so a returning
  visitor is recognized as the same person (`persistence: "localStorage+cookie"`).
- **"Do Not Track" is no longer honored** — DNT browsers are tracked too.
- **A person profile is built for every visitor** (`person_profiles: "always"`),
  so anonymous browsing can be stitched to a booking.
- **identify() on booking.** When the form is submitted, `public/book.html` calls
  `posthog.identify()` with the booking's reference id and its attribution + party
  details — but **not** the name, address, or phone. Raw contact PII stays in the
  booking email and the business database; it is never sent to PostHog.
- **Heatmaps, dead-click and web-vitals capture on.**
- **Session recording on**, inputs visible — **except** the three sensitive
  inputs on `/book` (name, event address, phone/email), which keep the
  `ph-no-capture` class so a customer's home address and phone are not duplicated
  into a third-party replay. **If a new sensitive field is added to any form, give
  it `ph-no-capture` too.**

**The COPPA line did NOT move.** Every game and kid-facing page still carries no
analytics, no cookies, no capture — the route guard in `public/analytics.js`
still refuses to initialize on those paths. Turning cookies on for the rest of
the site makes that separation *more* load-bearing: the site now sets tracking
cookies AND collects a child's home address on `/book` AND links the arcade from
every page. **Two follow-ups this raises, both open:**

- **Legal review is now worth doing, not just "at some point."** The COPPA
  posture and a written privacy/cookie notice (there is none today) should get a
  lawyer's eyes before this is leaned on hard. Instrumenting the *game* pages
  themselves would be a further, separate decision — deliberately not done here.
- **A visible privacy notice** describing the cookies and tracking is the normal
  companion to this posture and does not exist yet.

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
the deferred Worker (below) is for, and monitoring orphaned-page traffic is its
clearest use case.

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

## Deferred — follow-ups

1. **Edge Worker — built; logging paused on one dashboard click.** The Worker
   (`src/worker.js`) runs in front of the static site, serves markdown to
   agents, and is *ready* to log every request (path, crawler, status, coarse
   country — no cookies, no IP, no PII) to the `slush_traffic` Analytics Engine
   dataset. **The Analytics Engine binding is temporarily commented out in
   `wrangler.jsonc`** because it blocks `wrangler deploy` (error 10089) until
   Analytics Engine is enabled once on the account:
   **Cloudflare dashboard → Workers & Pages → Analytics Engine → Enable.** Once
   enabled, un-comment the `analytics_engine_datasets` block and logging turns
   on (the Worker no-ops logging until then, so serving and markdown are
   unaffected). Query the log with the Analytics Engine SQL API, e.g.
   `SELECT blob1 AS path, blob2 AS crawler, sum(_sample_interval) AS hits FROM
   slush_traffic WHERE timestamp > NOW() - INTERVAL '7' DAY GROUP BY path,
   crawler ORDER BY hits DESC`.
   **Still to come — the dashboard phase:** the kids'-language page that reads
   this log plus GSC and PostHog. Needs the three read-only credentials in
   "How the future dashboard gets its data" above.
   **Also in this one Worker:** the booking-email handler (`POST /api/book`),
   merged in from the booking-form work so the site keeps a single `main`
   Worker. It is paused the same way (the `send_email` binding is commented
   until Email Routing is verified) — see `docs/booking-worker.md`.
2. **Instrument `/ideas`** — intentionally **not** done; it is a kids' page, so
   it stays beacon-free by design. Listed only so no one "fixes" its absence.
3. **DNS records** (approved 2026-08-05; Mark applies these in Cloudflare — this
   session cannot write DNS). All are low-risk and reversible.
   - **`www` redirect.** DNS → Add record: Type `CNAME`, Name `www`, Target
     `slushsisters.com`, Proxy **on** (orange cloud). Then Rules → Redirect Rules
     → Create: when hostname equals `www.slushsisters.com`, redirect (301) to
     `https://slushsisters.com` preserving path and query.
   - **SPF** (the domain sends no mail, so authorize nobody). DNS → Add record:
     Type `TXT`, Name `@`, Content `v=spf1 -all`.
   - **DMARC** (reject anything that fails). DNS → Add record: Type `TXT`, Name
     `_dmarc`, Content `v=DMARC1; p=reject; sp=reject; aspf=s; adkim=s`.
   - **Optional null MX** (states plainly that the domain accepts no mail). DNS →
     Add record: Type `MX`, Name `@`, Mail server `.`, Priority `0`.

## Access model

Every credential stays with Mark; code ships through pull requests.

- **Deploy** (this file, any future page) — the two GitHub secrets in
  `docs/setup-guide.md`. Code goes up as a PR with a preview URL; merging
  deploys.
- **PostHog install** — the public `phc_` project key, safe to paste and commit.
- **Future dashboard reads** (Cloudflare Analytics, GSC search data) — scoped,
  read-only API tokens created by Mark and stored as Worker secrets, never shown
  to anyone. Detailed click-paths to be written when that Worker is built.
