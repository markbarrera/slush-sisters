# Slush Sisters

The site for slushsisters.com — frozen drink machine rentals in Lakeway, Bee
Cave, and Lake Travis, TX. Run by two sisters, ages 8 and 10. Registered as
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

## Before changing anything

Read `docs/site-audit.md`. Several things that look intentional are broken —
most importantly the booking form, which displays a success message without
submitting anything anywhere.

## Who you are talking to

Mark owns this repo but is not a web developer, and the business is run by his
two daughters, ages 8 and 10. Any of the three may be the one asking.

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
