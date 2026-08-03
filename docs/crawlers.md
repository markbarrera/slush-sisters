# Crawler access

The goal is that nothing is blocked. Search crawlers, AI assistants, and social
link-preview fetchers should all be able to read the whole site.

## Current state: nothing is blocked

Tested against the live site on 2026-08-03 by requesting the homepage with each
crawler's user-agent string:

| Crawler | Response |
| --- | --- |
| Googlebot | 200, full page |
| Bingbot | 200, full page |
| GPTBot (OpenAI) | 200, full page |
| ClaudeBot (Anthropic) | 200, full page |
| PerplexityBot | 200, full page |
| Applebot | 200, full page |
| facebookexternalhit (link previews) | 200, full page |
| Twitterbot | 200, full page |
| Plain `curl` with no user-agent | 200, full page |

No challenge pages, no 403s, no JavaScript interstitials. Whatever Cloudflare
settings are on the zone today, they are not interfering.

One caveat on how much that proves: these requests carried crawler user-agent
strings but did not come from those crawlers' real IP ranges. Cloudflare
verifies well-known bots by IP and reverse DNS, so this test confirms that no
blanket rule is blocking on user-agent — the most common way a small site
accidentally shuts crawlers out. It does not fully rule out an IP-reputation
rule. If a crawler ever does get blocked, the Cloudflare **Security → Events**
log is where it will show, and it names the specific rule.

## robots.txt

`public/robots.txt` allows everything, and names the major search, AI, and
social crawlers explicitly. The explicit list is not technically necessary —
`User-agent: * / Allow: /` already covers them — but it makes the intent
obvious, so a future blanket `Disallow` does not quietly cut off channels that
matter.

AI crawler access is deliberate. "Who rents margarita machines near Lakeway" is
increasingly answered by an assistant rather than a list of ten links, and being
readable is a prerequisite for being the answer.

## Settings to leave alone in the Cloudflare dashboard

`robots.txt` only governs crawlers that choose to obey it. Cloudflare's bot
features sit *in front* of it and can block a crawler before it ever reads the
file. Three settings decide this. All three are currently fine — this is a list
of what not to turn on.

Dashboard → select `slushsisters.com` → **Security**:

1. **Bots → Bot Fight Mode — leave OFF.** It challenges traffic it scores as
   automated, and it is indiscriminate: it regularly catches link-preview
   fetchers and smaller AI crawlers. For a site that wants to be scraped and
   previewed, it is the single most damaging toggle available.
2. **Bots → AI Scrapers and Crawlers — leave OFF** (do not "Block AI bots").
   This one exists specifically to block GPTBot, ClaudeBot, PerplexityBot and
   friends. Turning it on undoes the AI-discovery strategy in one click.
3. **WAF → Managed Rules and any custom rules — no rule matching on user-agent
   or "known bots".** If a rule is ever added to stop spam, scope it to the
   booking endpoint rather than the whole zone.

There is nothing worth protecting here. The site is five pages of public
marketing copy about a party rental business. The risk of being over-blocked is
real; the risk of being over-crawled is not.

## If a crawler does get blocked

1. Cloudflare dashboard → `slushsisters.com` → **Security → Events**. Filter to
   the last 24 hours. Blocked requests appear with the rule that stopped them.
2. Google Search Console → **Settings → Crawl stats** shows Googlebot's view
   specifically, including host-level fetch errors.
3. Reproduce it from a terminal:
   ```sh
   curl -sS -D- -o /dev/null \
     -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
     https://slushsisters.com/
   ```
   A `200` is healthy. A `403`, or HTML containing "Checking your browser", means
   a Cloudflare rule is intercepting.
