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

**To activate:** create the Slush Sisters project at
<https://us.posthog.com> (project switcher, top-left → New project), then put its
**Project API key** (starts with `phc_`) into `public/analytics.js` in place of
`__POSTHOG_PROJECT_KEY__`. That key is public by design — it ships in the page
source of every PostHog site — so it is safe to commit. Until it is filled in,
the file does nothing.

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

- **`/ideas` is currently indexable.** It is not in the sitemap and is only linked
  from `/inventory`, but it does not carry a `noindex` tag, so a shared or
  guessed URL could get indexed. Recommended fix: make it `noindex` like the
  other orphaned pages. Because `/ideas` is generated by
  `docs/board/generate.js`, this is a generator change, not a hand-edit — a small
  follow-up.
- **GSC → Pages** will show any orphaned URL that Google has actually indexed —
  the cleanest signal that a "private" page leaked into search.
- **Cloudflare AI Crawl Control** shows bots hitting any path, orphaned ones
  included.

## Deferred — decisions and follow-ups

Recorded so they are not lost, in rough priority order.

1. **Edge-logging Worker + custom dashboard.** A small Cloudflare Worker in front
   of the static site that logs every request (path, bot, status, country) to
   Workers Analytics Engine — free tier, no cookies, no page code, COPPA-safe.
   This is the only clean way to get per-path traffic, real crawler logs, and
   **orphaned-page leak monitoring**. It also becomes the data backend for a
   kids'-language dashboard ("who visited us," "who's reading about us," "what
   people googled"). Deferred 2026-08-05 (Mark chose built-ins first); the
   orphaned-page requirement is the strongest reason to pull it forward.
2. **`noindex` on `/ideas`** via the board generator, per above.
3. **Instrument `/ideas` through the generator** — intentionally **not** done;
   `/ideas` is a kids' page, so it stays beacon-free by design. Listed here only
   so no one "fixes" its absence later.
4. **DNS housekeeping** (separate from analytics, noted while in the zone):
   a `www` CNAME + redirect so `www.slushsisters.com` resolves, and SPF + DMARC
   TXT records so nobody can forge `@slushsisters.com` email. Both reversible,
   low-risk; ask and the exact records will be written out.

## Access model

Every credential stays with Mark; code ships through pull requests.

- **Deploy** (this file, any future page) — the two GitHub secrets in
  `docs/setup-guide.md`. Code goes up as a PR with a preview URL; merging
  deploys.
- **PostHog install** — the public `phc_` project key, safe to paste and commit.
- **Future dashboard reads** (Cloudflare Analytics, GSC search data) — scoped,
  read-only API tokens created by Mark and stored as Worker secrets, never shown
  to anyone. Detailed click-paths to be written when that Worker is built.
