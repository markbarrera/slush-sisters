# Slush Sisters

The site for slushsisters.com — frozen drink machine rentals in Lakeway, Bee
Cave, and Lake Travis, TX. Run by two sisters: **Harper is 11, Finley is 8** — get this the right way round, it was
published backwards across the whole site once. Registered as
Slush Sisters LLC. $250 per rental, delivery and pickup included.

## Stack

Static HTML on Cloudflare Workers Static Assets, with one small edge Worker in
front. No build step, no framework, no CMS, no dependencies in the pages.

- `public/` — the site. Each page is one self-contained `.html` file with its
  CSS inline in a `<style>` block.
- `src/worker.js` — the one bit of server code. It runs on every request
  (`run_worker_first`), then serves the file unchanged via `env.ASSETS`. It does
  four things: logs each request to Analytics Engine (crawler/traffic/leak
  visibility), emails bookings (`POST /api/book` → Email Routing), serves a
  markdown version to AI agents, and 301s `www` → apex. It sets no cookies,
  stores no PII, and runs no code in the visitor's browser, so it does not touch
  the COPPA line. Full detail in `docs/analytics.md` and `docs/booking-worker.md`.
  **Do not "simplify" the site back to pure static assets** — the Worker is
  deliberate.
- `wrangler.jsonc` — deploy config. The `name` field must match the Worker that
  owns the `slushsisters.com` domain; see `docs/hosting.md`.
- `.github/workflows/` — deploy on merge to `main`, preview on PR.

Keep it this way unless there is a concrete reason not to. The site is a few
dozen pages of static content plus the one logging/booking Worker. Still no
build step — a heavier toolchain would cost more than it returns.

## Working on it

```
npm install
npm run dev      # local server with production routing rules
```

`main` is live. Merging to `main` deploys. Open a PR and the workflow comments a
preview URL that does not touch production traffic.

## Conventions

- CSS stays inline per page. The pages share a visual system but not a
  stylesheet; when you change the header, footer, or button styles, change them
  in every page that has them.
- **The visual system lives in `docs/brand.md`** — the full color tokens, the
  type rules, the voice, and the imagery direction, in one place (there is no
  shared stylesheet, so that doc is where the system exists as a whole). Read it
  before changing anything visual. The load-bearing basics: `--brand` `#1a237e`
  deep blue, `--ice` `#4fc3f7` light blue, `--wash` `#e8f4fd` pale blue
  background, `--pop` `#ff4081` pink.
- **The brand character is "Slushie"** (`public/img/slushie.svg`) — a slushie
  *cup* with a face, **never a child**, so every asset stays about the product.
  It is a first pass the girls are meant to redraw in their own style, the way
  they chose the colors. The identity is **illustration-led, not stock photos**,
  and there is **no glossy alcohol-cocktail imagery** (it makes a kids' business
  read like a liquor ad) — go fruit-and-cup instead. Full reasoning in
  `docs/visual-identity.md`.
- Fonts: **Baloo 2** for headings and the wordmark, DM Sans for body. Baloo 2
  runs 400–800 — never ask for 900, it triggers faux-bold synthesis, which
  thickens strokes unevenly and is exactly what an embroiderer cannot use.
  Sour Gummy was replaced 2026-08-04: its zero is permanently slashed (three
  contours, no alternate glyph, no feature to toggle it), so every price on
  the site looked like code, and it had no tabular figures.
- **Numbers that line up in a column use `.tabular`.** DM Sans has no tabular
  figures at all — no `tnum` feature and a 93% digit-width spread — so
  `font-variant-numeric: tabular-nums` on it silently does nothing. The
  utility switches to Baloo 2, which has them.
- **US English everywhere on the site.** color, neighborhood, flavor, favorite,
  organizer, center, license, math. The site had drifted British — "colour"
  appeared 123 times — and was converted 2026-08-04. Idiom counts too: "on the
  weekend", not "at the weekend"; "candy", not "sweets"; "mom", not "mum".
  This applies to `public/`, to `docs/board/*.js` which generate pages, and to
  the `/read` slugs. Internal notes in `docs/*.md` are not held to it.
- Copy is written plainly and in the sisters' own voice — first person, short
  sentences, no marketing throat-clearing. Match it.
- The candy garnish on every cup is the differentiator. It appears on most
  pages on purpose.
- **"How did you hear about us" always keeps an open-ended box.** A dropdown is
  fine for structure, but it must never be the only option — the specific,
  in-their-own-words answer ("Sarah at the Belterra pool") is the useful one,
  and analytics already covers the generic referrer. Never force a customer
  into a bucket that does not fit. This is a standing form rule, not just the
  booking page.
- **Serve both markets — grown-ups, kids, and mixed parties — without swaying.**
  The machine holds two flavors; which two is always the customer's call: two
  grown-up drinks, two with no alcohol, or one of each. The no-alcohol / kids'
  tank is an option we are glad to offer at no extra cost (it is rule one of the
  seven on `/our-rules`), **never a default we assume or push**. Do not frame
  the site — or any single page — as kid-first or adult-first. `/our-rules`
  rule 1 is the balanced model; `about` and `flavors` were rebalanced to match
  it 2026-08-05 after they leaned too far toward kids.

## Mobile first — this is the default, not a checkbox

Nearly everyone arrives on a phone: from a bio link, a text message, a
neighbourhood Facebook post, a shared story. Desktop is the exception. Build
and judge every page at **390px wide first**, then let it grow.

What that means in practice:

- **Design the phone layout, then add the desktop one.** Use `min-width` media
  queries, so the base CSS *is* the mobile CSS. The site currently does the
  opposite — six ad-hoc `max-width` breakpoints (440, 480, 500, 540, 600, 700)
  that treat mobile as a series of exceptions. Move toward `min-width` on any
  page you touch; don't rewrite all thirteen in one go.
- **The primary action is never behind a tap.** "Book" stays visible in the
  header at every width. It must never live only inside the ☰ menu — that was a
  real defect, fixed 2026-08-04.
- **Tap targets are at least 44×44px.** Anything smaller gets missed by a thumb.
- **Never scroll sideways.** Check `scrollWidth <= innerWidth` at 390px.
- **Something real is visible without scrolling.** A headline, a photo of the
  girls, and a button — not a headline that fills the screen on its own.
- **Weigh every kilobyte.** Photos go through `<picture>` with 640px WebP for
  phones. Do not hardcode a 1024px image and let the phone download it.
- **Verify on a phone viewport, don't assume.** `scripts/snapshot.js` renders
  every page at 390px. Look at the output before saying it works.

Different visitors arrive by different routes and want different things —
see `docs/case-review.md` Part 3 for the entry-point map.

## Marketing and content

`docs/marketing.md` is the playbook — strategy, campaigns, the content idea
bank, how to ride trends, and the safety rules, deliberately in one file. The
girls read the strategy too; splitting the thinking from the doing would gate
them out of the part that actually teaches something.

Three things it argues that are easy to get wrong:

- Neighbourhood Facebook groups convert better than either social or search for
  a kids' party rental.
- People share videos about two kids running a real business, not videos about
  slushies.
- It cannot all be selling. Roughly half of what they post should have nothing
  to do with the product, or the only followers are people who already want one.

It is a living document — record what was tried and how it went.

`docs/big-ideas.md` holds the ambitious swings — the annual report, the public
ledger, Dad's performance review, the realtor circuit, Chapters. Higher ceiling,
some need a grown-up to make a call first.

`docs/product-tiers.md` is the biggest product idea on the table: a second,
premium tier made with fresh-squeezed citrus rather than bulk syrup, aimed at
the Lake Austin market, plus a no-artificial-dye version for kids' parties. Read
the freeze-test warning before building anything on it — low-sugar mixes can
freeze too hard for the machine.

`docs/board/generate.js` builds the visual idea board the girls actually use,
and `docs/board/reading-room.js` builds `/read` — every document in `docs/`
rewritten as cards they can read, in their language rather than a grown-up's.

**Every deliverable gets a version in the reading room.** A strategy document
that only exists in Markdown, written for an adult, has not been delivered to
the people who own this business. Write the grown-up version, then add it to
`reading-room.js` and regenerate. Rewrite, do not simplify — leave the hard
numbers and the arguments in, including both sides of each one.

`scripts/build-inventory.js` builds `/inventory` — one orphan page listing
every page on the site and every document in `docs/`, so the whole body of work
can be reviewed from one place. **Run `npm run inventory` after adding or
removing a page or a doc.** It reads titles, descriptions, word counts and
dates off the files and out of git, so nothing is typed by hand and it cannot
quietly go out of date — but it does have to be re-run to pick up new files.

## The arcade (games)

A small, **growing** collection of little games and toys, built to be shown to
the girls' friends and put on the party table as a QR code — local and social,
not "viral to kids everywhere." Mark's steer (2026-08-05): the arcade grows over
time, and he most likes the **interactive, character-driven, Toca-Boca kind** —
a character that moves and reacts, not a button you press. See `docs/game.md`
for the full scope, the tier plan, and the COPPA reasoning.

- **`/play`** is the arcade hub — a menu that points at every game.
- **`/slushie-playhouse`** — a *toy* (no score, no timer): make a slushie (pour
  flavors that mix, drop candy, add a straw), hand it to **Slushie**, who drinks
  it and reacts — brain freeze, sugar rush, turns the flavor's color. Poke it and
  it giggles; drag it and it wobbles.
- **`/slushie-catch`** — move Slushie side to side to catch falling fruit and
  candy, dodge the sour lemons. Solo, high score on the device.
- **`/slushie-style`** — a dress-up *toy*: hats, glasses, colors, bows, poses.
- **`/slush-rush`** — the fast one. Read the order, build the cup against a
  clock, serve. Solo, high score on the device.
- **`/slushie-street`** — a slushie-stand tycoon: a solo idle/builder with saved
  progress and offline earnings, plus a same-device **2-player race** (split
  screen, 60 seconds, most money wins). This is game tier 2 (same iPad); tier 3
  (friends in a shared room from different houses) needs a real-time backend and
  **is a dad decision** — it puts a running service in Mark's life. Not built.
- **`/slushie-guys`** — the big one the girls asked for: a Stumble-Guys-style
  **obstacle-course race** (canvas platformer — run, jump, dodge swinging
  hammers / spinners / gaps, ride moving platforms, beat AI rival slushies to
  the finish). Three courses, best time per course on the device. Single-player
  vs AI; **real online-with-friends multiplayer is the tier-3 backend / dad
  decision** above, not built. This is the most in-depth game — heavier than the
  others by design.

Each game is one self-contained HTML file, same as a page. **They are orphaned
like `/read`: `noindex`, not in the footer, sitemap or `scripts/snapshot.js`
set.** (`/play`, the hub, *is* in the main nav — see the standing decision
below.)

**The COPPA line moved twice — 2026-08-05 and 2026-08-20. Read this
carefully.** The games originally carried **no analytics, no cookies, no
capture — ever**. On 2026-08-05 Mark asked to measure which games are popular
and accepted instrumenting them (pageviews, `game_opened`, cookies). On
**2026-08-20 Mark refined that**: game pages keep the tracking but **must not
set cookies** — the loader now runs PostHog on game paths in memory-only
persistence (nothing written to cookies OR localStorage, no person profiles,
no autocapture/heatmaps), counting pageviews and `game_opened` anonymously,
and shows **no consent banner** on game pages (nothing is stored, so there is
nothing to consent to). So the current intended state is: games ARE
instrumented, **cookielessly**. Do not "restore" either old version — not the
no-analytics-ever one, and not the cookies-on-games one.

What **still** holds on game pages, and must not drift: **no accounts, no chat,
no names, no free-text a child types is captured, and session recording is OFF**
(the loader disables it on game paths). The only thing stored is a high score /
save game, in the browser, on the device. The cookieless change moved game
analytics inside COPPA's "support for internal operations" exception; the
remaining COPPA questions are the arcade's nav placement plus `/book`
collecting a home address — a lawyer's review of that remaining posture is
still outstanding, with `docs/privacy-compliance.md` as the briefing. The
visible privacy/cookie notice exists now (`/privacy`, added 2026-08-20).

When you add a game: build it, keep it one self-contained file, hold the reduced
line above (no accounts/chat/names, recording off), include
`<script src="/analytics.js" defer></script>` so its opens are counted, add a
card to `/play`, note it in `docs/game.md`, and run `npm run inventory`.

**How the arcade is reached — a standing decision (updated 2026-08-05).** The
arcade (`/play`) is linked from the **main site nav** on every page ("Arcade",
before the Book button). Mark asked for this explicitly, **accepting the COPPA
tradeoff**: prominently linking games for 8–12s from every page is a signal a
site is "directed to children," and the booking form collects a home address and
phone, so the footing matters — Mark made the call to accept it after the
tradeoff was laid out in full. (Earlier in the day the decision was the opposite
— reached only adult-mediated — so if you see conflicting older notes, **the nav
link is the current, intended state**; do not "restore" the orphaned version.)
Worth a lawyer's review of the COPPA posture at some point given the booking
form. The individual game pages stay `noindex` and out of the sitemap; only the
human-facing nav link changed. The other reach paths still exist too: a link on
the booking confirmation (`/book`) and **`/party-play`**, a printable table card
with a QR to `/play` for the party table.

## Before changing anything

Read `docs/site-audit.md`. Several things that look intentional are broken —
most importantly the booking form, which displays a success message without
submitting anything anywhere.

## Who you are talking to

Mark owns this repo but is not a web developer, and the business is run by his
two daughters, Harper (11) and Finley (8). Any of the three may be the one asking.

Explain things accordingly, every time — this is a standing instruction, not a
one-off request:

- **Never assume a dashboard is familiar.** Give the direct URL, name the exact
  button, and say what the screen should look like when it worked. Do not write
  "add the secret in repo settings" — write the click path. `docs/setup-guide.md`
  is the model for this level of detail.
- **Say what a thing is before saying what to do with it.** An API token, a DNS
  record, and a pull request all need one plain sentence of context first.
- **Name the stakes honestly and proportionally.** Distinguish "this is
  reversible, try it" from "this one is worth double-checking." Do not make
  low-risk steps sound scary or high-risk steps sound casual.
- **No unexplained jargon.** If a term is unavoidable, define it in the sentence
  where it first appears.
- **Never be condescending.** Simple language, full respect. These are real
  business decisions being made by the people who own the business.

When the girls are the ones asking, they can describe what they want changed in
plain language — wording, colors, flavors, photos, page copy. Do the technical
translation without making them learn it first, and show them the preview URL
rather than a diff.

## What stays with Mark

Some things should not be actioned on a child's say-so, even with a clear
request. If one of these comes up in a session with the girls, say plainly that
it is a dad decision and move on:

- Anything involving the Cloudflare API token, GitHub secrets, or passwords
- DNS changes, domain registration, or renewals
- Anything that costs money or changes the price on the site
- Where customer bookings get delivered, and who can read them — the form
  collects a home address and a phone number for a child's party

Content, copy, design, flavors, and photos are fair game.
