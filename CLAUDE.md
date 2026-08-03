# Slush Sisters

The site for slushsisters.com — frozen drink machine rentals in Lakeway, Bee
Cave, and Lake Travis, TX. Run by two sisters, ages 8 and 10. Registered as
Slush Sisters LLC. $275 per rental, delivery and pickup included.

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
