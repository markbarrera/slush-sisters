# slushsisters.com

Source for [slushsisters.com](https://slushsisters.com) — frozen drink machine
rentals in Lakeway, Bee Cave, and Lake Travis, TX.

The live site predates this repo. The pages in `public/` were recovered from
production on 2026-08-03 and are a byte-faithful copy of what was serving at
that time, so this repo is now the source of truth.

## Layout

```
public/              the site — one self-contained HTML file per page
wrangler.jsonc       Cloudflare deploy config
docs/setup-guide.md  one-time setup, step by step
docs/hosting.md      how the site is served, and what access deploys need
docs/site-audit.md   known problems with the live site
docs/strategy.md     what the site is for, and the keyword research
docs/marketing.md    marketing plan — channels, campaigns, calendar
docs/content-ideas.md  content idea bank, written for the girls
docs/origin-story.md  plan and interview questions for the origin story page
```

## First time here?

Start with [`docs/setup-guide.md`](docs/setup-guide.md). It walks through the
one-time setup click by click, and assumes no prior experience with Cloudflare
or GitHub.

## Deploying

`main` is the live site. Merging to `main` publishes it. Opening a PR uploads a
preview version and comments the URL, without moving production traffic.

Two GitHub Actions secrets are required before either workflow can run —
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. See
[`docs/setup-guide.md`](docs/setup-guide.md).

## Local development

```
npm install
npm run dev
```

This serves `public/` with the same routing rules production uses, so
extensionless URLs and the 404 page behave the way they will once deployed.
