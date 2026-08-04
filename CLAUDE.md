# Slush Sisters

The site for slushsisters.com — frozen drink machine rentals in Lakeway, Bee
Cave, and Lake Travis, TX. Run by two sisters, ages 8 and 11. Registered as
Slush Sisters LLC. $250 per rental, delivery and pickup included.

## Stack

Static HTML on Cloudflare Workers Static Assets. That is the whole stack — no
build step, no framework, no CMS, no dependencies in the pages themselves.

- `public/` — the site. Each page is one self-contained `.html` file with its
  CSS inline in a `<style>` block.
- `wrangler.jsonc` — deploy config. The `name` field must match the Worker that
  owns the `slushsisters.com` domain; see `docs/hosting.md`.
- `.github/workflows/` — deploy on merge to `main`, preview on PR.

Keep it this way unless there is a concrete reason not to. The site is five
pages of static content that changes a few times a year. A build step would cost
more than it returns.

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
- Brand colors: `#1a237e` deep blue, `#4fc3f7` light blue, `#e8f4fd` pale blue
  background.
- Fonts: Sour Gummy for headings and the wordmark, DM Sans for body.
- Copy is written plainly and in the sisters' own voice — first person, short
  sentences, no marketing throat-clearing. Match it.
- The candy garnish on every cup is the differentiator. It appears on most
  pages on purpose.

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

## Before changing anything

Read `docs/site-audit.md`. Several things that look intentional are broken —
most importantly the booking form, which displays a success message without
submitting anything anywhere.

## Who you are talking to

Mark owns this repo but is not a web developer, and the business is run by his
two daughters, ages 8 and 11. Any of the three may be the one asking.

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
