# Hosting & access

What is known about how slushsisters.com is served, how it was determined, and
what is still unconfirmed.

## Confirmed

| Thing | Value | How it was determined |
| --- | --- | --- |
| DNS | Cloudflare | Authoritative NS are `veda.ns.cloudflare.com` / `zod.ns.cloudflare.com` |
| CDN / proxy | Cloudflare | `server: cloudflare`, `cf-ray`, `cf-cache-status` on every response |
| Site type | Hand-written static HTML, no CMS | 5 standalone `.html` files, all CSS inline in `<style>`, no build output, no framework markers |
| Serving | Cloudflare Workers Static Assets | `/about.html` 307s to `/about`; unknown paths fall back to `index.html` — the Workers assets behavior |
| Email | No MX records on the apex | MX lookup returns SOA only, so no mail is delivered to `@slushsisters.com` |
| `www` | Does not resolve | `www.slushsisters.com` fails DNS resolution |

## Not yet confirmed

The Cloudflare account reachable from this session contains exactly one Worker:

```
drop-b4ff8c50-e5c   created 2026-07-24
```

That is almost certainly the site — it is the only Worker in the account, it was
created the same period the site went up, and its serving behavior matches
production exactly. But the read-only Cloudflare connector available here cannot
list Worker custom domains or routes, so **the binding has not been verified**.

**Verify before the first deploy.** In the Cloudflare dashboard:
Workers & Pages → `drop-b4ff8c50-e5c` → Settings → Domains & Routes. Confirm
`slushsisters.com` is listed.

- If it is → `name` in `wrangler.jsonc` is correct, nothing to change.
- If it is not → find the Worker or Pages project that owns the domain and put
  that name in `wrangler.jsonc` instead.

Deploying under the wrong name creates a second, unrouted Worker. It will not
break the live site, but it will not update it either.

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
