# Hosting & access

What is known about how slushsisters.com is served, how it was determined, and
what is still unconfirmed.

## Confirmed

| Thing | Value | How it was determined |
| --- | --- | --- |
| DNS | Cloudflare | Authoritative NS are `veda.ns.cloudflare.com` / `zod.ns.cloudflare.com` |
| CDN / proxy | Cloudflare | `server: cloudflare`, `cf-ray`, `cf-cache-status` on every response |
| Site type | Hand-written static HTML + one edge Worker | Standalone `.html` files, CSS inline; `src/worker.js` runs in front of them (request logging, booking email, markdown-for-agents, www redirect) |
| Serving | Workers Static Assets behind `src/worker.js` | `run_worker_first: true` so the Worker runs on every request, then serves the file via `env.ASSETS`; `/about.html` still 307s to `/about`, unknown paths still 404 |
| Email | Cloudflare Email Routing (inbound) | MX = `route1/2/3.mx.cloudflare.net`, forwards to a verified destination. SPF + DKIM present, DMARC `p=reject` (set 2026-08-05) |
| `www` | Resolves, 301s to apex | `www.slushsisters.com` is a Worker route; `src/worker.js` redirects it to the bare domain, preserving path + query (2026-08-05) |

## Worker binding — confirmed 2026-08-05

`drop-b4ff8c50-e5c` (created 2026-07-24) is the site's Worker. Confirmed by
deploying to it and watching production change, and by the Domains & Routes
screen: it owns `slushsisters.com` and now `www.slushsisters.com/*` as a route.
`name` in `wrangler.jsonc` is correct.

The Worker is no longer a pass-through — `src/worker.js` is the one bit of server
code (logging, booking email, markdown-for-agents, www redirect). The pages are
still static; see `docs/analytics.md` and `docs/booking-worker.md`.

## Account-level toggles that had to be enabled once

Two features are off by default on a new account and each blocks `wrangler
deploy` (with a specific error) until enabled in the dashboard — worth knowing,
because the error is opaque:

- **Analytics Engine** — enable at Workers & Pages → Analytics Engine → Enable.
  Until then, an `analytics_engine_datasets` binding fails deploy with **error
  10089**. Enabled 2026-08-05.
- **Email Routing** — enable at `slushsisters.com` → Email → Email Routing, and
  verify a destination address. Until then, a `send_email` binding fails deploy.
  Enabled + verified (`mark@markbarrera.com`) 2026-08-05.

## Access needed for automated deploys

Two GitHub Actions secrets, at
`Settings → Secrets and variables → Actions` in this repo:

| Secret | Where to get it |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare dashboard → My Profile → API Tokens → Create Token → **Edit Cloudflare Workers** template, scoped to this account |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → Workers & Pages → Account ID in the right sidebar |

Scope the token to Workers only. It does not need DNS, zone, or billing
permissions for the deploy workflows in this repo to work.

## Deploy model

- `main` is the live site. Merging to `main` publishes.
- Opening a PR uploads a preview version and comments the URL on the PR.
  Production traffic does not move until the PR merges.
- `npm run dev` serves `public/` locally with the same routing rules production
  uses.

## Registrar

Unconfirmed. The domain uses Cloudflare nameservers, which is also true when
Cloudflare is only doing DNS for a domain registered elsewhere. Check
Cloudflare → Domain Registration to see whether the registration itself lives
there.
